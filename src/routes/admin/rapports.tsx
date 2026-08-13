import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, Printer, CalendarRange, RotateCcw } from "lucide-react";
import { reportQuery } from "@/lib/admin/queries";
import type { Report, ReportKey } from "@/lib/admin/types";
import { formatDate } from "@/lib/admin/format";
import { StatCard, Panel, AdminButton } from "@/components/admin/primitives";
import { TrendChart } from "@/components/admin/charts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/rapports")({
  head: () => ({
    meta: [
      { title: "Rapports — STE MABANIS" },
      { name: "description", content: "Rapports immobiliers exportables en CSV et PDF." },
    ],
  }),
  component: ReportsPage,
});

const TABS: { key: ReportKey; label: string }[] = [
  { key: "properties", label: "Biens" },
  { key: "crm", label: "CRM" },
  { key: "agents", label: "Agents" },
  { key: "activity", label: "Activité" },
];

const TAB_TITLES: Record<ReportKey, string> = {
  properties: "Rapport immobilier",
  crm: "Rapport CRM",
  agents: "Rapport agents",
  activity: "Rapport d'activité",
};

function toYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromYmd(value: string, endOfDay: boolean) {
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y!, m! - 1, d!, endOfDay ? 23 : 0, endOfDay ? 59 : 0, 0);
  return date.toISOString();
}

function ReportsPage() {
  const today = new Date();
  const defaultFrom = toYmd(new Date(today.getTime() - 90 * 86_400_000));
  const defaultTo = toYmd(today);

  const [tab, setTab] = useState<ReportKey>("properties");
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const { data: report } = useQuery(reportQuery(tab, fromYmd(from, false), fromYmd(to, true)));

  const kpis = report?.kpis ?? [];
  const series = report?.series ?? [];

  const chartData = useMemo(() => {
    const src = report?.series ?? [];
    const points = src[0]?.points ?? [];
    return points.map((p, i) => ({
      label: p.label,
      ...Object.fromEntries(src.map((s, j) => [`v${j}`, s.points[i]?.value ?? 0])),
    }));
  }, [report?.series]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase">
              <CalendarRange className="size-3.5" /> Du
            </span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value || defaultFrom)}
              className="h-11 border border-line bg-admin-bg/40 px-3 text-sm outline-none focus:border-gold"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground uppercase">Au</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value || defaultTo)}
              className="h-11 border border-line bg-admin-bg/40 px-3 text-sm outline-none focus:border-gold"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setFrom(defaultFrom);
              setTo(defaultTo);
            }}
            className="grid h-11 place-items-center border border-line px-3 text-muted-foreground transition-colors hover:border-gold hover:text-gold"
            aria-label="Réinitialiser les dates"
          >
            <RotateCcw className="size-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <AdminButton variant="outline" onClick={() => exportCsv(report)}>
            <Download className="size-3.5" /> CSV
          </AdminButton>
          <AdminButton variant="outline" onClick={() => printReport(report)}>
            <Printer className="size-3.5" /> Imprimer / PDF
          </AdminButton>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "border-b-2 px-4 py-2.5 text-sm tracking-wide uppercase transition-colors",
              tab === t.key
                ? "border-gold text-navy"
                : "border-transparent text-muted-foreground hover:text-navy",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {report ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((k, i) => (
              <StatCard
                key={k.label}
                label={k.label}
                value={formatKpi(k.label, k.value)}
                index={i}
              />
            ))}
          </div>

          <Panel>
            <header className="border-b border-line px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="display text-xl">{TAB_TITLES[tab]}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(report.from)} — {formatDate(report.to)}
                  </p>
                </div>
              </div>
            </header>
            {series.length > 0 && series.some((s) => s.points.length > 0) ? (
              <div className="p-5">
                <TrendChart
                  data={chartData}
                  xKey="label"
                  series={series.map((s, j) => ({ key: `v${j}`, name: s.label }))}
                  height={240}
                />
              </div>
            ) : (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                Aucune donnée sur la période sélectionnée.
              </div>
            )}
          </Panel>

          <Panel>
            <header className="border-b border-line px-5 py-4">
              <h2 className="display text-xl">Détail</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {report.table.rows.length} lignes · exportable en CSV et PDF.
              </p>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase">
                    {report.table.columns.map((c) => (
                      <th key={c} className="px-5 py-3 font-medium whitespace-nowrap">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {report.table.rows.map((row, i) => (
                    <tr key={i} className="transition-colors hover:bg-sand/40">
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className={cn(
                            "px-5 py-3 text-muted-foreground",
                            j === 0 && "font-medium text-navy",
                          )}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      ) : (
        <div className="border border-line bg-admin-surface px-6 py-16 text-center text-sm text-muted-foreground">
          Chargement du rapport…
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- helpers */

function formatKpi(label: string, value: number) {
  if (/Prix|MAD|CA/i.test(label)) return value.toLocaleString("fr-FR");
  return String(value);
}

function escapeHtml(v: string) {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toCsv(columns: string[], rows: string[][]) {
  const esc = (v: string) => (/[";\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return [columns, ...rows].map((r) => r.map(esc).join(";")).join("\r\n");
}

function exportCsv(report?: Report) {
  if (!report) return;
  const blob = new Blob(["\uFEFF" + toCsv(report.table.columns, report.table.rows)], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mabanis-${report.key}-${report.from.slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function printReport(report?: Report) {
  if (!report) return;
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) return;
  const rows = report.table.rows
    .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`)
    .join("");
  const headers = report.table.columns.map((c) => `<th>${escapeHtml(c)}</th>`).join("");
  const body = [
    `<h1>${escapeHtml(report.title)}</h1>`,
    `<p class="period">STE MABANIS · ${escapeHtml(formatDate(report.from))} — ${escapeHtml(formatDate(report.to))}</p>`,
    `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`,
    `<p class="foot">Généré le ${escapeHtml(formatDate(new Date().toISOString()))}</p>`,
  ].join("");
  w.document.write(`<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${escapeHtml(report.title)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">
<style>
  * { box-sizing: border-box; }
  body { font-family: Roboto, "Segoe UI", Arial, sans-serif; margin: 32px; color: #141419; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .period { margin: 0 0 24px; color: #6b6b76; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { text-align: left; text-transform: uppercase; letter-spacing: 0.08em; font-size: 10px;
       color: #6b6b76; border-bottom: 2px solid #d8d2c2; padding: 8px 10px; }
  td { border-bottom: 1px solid #ece7d8; padding: 8px 10px; color: #2b2b33; }
  tr:last-child td { border-bottom: none; }
  .foot { margin-top: 24px; color: #a19a87; font-size: 11px; }
  @media print { body { margin: 12mm; } }
</style>
</head>
<body>
${body}
<script>window.onload = function () { setTimeout(function () { window.print(); }, 300); };</script>
</body>
</html>`);
  w.document.close();
}
