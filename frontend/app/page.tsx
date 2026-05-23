import MetricCard from "../components/MetricCard";
import Sidebar from "../components/Sidebar";

const metrics = [
  {
    label: "Active Incidents",
    value: "4",
    delta: "+12%",
    description: "Open incidents with active alerts in the last hour.",
  },
  {
    label: "K8s Health",
    value: "97%",
    delta: "+3%",
    description: "Overall cluster readiness across deployments and nodes.",
  },
  {
    label: "Error Rate",
    value: "0.45%",
    delta: "-9%",
    description: "Total service errors across the platform in the last 15 minutes.",
  },
  {
    label: "AI Review Rate",
    value: "68%",
    delta: "+5%",
    description: "Percentage of PRs currently receiving AI review recommendations.",
  },
];

const alerts = [
  {
    title: "Database latency spike",
    status: "High",
    details: "Query duration exceeded threshold on auth-service.",
  },
  {
    title: "Pod restart storm",
    status: "Medium",
    details: "2 pods restarted in the last 10 minutes in monitoring namespace.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-10">
          <div className="flex flex-col gap-6">
            <header className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/20">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-sky-400/80">NexusAI</p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Engineering Operations Dashboard</h1>
                  <p className="mt-2 max-w-2xl text-slate-400">
                    Real-time platform health, AI insights, incident drilldowns, and repository intelligence in a unified enterprise interface.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-950 p-4 text-sm text-slate-300 ring-1 ring-slate-700/80">
                    Last synced: <strong>2 minutes ago</strong>
                  </div>
                  <div className="rounded-3xl bg-slate-950 p-4 text-sm text-slate-300 ring-1 ring-slate-700/80">
                    Active AI agents: <strong>5</strong>
                  </div>
                </div>
              </div>
            </header>

            <section className="grid gap-4 lg:grid-cols-2">
              {metrics.map((metric) => (
                <MetricCard key={metric.label} {...metric} />
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.75fr_1fr]">
              <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">AI Insights</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Actionable recommendations</h2>
                  </div>
                  <button className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400">
                    Refresh insights
                  </button>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 text-slate-300">
                    <p className="font-semibold text-white">Optimize cluster scaling</p>
                    <p className="mt-3 text-sm text-slate-400">
                      AI recommends increasing replica counts for auth-service during nightly traffic spikes.
                    </p>
                  </div>
                  <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 text-slate-300">
                    <p className="font-semibold text-white">Review security drift</p>
                    <p className="mt-3 text-sm text-slate-400">
                      2 new findings flagged in the latest PR analysis for code-review service.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Incident Timeline</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Recent alerts</h2>
                <div className="mt-6 space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.title} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-white">{alert.title}</p>
                        <span className="rounded-full bg-amber-500/15 px-3 py-1 text-sm text-amber-300">{alert.status}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{alert.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
