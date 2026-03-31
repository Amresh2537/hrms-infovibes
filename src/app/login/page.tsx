import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="grid-overlay flex flex-1 items-center justify-center px-6 py-12 md:px-10 md:py-16">
      <div className="w-full max-w-6xl rounded-[2.75rem] border border-line bg-white/35 p-4 shadow-[0_30px_90px_rgba(23,33,38,0.12)] backdrop-blur-sm md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="panel-strong relative overflow-hidden rounded-[2.2rem] bg-brand px-8 py-10 text-white md:px-10 md:py-12">
            <div className="absolute -right-14 top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 right-8 h-28 w-28 rounded-full bg-accent/30 blur-2xl" />
            <div className="relative">
              <div className="text-sm tracking-[0.18em] text-white/75 uppercase">Abha HRMS</div>
              <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.05em] md:text-6xl">
                Professional workforce control for HR teams and employees.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/86 md:text-lg">
                Manage attendance, leave, people records, and reporting inside a single operational workspace built for clear daily execution.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
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

          <div className="flex items-center justify-center p-2">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
