import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="grid-overlay flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12 md:px-10 md:py-16">
      <div className="w-full max-w-6xl rounded-[2rem] border border-line bg-white/40 p-3 shadow-[0_30px_90px_rgba(23,33,38,0.12)] backdrop-blur-sm sm:rounded-[2.75rem] sm:p-4 md:p-8">
        <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr] lg:gap-6">

          {/* Brand panel — hidden on small screens */}
          <section className="hidden lg:flex panel-strong relative overflow-hidden rounded-[2.2rem] bg-brand flex-col px-10 py-12 text-white">
            <div className="absolute -right-14 top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 right-8 h-28 w-28 rounded-full bg-accent/30 blur-2xl" />
            <div className="relative flex flex-col flex-1 justify-between">
              <div>
                <div className="text-sm tracking-[0.18em] text-white/75 uppercase">Abha HRMS</div>
                <h1 className="mt-5 max-w-2xl text-5xl font-semibold tracking-[-0.05em] xl:text-6xl">
                  Professional workforce control for HR teams and employees.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-white/86 xl:text-lg">
                  Manage attendance, leave, people records, and reporting inside a single operational workspace built for clear daily execution.
                </p>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <article className="rounded-[1.5rem] border border-white/14 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-xs tracking-[0.18em] text-white/70 uppercase">Access</div>
                  <div className="mt-2 text-2xl font-semibold">Role-safe</div>
                </article>
                <article className="rounded-[1.5rem] border border-white/14 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-xs tracking-[0.18em] text-white/70 uppercase">Attendance</div>
                  <div className="mt-2 text-2xl font-semibold">GPS Ready</div>
                </article>
                <article className="rounded-[1.5rem] border border-white/14 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-xs tracking-[0.18em] text-white/70 uppercase">Reporting</div>
                  <div className="mt-2 text-2xl font-semibold">Monthly</div>
                </article>
              </div>
            </div>
          </section>

          {/* Mobile brand strip — visible only below lg */}
          <div className="lg:hidden flex items-center gap-3 px-2 pt-1 pb-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">Abha HRMS</div>
              <div className="text-xs text-muted">Workforce management platform</div>
            </div>
          </div>

          {/* Form panel */}
          <div className="flex items-center justify-center p-1 sm:p-2">
            <LoginForm />
          </div>

        </div>
      </div>
    </main>
  );
}
