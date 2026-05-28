export default function Sidebar() {
  const navigation = [
    { label: "Overview", count: "live", active: true },
    { label: "Incidents", count: "4", active: false },
    { label: "Services", count: "8", active: false },
    { label: "Data Layer", count: "3", active: false },
    { label: "AI Reviews", count: "12", active: false },
    { label: "Agents", count: "4", active: false },
  ];

  return (
    <aside className="hidden w-72 shrink-0 border-r border-zinc-800 bg-zinc-950 lg:block">
      <div className="border-b border-zinc-800 px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">NexusAI</p>
        <h2 className="mt-3 text-2xl font-semibold text-zinc-50">Operations</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">Build day 6 control surface</p>
      </div>

      <nav className="space-y-1 p-3">
        {navigation.map((item) => (
          <button
            key={item.label}
            className={`flex h-11 w-full items-center justify-between rounded-md px-3 text-left text-sm font-medium transition ${
              item.active
                ? "bg-cyan-500/10 text-cyan-100 ring-1 ring-cyan-400/30"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
            }`}
          >
            <span>{item.label}</span>
            <span className="rounded bg-zinc-900 px-2 py-0.5 text-xs text-zinc-500">{item.count}</span>
          </button>
        ))}
      </nav>

      <div className="mx-3 mt-5 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Environment</p>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Branch</span>
            <span className="font-medium text-zinc-100">main</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Phase</span>
            <span className="font-medium text-emerald-300">Day 6</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
