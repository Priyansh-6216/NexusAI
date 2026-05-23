interface MetricCardProps {
  label: string;
  value: string;
  delta: string;
  description: string;
}

export default function MetricCard({ label, value, delta, description }: MetricCardProps) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm shadow-slate-950/20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{label}</p>
          <p className="mt-3 text-4xl font-semibold text-white">{value}</p>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-300">{delta}</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-400">{description}</p>
    </article>
  );
}
