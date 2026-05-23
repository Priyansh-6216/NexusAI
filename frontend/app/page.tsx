import Sidebar from "../components/Sidebar";

const metrics = [
  { label: "Active Incidents", value: "4", delta: "+12%" },
  { label: "K8s Health", value: "97%", delta: "+3%" },
  { label: "Error Rate", value: "0.45%", delta: "-9%" },
  { label: "AI Review Rate", value: "68%", delta: "+5%" },
];

const insights = [
  "Detected 2 high-risk deployments needing review.",
  "AI agent recommended scaling cluster by 12%.",
  "3 repos have stale dependencies older than 90 days.",
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-10">
          <div className="flex flex-col gap-6">
            <header className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-sky-400/80">NexusAI</p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Engineering Operations Dashboard</h1>
                  <p className="mt-2 max-w-2xl text-slate-400">
                    Real-time platform health, AI insights, incident drilldowns, and repository intelligence in one enterprise view.
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-950 p-4 text-sm text-slate-300 ring-1 ring-slate-700/80">
                  Last synced 2 minutes ago
                </div>
              </div>
            </header>

            <section className="grid gap-4 lg:grid-cols-2">
              {metrics.map((metric) => (
                <article key={metric.label} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{metric.label}</p>
                  <div className="mt-4 flex items-end gap-4">
                    <p className="text-4xl font-semibold text-white">{metric.value}</p>
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-300">{metric.delta}</span>
                  </div>
                </article>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
              <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">AI Insights</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Actionable recommendations</h2>
                  </div>
                  <button className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400">
                    Refresh
                  </button>
                </div>
                <ul className="space-y-4">
                  {insights.map((item) => (
                    <li key={item} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 text-slate-300">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">AI Assistant</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Ask NexusAI</h2>
                <p className="mt-3 text-slate-400">
                  Use the chat assistant to explain repository architecture, investigate incidents, or route requests to the right AI engine.
                </p>
                <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950 p-4 text-slate-300">
                  <p className="text-sm text-slate-500">Try queries like:</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li>“Explain the auth service architecture.”</li>
                    <li>“Show current Kubernetes pod health.”</li>
                    <li>“Review latest PR security risks.”</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
