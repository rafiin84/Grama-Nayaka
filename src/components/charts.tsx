"use client";
import { useState, type ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, Table, Td } from "@/components/ui";
import { useT } from "@/lib/useT";

// Series colours follow the brand ramp in fixed order (forest, saffron, navy). Max 3 series; status uses text labels too.
export const SERIES = ["var(--primary)", "var(--brand-saffron)", "var(--brand-blue)"];
const axis = { stroke: "var(--muted)", fontSize: 12 };
type Row = Record<string, string | number>;

export function ChartCard({ title, summary, rows, keys, kind = "bar", layout = "vertical", note }: { title: string; summary: string; rows: Row[]; keys: string[]; kind?: "bar" | "line"; layout?: "vertical" | "horizontal"; note?: ReactNode }) {
  const { tr } = useT(); const [table, setTable] = useState(false); const x = Object.keys(rows[0] ?? { name: "" })[0];
  return (
    <Card>
      <div className="mb-1 flex items-start justify-between gap-2"><h2 className="font-bold">{title}</h2><button className="text-xs text-primary underline" onClick={() => setTable(!table)} aria-pressed={table}>{table ? tr("Show chart", "ಚಾರ್ಟ್ ತೋರಿಸಿ") : tr("Show table", "ಕೋಷ್ಟಕ ತೋರಿಸಿ")}</button></div>
      <p className="mb-2 text-xs text-muted">{summary}</p>
      {table ? <Table head={[x, ...keys]}>{rows.map((r, i) => <tr key={i}><Td>{r[x]}</Td>{keys.map((k) => <Td key={k}>{r[k]}</Td>)}</tr>)}</Table> : (
        <div role="img" aria-label={`${title}. ${summary}`} className="h-60 w-full">
          <ResponsiveContainer>
            {kind === "line" ? (
              <LineChart data={rows} margin={{ left: -16, right: 8, top: 8 }}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey={x} {...axis} tickLine={false} /><YAxis {...axis} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />{keys.length > 1 && <Legend />}
                {keys.map((k, i) => <Line key={k} dataKey={k} stroke={SERIES[i]} strokeWidth={2} dot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }} />)}</LineChart>
            ) : (
              <BarChart data={rows} layout={layout === "horizontal" ? "vertical" : "horizontal"} margin={{ left: layout === "horizontal" ? 24 : -16, right: 8, top: 8 }}><CartesianGrid stroke="var(--border)" vertical={layout === "horizontal"} horizontal={layout !== "horizontal"} />
                {layout === "horizontal" ? <><XAxis type="number" {...axis} tickLine={false} /><YAxis type="category" dataKey={x} width={110} {...axis} tickLine={false} /></> : <><XAxis dataKey={x} {...axis} tickLine={false} /><YAxis {...axis} tickLine={false} axisLine={false} /></>}
                <Tooltip cursor={{ fill: "var(--accent-soft)" }} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />{keys.length > 1 && <Legend />}
                {keys.map((k, i) => <Bar key={k} dataKey={k} fill={SERIES[i]} radius={[4, 4, 0, 0]} maxBarSize={28} stroke="var(--card)" strokeWidth={2} />)}</BarChart>
            )}
          </ResponsiveContainer>
        </div>)}
      {note && <p className="mt-2 text-xs text-muted">{note}</p>}
    </Card>
  );
}
