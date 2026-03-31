import Link from "next/link";

const modules = [
  {
    title: "Access Control",
    description: "JWT auth with HTTP-only cookies and role-aware navigation for HR and employees.",
    stat: "RBAC",
  },
  {
    title: "Attendance",
    description: "Check-in and check-out flows with optional GPS validation using the Haversine formula.",
    stat: "GPS",
  },
  {
    title: "Leave & Reports",
    description: "Leave applications, approval queues, and monthly summaries from attendance and leave data.",
    stat: "Monthly",
  },
];

const highlights = [
  "Employee records with structured HR control",
  "Location-aware attendance and status logic",
  "Approval workflows and operational reports",
];

export default function Home() {
  return (
    <main className="grid-overlay flex flex-1 items-center px-6 py-10 md:px-10 md:py-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="panel-strong relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 xl:p-14">
          <div className="absolute -right-20 top-8 h-56 w-56 rounded-full bg-brand/12 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-accent/12 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[1.18fr_0.82fr] xl:items-end">
            <div className="max-w-3xl space-y-8">
              <div className="chip text-brand">Workforce Operations Platform</div>
              <div className="space-y-5">
                <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-foreground md:text-7xl">
                  Operational HR software with a sharper executive feel.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted md:text-xl">
                  Abha HRMS centralizes employee data, attendance logic, leave workflows, and reporting into a cleaner, more professional interface.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="rounded-full bg-brand px-6 py-3 text-center font-semibold text-white transition hover:bg-brand-strong"
                >
                  Sign In
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-full border border-line bg-white/80 px-6 py-3 text-center font-semibold transition hover:bg-white"
                >
                  Open Dashboard
                </Link>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {highlights.map((item) => (
                  <div key={item} className="soft-card rounded-[1.4rem] p-4 text-sm leading-6 text-muted">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <article className="metric-card rounded-[2rem] p-6">
                <div className="section-kicker">Platform Scope</div>
                <div className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Auth, attendance, leave, and reports</div>
                <p className="mt-3 text-base leading-7 text-muted">
                  Built on Next.js, MongoDB, and role-aware access with GPS-ready attendance verification.
                </p>
              </article>
              <article className="rounded-[2rem] bg-brand p-6 text-white shadow-[0_22px_50px_rgba(15,118,110,0.26)]">
                <div className="text-sm tracking-[0.18em] text-white/72 uppercase">Deployment Direction</div>
                <div className="mt-3 text-2xl font-semibold tracking-[-0.03em]">Vercel + Atlas + optional Node service later</div>
              </article>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {modules.map((module) => (
            <article key={module.title} className="metric-card rounded-[1.9rem] p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="section-kicker">Core Module</div>
                <div className="chip text-brand">{module.stat}</div>
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em]">{module.title}</h2>
              <p className="mt-3 text-base leading-7 text-muted">{module.description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
