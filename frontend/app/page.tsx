import MetricCard from "../components/MetricCard";
import Sidebar from "../components/Sidebar";

const metrics = [
  {
    label: "Service Readiness",
    value: "8/8",
    delta: "green",
    description: "Gateway, auth, monitoring, incidents, reviews, repos, LLM routing, and agents have starter endpoints.",
    tone: "emerald" as const,
  },
  {
    label: "Docker Images",
    value: "10",
    delta: "new",
    description: "Frontend, AI services, gateway, and backend microservices are containerized.",
    tone: "cyan" as const,
  },
  {
    label: "Open Incidents",
    value: "4",
    delta: "watch",
    description: "Active alerts are correlated against service ownership and recent deployments.",
    tone: "amber" as const,
  },
  {
    label: "Data Schemas",
    value: "7",
    delta: "ready",
    description: "PostgreSQL schemas remain mounted into local Postgres for fresh volumes.",
    tone: "emerald" as const,
  },
];

const services = [
  ["API Gateway", "8080", "/gateway/status", "Ready"],
  ["Auth", "8081", "/api/auth/health", "Ready"],
  ["Monitoring", "8082", "/api/monitoring/summary", "Ready"],
  ["Incidents", "8083", "/api/incidents/summary", "Ready"],
  ["Code Review", "8084", "/api/reviews/capabilities", "Ready"],
  ["Repo Intelligence", "8085", "/api/repos/capabilities", "Ready"],
  ["LLM Router", "8086", "/api/llm/policies", "Ready"],
  ["AI Agents", "8087", "/api/agents/registry", "Ready"],
];

const dataStores = [
  {
    name: "PostgreSQL",
    detail: "16 tables across auth, monitoring, incidents, reviews, repos, routing, and agents.",
    status: "Mounted",
    accent: "bg-emerald-400",
  },
  {
    name: "Redis",
    detail: "Session, rate limit, lock, provider health, and workflow key contracts are defined.",
    status: "Contracted",
    accent: "bg-rose-400",
  },
  {
    name: "Qdrant",
    detail: "Collections cover repo code chunks, incident context, and runbook knowledge.",
    status: "Mapped",
    accent: "bg-cyan-400",
  },
];

const timeline = [
  ["15:48", "Compose stack refined", "health checks and service env"],
  ["15:39", "Static frontend containerized", "Nginx on localhost:3000"],
  ["15:30", "Java services optimized", "multi-stage Maven builds"],
  ["15:18", "Postgres init mounted", "database/postgres/init"],
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">
          <header className="border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                    Build Day 6
                  </span>
                  <span className="rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-400">
                    Local stack ready
                  </span>
                </div>
                <h1 className="mt-4 text-3xl font-semibold text-zinc-50">Engineering Operations Dashboard</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                  Service health, incident posture, AI workflows, persistence contracts, and local Docker status in one operational view.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:w-[520px]">
                {["Postgres", "Redis", "Qdrant", "Kafka"].map((item) => (
                  <div key={item} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-3">
                    <p className="text-xs text-zinc-500">{item}</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-100">online</p>
                  </div>
                ))}
              </div>
            </div>
          </header>

          <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <MetricCard key={metric.label} {...metric} />
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950">
                <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Service Mesh</p>
                    <h2 className="mt-1 text-lg font-semibold text-zinc-50">Backend contract map</h2>
                  </div>
                  <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">
                    Synced
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="border-b border-zinc-800 text-xs uppercase tracking-[0.12em] text-zinc-500">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Service</th>
                        <th className="px-5 py-3 font-semibold">Port</th>
                        <th className="px-5 py-3 font-semibold">Endpoint</th>
                        <th className="px-5 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {services.map(([service, port, endpoint, status]) => (
                        <tr key={service} className="hover:bg-zinc-900/70">
                          <td className="px-5 py-3 font-medium text-zinc-100">{service}</td>
                          <td className="px-5 py-3 text-zinc-400">{port}</td>
                          <td className="px-5 py-3 font-mono text-xs text-cyan-200">{endpoint}</td>
                          <td className="px-5 py-3">
                            <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-200">
                              {status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-950">
                <div className="border-b border-zinc-800 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Incident Timeline</p>
                  <h2 className="mt-1 text-lg font-semibold text-zinc-50">Recent platform events</h2>
                </div>
                <div className="divide-y divide-zinc-900">
                  {timeline.map(([time, title, detail]) => (
                    <div key={`${time}-${title}`} className="grid grid-cols-[56px_1fr] gap-3 px-5 py-4">
                      <span className="text-xs font-medium text-zinc-500">{time}</span>
                      <div>
                        <p className="text-sm font-medium text-zinc-100">{title}</p>
                        <p className="mt-1 text-sm text-zinc-500">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
              {dataStores.map((store) => (
                <article key={store.name} className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${store.accent}`} />
                      <h3 className="font-semibold text-zinc-50">{store.name}</h3>
                    </div>
                    <span className="rounded-md border border-zinc-700 px-2 py-1 text-xs font-medium text-zinc-300">{store.status}</span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-zinc-400">{store.detail}</p>
                </article>
              ))}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
