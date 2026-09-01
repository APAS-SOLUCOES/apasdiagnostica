import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DIMENSIONS, DIMENSION_NAMES, type Dimension } from "@/lib/disc/instrument";
import type { DimensionMap } from "@/lib/disc/scoring";

const COLORS: Record<Dimension, string> = {
  D: "var(--chart-1)",
  I: "var(--chart-2)",
  S: "var(--chart-4)",
  C: "var(--chart-3)",
};

export function DiscChart({ percent }: { percent: DimensionMap }) {
  const data = DIMENSIONS.map((d) => ({
    dim: d,
    name: DIMENSION_NAMES[d],
    valor: percent[d],
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="dim" stroke="var(--muted-foreground)" tickLine={false} />
          <YAxis stroke="var(--muted-foreground)" tickLine={false} unit="%" />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--card-foreground)",
            }}
            formatter={(v: number, _k, item) => [`${v}%`, item?.payload?.name ?? ""]}
          />
          <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
            {data.map((row) => (
              <Cell key={row.dim} fill={COLORS[row.dim as Dimension]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DiscBars({ percent }: { percent: DimensionMap }) {
  return (
    <div className="space-y-3">
      {DIMENSIONS.map((d) => (
        <div key={d}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">
              {d} · {DIMENSION_NAMES[d]}
            </span>
            <span className="text-muted-foreground">{percent[d]}%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.min(100, percent[d])}%`, background: COLORS[d] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
