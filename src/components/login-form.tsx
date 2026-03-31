"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);

    const payload = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Login failed.");
      return;
    }

    startTransition(() => {
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form
      action={handleSubmit}
      className="panel-strong w-full max-w-md rounded-[1.9rem] p-8"
    >
      <div className="space-y-3">
        <div className="chip text-brand">Secure Sign In</div>
        <h1 className="text-3xl font-semibold tracking-[-0.04em]">Access your workspace</h1>
        <p className="text-sm leading-6 text-muted">
          Use HR credentials for admin controls or employee credentials for attendance and leave.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block space-y-2 text-sm font-medium">
          <span className="text-muted">Email</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none transition focus:border-brand focus:shadow-[0_0_0_4px_rgba(15,118,110,0.12)]"
          />
        </label>

        <label className="block space-y-2 text-sm font-medium">
          <span className="text-muted">Password</span>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none transition focus:border-brand focus:shadow-[0_0_0_4px_rgba(15,118,110,0.12)]"
          />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

      <div className="mt-5 rounded-[1.25rem] border border-line bg-white/72 p-4 text-sm text-muted">
        Session security uses HTTP-only cookies and role-based route protection.
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 w-full rounded-full bg-brand px-5 py-3 font-semibold text-white transition hover:bg-brand-strong disabled:opacity-60"
      >
        {isPending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
