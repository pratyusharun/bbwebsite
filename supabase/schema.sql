-- ───────────────────────────────────────────────────────────────
-- BYTE BRAINIACS: ML SHOWDOWN — Normalized Supabase schema (v2)
-- "Intelligence Meets Competition"
--
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query).
-- This is a FRESH-START schema (no migration from the old single table).
--
-- Model (normalized, proper relationships):
--   teams           one row per competition team (registration OR grouped)
--   participants    one row per person, FK → teams
--   registrations   audit/event log, one row per public form submission
--
-- Team numbers (BB_1, BB_2 …) are generated SERVER-SIDE and atomically
-- via a dedicated sequence inside SECURITY DEFINER functions, so they are
-- always unique and never duplicated, even under concurrent submissions.
-- ───────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- Drop in dependency order (safe to re-run during setup).
drop view  if exists public.participant_rows cascade;
drop table if exists public.registrations    cascade;
drop table if exists public.participants      cascade;
drop table if exists public.teams             cascade;
drop table if exists public.app_settings      cascade;
drop sequence if exists public.team_number_seq;

-- ── Sequence powering BB_<n> team numbers ──────────────────────
create sequence public.team_number_seq start 1 increment 1;

-- ── Table: app_settings (key/value config; e.g. auto_approve) ──
create table public.app_settings (
  key   text primary key,
  value text not null
);
insert into public.app_settings(key, value)
values ('auto_approve', 'true')
on conflict (key) do nothing;

