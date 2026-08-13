import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

/**
 * Recharts wrappers. Colours are read from the CSS tokens rather than written
 * inline, so the charts follow the design system automatically.
 */
export const SERIES = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const axisProps = {
  stroke: "var(--muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

function ChartTooltip({
  active,
  payload,
  label: axisLabel,
  formatter,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string }[];
  label?: string;
  formatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-line bg-admin-surface px-3 py-2 shadow-panel">
      {axisLabel ? (
        <p className="text-[0.6rem] tracking-[0.14em] text-muted-foreground uppercase">
          {axisLabel}
        </p>
      ) : null}
      {payload.map((p, i) => (
        <p key={i} className="mt-1 flex items-center gap-2 text-sm">
          <span className="size-2 shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}</span>
          <span className="ml-auto font-medium tabular-nums text-navy">
            {formatter && typeof p.value === "number" ? formatter(p.value) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export function ChartFrame({
  children,
  height = 260,
  className,
}: {
  children: React.ReactElement;
  height?: number;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------- Line chart */

export function TrendChart({
  data,
  xKey,
  series,
  height,
  formatter,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  series: { key: string; name: string }[];
  height?: number;
  formatter?: (v: number) => string;
}) {
  return (
    <ChartFrame {...(height !== undefined ? { height } : {})}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid stroke="var(--line)" vertical={false} />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis {...axisProps} width={52} />
        <Tooltip
          cursor={{ stroke: "var(--line)" }}
          content={<ChartTooltip {...(formatter ? { formatter } : {})} />}
        />
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={SERIES[i % SERIES.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            animationDuration={900}
          />
        ))}
      </LineChart>
    </ChartFrame>
  );
}

/* ------------------------------------------------------------- Area chart */

export function AreaTrendChart({
  data,
  xKey,
  dataKey,
  name,
  height,
  formatter,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  dataKey: string;
  name: string;
  height?: number;
  formatter?: (v: number) => string;
}) {
  return (
    <ChartFrame {...(height !== undefined ? { height } : {})}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <defs>
          <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--line)" vertical={false} />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis {...axisProps} width={52} />
        <Tooltip
          cursor={{ stroke: "var(--line)" }}
          content={<ChartTooltip {...(formatter ? { formatter } : {})} />}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          name={name}
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#area-fill)"
          animationDuration={900}
        />
      </AreaChart>
    </ChartFrame>
  );
}

/* -------------------------------------------------------------- Bar chart */

export function CategoryBarChart({
  data,
  xKey,
  dataKey,
  name,
  height,
  formatter,
  horizontal = false,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  dataKey: string;
  name: string;
  height?: number;
  formatter?: (v: number) => string;
  horizontal?: boolean;
}) {
  return (
    <ChartFrame {...(height !== undefined ? { height } : {})}>
      <BarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 8, right: 8, bottom: 0, left: horizontal ? 8 : -18 }}
      >
        <CartesianGrid stroke="var(--line)" vertical={horizontal} horizontal={!horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" {...axisProps} />
            <YAxis type="category" dataKey={xKey} {...axisProps} width={96} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} {...axisProps} />
            <YAxis {...axisProps} width={52} />
          </>
        )}
        <Tooltip
          cursor={{ fill: "var(--sand)" }}
          content={<ChartTooltip {...(formatter ? { formatter } : {})} />}
        />
        <Bar dataKey={dataKey} name={name} animationDuration={900} radius={0}>
          {data.map((_, i) => (
            <Cell key={i} fill={SERIES[i % SERIES.length]} />
          ))}
        </Bar>
      </BarChart>
    </ChartFrame>
  );
}

/* ------------------------------------------------------------- Donut chart */

export function DonutChart({
  data,
  height = 240,
  formatter,
}: {
  data: { label: string; value: number }[];
  height?: number;
  formatter?: (v: number) => string;
}) {
  return (
    <ChartFrame height={height}>
      <PieChart>
        <Tooltip content={<ChartTooltip {...(formatter ? { formatter } : {})} />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius="58%"
          outerRadius="86%"
          paddingAngle={2}
          animationDuration={900}
          stroke="var(--admin-surface)"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={SERIES[i % SERIES.length]} />
          ))}
        </Pie>
      </PieChart>
    </ChartFrame>
  );
}

export function ChartLegend({ items }: { items: { label: string; value?: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2">
      {items.map((item, i) => (
        <li key={item.label} className="flex items-center gap-2 text-xs">
          <span className="size-2 shrink-0" style={{ background: SERIES[i % SERIES.length] }} />
          <span className="text-muted-foreground">{item.label}</span>
          {item.value ? (
            <span className="font-medium tabular-nums text-navy">{item.value}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
