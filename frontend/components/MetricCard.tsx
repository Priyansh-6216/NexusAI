interface MetricCardProps {
  label: string;
  value: string;
  delta: string;
  description: string;
  tone?: "emerald" | "amber" | "rose" | "cyan";
}

const toneClasses = {
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  rose: "border-rose-500/30 bg-rose-500/10 text-rose-200",
  cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
};

export default function MetricCard({ label, value, delta, description, tone = "emerald" }: MetricCardProps) {
  return (
    <article className="min-h-[168px] rounded-lg border border-zinc-800 bg-zinc-950 p-5 shadow-sm shadow-black/20">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-zinc-50">{value}</p>
        </div>
        <span className={`shrink-0 rounded-md border px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}>{delta}</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-zinc-400">{description}</p>
    </article>
  );
}