-- ── Table: teams ───────────────────────────────────────────────
create table public.teams (
  id                uuid primary key default gen_random_uuid(),
  team_number       text not null unique,                 -- e.g. BB_1
  team_name         text not null,
  registration_type text not null
                      check (registration_type in ('SOLO','DUO','TEAM','GROUPED')),
  college           text,
  course            text,
  mobile_number     text,
  agreed_terms      boolean not null default true,
  is_grouped        boolean not null default false,        -- formed from solos
  status            text not null default 'approved'        -- approval state
                      check (status in ('pending','approved')),
  source            text not null default 'registration'   -- registration | admin
                      check (source in ('registration','admin')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index teams_created_at_idx on public.teams (created_at desc);
create index teams_type_idx       on public.teams (registration_type);
create unique index teams_name_key on public.teams (lower(team_name));

-- ── Table: participants ────────────────────────────────────────
create table public.participants (
  id                uuid primary key default gen_random_uuid(),
  team_id           uuid not null references public.teams(id) on delete cascade,
  name              text not null,
  email             text not null,
  phone             text,                                  -- per-participant mobile
  slot              int  not null default 1,               -- position in team
  registration_type text not null default 'TEAM'           -- type they entered as
                      check (registration_type in ('SOLO','DUO','TEAM','GROUPED')),
  is_grouped        boolean not null default false,
  created_at        timestamptz not null default now(),

  constraint participant_email_format
    check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

create index participants_team_id_idx on public.participants (team_id);
create unique index participants_email_key on public.participants (lower(email));

-- ── Table: registrations (audit / event log) ───────────────────
create table public.registrations (
  id                uuid primary key default gen_random_uuid(),
  team_id           uuid not null references public.teams(id) on delete cascade,
  team_number       text not null,
  registration_type text not null,
  participant_count int  not null default 1,
  created_at        timestamptz not null default now()
);

create index registrations_created_at_idx on public.registrations (created_at desc);

-- ── keep updated_at fresh on teams ─────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists teams_touch on public.teams;
create trigger teams_touch before update on public.teams
  for each row execute function public.touch_updated_at();

-- ── RPC: register_team — atomic public registration ────────────
-- p_participants: jsonb array like
--   [{"name":"Rahul","email":"rahul@x.com","slot":1}, …]
create or replace function public.register_team(
  p_team_name        text,
  p_registration_type text,
  p_college          text,
  p_course           text,
  p_mobile           text,
  p_agreed           boolean,
  p_participants     jsonb
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_num     text;
  v_team_id uuid;
  v_p       jsonb;
  v_auto    text;
  v_status  text;
begin
  v_num := 'BB_' || nextval('public.team_number_seq');

  -- Decide approval status from the auto_approve setting.
  select value into v_auto from public.app_settings where key = 'auto_approve';
  v_status := case when coalesce(v_auto, 'true') = 'true' then 'approved' else 'pending' end;

  insert into public.teams(
    team_number, team_name, registration_type,
    college, course, mobile_number, agreed_terms, is_grouped, status, source)
  values (
    v_num, p_team_name, p_registration_type,
    p_college, p_course, p_mobile, coalesce(p_agreed, true), false, v_status, 'registration')
  returning id into v_team_id;

  for v_p in select * from jsonb_array_elements(p_participants)
  loop
    insert into public.participants(team_id, name, email, phone, slot, registration_type)
    values (
      v_team_id,
      btrim(v_p->>'name'),
      lower(btrim(v_p->>'email')),
      nullif(btrim(v_p->>'phone'), ''),
      coalesce((v_p->>'slot')::int, 1),
      p_registration_type);
  end loop;

  insert into public.registrations(team_id, team_number, registration_type, participant_count)
  values (v_team_id, v_num, p_registration_type, jsonb_array_length(p_participants));

  return v_num;
end;
$$;

-- ── RPC: group_solos — admin combines solo participants into a team ──
create or replace function public.group_solos(
  p_participant_ids uuid[],
  p_team_name       text default null
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_num     text;
  v_team_id uuid;
  v_name    text;
  v_old_ids uuid[];
begin
  if array_length(p_participant_ids, 1) is null then
    raise exception 'No participants supplied';
  end if;

  v_num  := 'BB_' || nextval('public.team_number_seq');
  v_name := coalesce(nullif(btrim(p_team_name), ''), 'Squad ' || v_num);

  insert into public.teams(team_number, team_name, registration_type, is_grouped, source)
  values (v_num, v_name, 'GROUPED', true, 'admin')
  returning id into v_team_id;

  select array_agg(distinct team_id) into v_old_ids
  from public.participants where id = any(p_participant_ids);

  update public.participants p
  set team_id = v_team_id, is_grouped = true, slot = sub.rn
  from (
    select id, row_number() over (order by created_at) as rn
    from public.participants where id = any(p_participant_ids)
  ) sub
  where p.id = sub.id;

  -- Remove now-empty origin (solo/duo) teams.
  delete from public.teams t
  where t.id = any(v_old_ids)
    and t.id <> v_team_id
    and not exists (select 1 from public.participants p where p.team_id = t.id);

  -- Recompute type for remaining origin teams (e.g. a duo that lost a member
  -- and is left with one participant becomes SOLO). Grouped teams are skipped.
  update public.teams t
  set registration_type = case c.n when 1 then 'SOLO' when 2 then 'DUO' else 'TEAM' end
  from (
    select team_id, count(*) as n
    from public.participants
    where team_id = any(v_old_ids)
    group by team_id
  ) c
  where t.id = c.team_id
    and t.id <> v_team_id
    and t.is_grouped = false;

  return v_num;
end;
$$;

-- ── Flattened view for the participants admin page / exports ───
create or replace view public.participant_rows as
select
  p.id               as participant_id,
  p.team_id          as team_id,
  t.team_number      as team_number,
  t.team_name        as team_name,
  p.name             as participant_name,
  p.email            as participant_email,
  p.phone            as participant_phone,
  p.slot             as slot,
  coalesce(p.registration_type, t.registration_type) as registration_type,
  t.is_grouped       as is_grouped,
  t.status           as status,
  t.college          as college,
  t.course           as course,
  p.created_at       as created_at
from public.participants p
join public.teams t on t.id = p.team_id;

-- ── Row Level Security ─────────────────────────────────────────
-- RLS ON, no public policies. The anon/public key cannot read or write.
-- All access is server-side via the SERVICE ROLE key (bypasses RLS) and
-- the SECURITY DEFINER RPCs above.
alter table public.teams         enable row level security;
alter table public.participants  enable row level security;
alter table public.registrations enable row level security;
alter table public.app_settings  enable row level security;

-- Allow the trusted server (service role) to execute the RPCs.
grant execute on function public.register_team(text,text,text,text,text,boolean,jsonb) to service_role;
grant execute on function public.group_solos(uuid[], text) to service_role;

-- ── Verify ─────────────────────────────────────────────────────
-- select public.register_team('Gradient Descenders','DUO','NM College','B.Sc IT','9876543210',true,
--   '[{"name":"Rahul","email":"rahul@x.com","phone":"9876543210","slot":1},
--     {"name":"Priya","email":"priya@x.com","phone":"9876500000","slot":2}]');
-- select * from public.participant_rows;

-- ── Reset the BB_<n> team-number counter ───────────────────────
-- The sequence keeps climbing even after teams are deleted, so numbers can
-- develop gaps (e.g. BB_5 after deleting BB_3, BB_4). Run ONE of these:
--
-- 1) Hard reset — next registration becomes BB_1.
--    Only use after clearing all teams (otherwise you'll hit unique clashes):
--      truncate table public.teams cascade;   -- optional: wipe teams first
--      alter sequence public.team_number_seq restart with 1;
--
-- 2) Close the gap — set the counter to (highest existing number + 1) so the
--    next team continues right after the current max, with no wasted numbers:
--      select setval(
--        'public.team_number_seq',
--        coalesce(max((substring(team_number from 'BB_([0-9]+)'))::int), 0),
--        true   -- next nextval() returns max+1
--      )
--      from public.teams;
