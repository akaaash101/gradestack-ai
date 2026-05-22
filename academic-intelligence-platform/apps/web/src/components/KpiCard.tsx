type KpiCardProps = {
  label: string;
  value: string;
  detail?: string;
};

export function KpiCard({ label, value, detail }: KpiCardProps) {
  return (
    <div className="rounded-2xl bg-panel p-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
      {detail ? <p className="mt-1 text-sm text-muted">{detail}</p> : null}
    </div>
  );
}
