export default function Sidebar() {
  const navigation = [
    { label: "Overview", active: true },
    { label: "Incidents", active: false },
    { label: "Kubernetes", active: false },
    { label: "AI Reviews", active: false },
    { label: "Repo Intelligence", active: false },
    { label: "Settings", active: false },
  ];

  return (
    <aside className="hidden w-80 shrink-0 border-r border-slate-800 bg-slate-950/80 p-6 lg:block">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.35em] text-sky-400/80">NexusAI</p>
        <h2 className="mt-4 text-3xl font-semibold text-white">Operations</h2>
        <p className="mt-3 text-slate-400">Enterprise AI engineering platform dashboard for observability, security, and automation.</p>
      </div>

      <nav className="space-y-2">
        {navigation.map((item) => (
          <button
            key={item.label}
            className={`flex w-full items-center justify-between rounded-3xl px-5 py-4 text-left text-sm font-medium transition ${
              item.active
                ? "bg-sky-500/15 text-sky-200 ring-1 ring-sky-500/30"
                : "text-slate-300 hover:bg-slate-900/80 hover:text-white"
            }`}
          >
            <span>{item.label}</span>
            {item.active ? <span className="rounded-full bg-sky-500 px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-white">Active</span> : null}
          </button>
        ))}
      </nav>
    </aside>
  );
}
