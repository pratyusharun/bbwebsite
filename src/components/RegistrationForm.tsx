"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  Users,
  UsersRound,
  Copy,
  Check,
} from "lucide-react";
import { registerTeam, type RegisterState } from "@/app/actions/register";
import { cn } from "@/lib/utils";

const initial: RegisterState = { status: "idle" };

type Mode = "SOLO" | "DUO" | "TEAM";

const MODES: { key: Mode; label: string; size: string; icon: typeof User }[] = [
  { key: "SOLO", label: "Solo", size: "1 participant", icon: User },
  { key: "DUO", label: "Duo", size: "2 participants", icon: Users },
  { key: "TEAM", label: "Team", size: "3 participants", icon: UsersRound },
];

function Input({
  label,
  name,
  type = "text",
  placeholder,
  required = true,
  optional = false,
  inputMode,
  value,
  onChange,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  inputMode?: "text" | "email" | "tel" | "numeric";
  value?: string;
  onChange?: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="group flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="font-mono text-[11px] uppercase tracking-wider2 text-platinum-muted transition-colors group-focus-within:text-copper"
      >
        {label}
        {optional && (
          <span className="ml-1 normal-case text-platinum-muted/60">(optional)</span>
        )}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn(
          "w-full rounded-xl border bg-white/[0.02] px-4 py-3.5 text-sm text-platinum placeholder:text-platinum-muted/50 outline-none transition-all duration-200",
          "focus:border-copper/60 focus:bg-white/[0.04] focus:ring-2 focus:ring-copper/20",
          error ? "border-red-500/60" : "border-white/10 hover:border-white/20",
        )}
      />
      {error && (
        <p
          id={`${name}-error`}
          className="flex items-center gap-1 text-xs text-red-400"
        >
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

/** A participant block: name always shown; email + phone reveal once name is typed. */
function ParticipantBlock({
  index,
  required,
  name,
  setName,
  errName,
  errEmail,
  errPhone,
}: {
  index: 1 | 2 | 3;
  required: boolean;
  name: string;
  setName: (v: string) => void;
  errName?: string;
  errEmail?: string;
  errPhone?: string;
}) {
  const showEmail = name.trim().length > 0 || !!errEmail || !!errPhone;
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.015] p-4 transition-colors hover:border-white/15 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-copper/15 font-mono text-[11px] font-bold text-copper ring-1 ring-copper/30">
          {index}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-wider2 text-platinum-soft">
          Participant {index}
          {!required && (
            <span className="ml-1.5 normal-case text-platinum-muted/60">
              optional
            </span>
          )}
        </span>
      </div>
      <div className="grid gap-4">
        <Input
          label={`Participant ${index} Name`}
          name={`participant_${index}_name`}
          placeholder="Full name"
          required={required}
          optional={!required}
          value={name}
          onChange={setName}
          error={errName}
        />
        <AnimatePresence initial={false}>
          {showEmail && (
            <motion.div
              key="email"
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={`Participant ${index} Email`}
                  name={`participant_${index}_email`}
                  type="email"
                  inputMode="email"
                  placeholder="name@college.edu"
                  required
                  error={errEmail}
                />
                <Input
                  label={`Participant ${index} Mobile`}
                  name={`participant_${index}_phone`}
                  type="tel"
                  inputMode="tel"
                  placeholder="10-digit mobile"
                  required
                  error={errPhone}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SubmitButton({ mode }: { mode: Mode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      data-cursor="Submit"
      className="btn-primary w-full justify-center py-4 text-base disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Submitting…
        </>
      ) : (
        <>
          Complete {mode === "SOLO" ? "Solo" : mode === "DUO" ? "Duo" : "Team"}{" "}
          Registration
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}

export default function RegistrationForm() {
  const [state, formAction] = useActionState(registerTeam, initial);
  const [mode, setMode] = useState<Mode>("SOLO");
  const [agreed, setAgreed] = useState(false);
  const [n1, setN1] = useState("");
  const [n2, setN2] = useState("");
  const [n3, setN3] = useState("");
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const visibleCount = mode === "SOLO" ? 1 : mode === "DUO" ? 2 : 3;

  useEffect(() => {
    if (state.status === "success") {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [state.status]);

  // Non-invasive completion meter: reads current field values without
  // controlling the inputs, so submission behaviour is unchanged.
  function recomputeProgress() {
    const form = formRef.current;
    if (!form) return;
    const need: string[] = ["team_name", "college", "course"];
    for (let i = 1; i <= visibleCount; i++) {
      need.push(
        `participant_${i}_name`,
        `participant_${i}_email`,
        `participant_${i}_phone`,
      );
    }
    let filled = 0;
    for (const nm of need) {
      const el = form.elements.namedItem(nm) as HTMLInputElement | null;
      if (el && el.value.trim().length > 0) filled++;
    }
    const total = need.length + 1; // +1 for agreement
    if (agreed) filled++;
    setProgress(Math.round((filled / total) * 100));
  }

  useEffect(() => {
    recomputeProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, agreed, n1, n2, n3]);

  const err = state.errors ?? {};

  function copyNumber() {
    if (!state.teamNumber) return;
    navigator.clipboard?.writeText(state.teamNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  if (state.status === "success") {
    return (
      <motion.div
        ref={topRef}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="ring-gradient relative overflow-hidden rounded-3xl glass-strong p-8 text-center sm:p-10"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-copper/25 blur-[100px]"
        />
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-300/30"
        >
          <CheckCircle2 className="h-8 w-8" />
        </motion.div>
        <h3 className="mt-6 font-serif text-3xl font-semibold text-platinum">
          You&apos;re on the grid
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-platinum-muted">
          {state.message} Save your team number — you&apos;ll need it for every
          round.
        </p>

        {/* Team number badge */}
        {state.teamNumber && (
          <div className="mx-auto mt-7 inline-flex flex-col items-center gap-2">
            <span className="kicker">Your team number</span>
            <button
              onClick={copyNumber}
              data-cursor="Copy"
              className="group inline-flex items-center gap-3 rounded-2xl border border-copper/30 bg-copper/10 px-7 py-4"
            >
              <span className="font-display text-4xl font-bold tracking-tight text-gradient-cyan">
                {state.teamNumber}
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-platinum-muted transition-colors group-hover:text-platinum">
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </span>
            </button>
            <span className="font-mono text-[10px] uppercase tracking-wider2 text-platinum-muted">
              {state.registrationType} · Click to copy
            </span>
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-primary">
            Back to home
          </Link>
          <button onClick={() => window.location.reload()} className="btn-ghost">
            Register another
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div ref={topRef}>
      {/* Completion meter */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <span className="kicker">Registration form</span>
          <span className="font-mono text-[11px] text-platinum-muted">
            {progress}% complete
          </span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/8">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-copper via-amber to-champagne"
          />
        </div>
      </div>

      <AnimatePresence>
        {state.status === "error" && state.message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{state.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode selector */}
      <div className="mb-6">
        <span className="kicker">Choose your format</span>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {MODES.map((m) => {
            const active = mode === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setMode(m.key)}
                data-cursor={m.label}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 overflow-hidden rounded-2xl border px-2 py-4 text-center transition-all duration-200",
                  active
                    ? "border-copper/60 bg-copper/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/25",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="mode-active"
                    className="absolute inset-0 -z-10 bg-gradient-to-b from-copper/10 to-transparent"
                  />
                )}
                <m.icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    active ? "text-copper" : "text-platinum-muted",
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-semibold",
                    active ? "text-platinum" : "text-platinum-soft",
                  )}
                >
                  {m.label}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider2 text-platinum-muted">
                  {m.size}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <form
        ref={formRef}
        action={formAction}
        onChange={recomputeProgress}
        className="space-y-5"
        noValidate
      >
        <input type="hidden" name="registration_type" value={mode} />

        <Input
          label="Team Name"
          name="team_name"
          placeholder="e.g. Gradient Descenders"
          error={err.team_name}
        />

        <div className="space-y-3">
          <ParticipantBlock
            index={1}
            required
            name={n1}
            setName={setN1}
            errName={err.participant_1_name}
            errEmail={err.participant_1_email}
            errPhone={err.participant_1_phone}
          />
          <AnimatePresence initial={false}>
            {visibleCount >= 2 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <ParticipantBlock
                  index={2}
                  required
                  name={n2}
                  setName={setN2}
                  errName={err.participant_2_name}
                  errEmail={err.participant_2_email}
                  errPhone={err.participant_2_phone}
                />
              </motion.div>
            )}
            {visibleCount >= 3 && (
              <motion.div
                key="p3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <ParticipantBlock
                  index={3}
                  required
                  name={n3}
                  setName={setN3}
                  errName={err.participant_3_name}
                  errEmail={err.participant_3_email}
                  errPhone={err.participant_3_phone}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="College Name"
            name="college"
            placeholder="Your college"
            error={err.college}
          />
          <Input
            label="Course / Degree"
            name="course"
            placeholder="e.g. B.Sc. IT"
            error={err.course}
          />
        </div>

        {/* Agreement checkbox */}
        <div>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-white/20">
            <input
              type="checkbox"
              name="agreed_terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              required
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-copper"
              aria-describedby={err.agreed_terms ? "agreed-error" : undefined}
            />
            <span className="text-sm leading-relaxed text-platinum-soft">
              I confirm that all information provided is accurate and I agree to
              the competition rules.
            </span>
          </label>
          {err.agreed_terms && (
            <p
              id="agreed-error"
              className="mt-1.5 flex items-center gap-1 text-xs text-red-400"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              {err.agreed_terms}
            </p>
          )}
        </div>

        <SubmitButton mode={mode} />

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-platinum-muted">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          Free to enter · A unique team number is issued on submit.
        </p>
      </form>
    </div>
  );
}
