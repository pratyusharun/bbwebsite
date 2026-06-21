"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";

const ORANGE = "#B98CFF";
const ORANGE_L = "#CBA8FF";
const GOLD = "#FF63C4";
const GOLD_D = "#E23DA6";
const MUTED = "#8B7CB8";

const tooltipStyle = {
  background: "#190F30",
  border: "1px solid #392563",
  borderRadius: 12,
  color: "#ECE6FF",
  fontSize: 12,
};

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
      <p className="mb-4 font-mono text-[10px] uppercase tracking-wider2 text-platinum-muted">
        {title}
      </p>
      {children}
    </div>
  );
}

export default function Analytics({
  mix,
  byDay,
  colleges,
}: {
  mix: { solo: number; duo: number; team: number; grouped: number };
  byDay: { date: string; count: number }[];
  colleges: { college: string; participants: number }[];
}) {
  const pieData = [
    { name: "Solo", value: mix.solo, fill: ORANGE },
    { name: "Duo", value: mix.duo, fill: GOLD },
    { name: "Team", value: mix.team, fill: ORANGE_L },
    { name: "Grouped", value: mix.grouped, fill: GOLD_D },
  ].filter((d) => d.value > 0);

  const dayData = byDay.map((d) => ({
    label: d.date.slice(5),
    count: d.count,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel title="Registration mix">
        {pieData.length === 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                stroke="none"
              >
                {pieData.map((d, i) => (
                  <Cell key={i} fill={d.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        )}
        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
          {pieData.map((d) => (
            <span
              key={d.name}
              className="inline-flex items-center gap-1.5 text-xs text-platinum-soft"
            >
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: d.fill }}
              />
              {d.name} · {d.value}
            </span>
          ))}
        </div>
      </Panel>

      <Panel title="Registrations by day">
        {dayData.length === 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height={232}>
            <AreaChart data={dayData} margin={{ left: -22, right: 6, top: 6 }}>
              <defs>
                <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ORANGE} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={ORANGE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#392563" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: MUTED, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#392563" }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: MUTED, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: ORANGE }} />
              <Area
                type="monotone"
                dataKey="count"
                stroke={ORANGE}
                strokeWidth={2}
                fill="url(#rg)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Panel>

      <Panel title="Top colleges (by participants)">
        {colleges.length === 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height={232}>
            <BarChart
              data={colleges}
              layout="vertical"
              margin={{ left: 8, right: 14 }}
            >
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="college"
                width={96}
                tick={{ fill: MUTED, fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: string) =>
                  v.length > 14 ? v.slice(0, 13) + "…" : v
                }
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#ffffff0a" }} />
              <Bar dataKey="participants" radius={[0, 6, 6, 0]} fill={GOLD} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Panel>
    </div>
  );
}

function Empty() {
  return (
    <div className="grid h-[200px] place-items-center text-xs text-platinum-muted">
      No data yet
    </div>
  );
}
