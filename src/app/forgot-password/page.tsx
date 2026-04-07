"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");
    setMessage("");

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus("error");
      setMessage(data.error ?? "Could not send reset link.");
      return;
    }

    setStatus("ok");
    setMessage(data.message ?? "If this email is registered, a reset link has been sent.");
    startTransition(() => {
      setEmail("");
    });
  }

  return (
    <main className="grid-overlay flex min-h-screen items-center justify-center px-4 py-10">
      <div className="panel-strong w-full max-w-md rounded-[1.8rem] p-6 sm:p-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-foreground">Forgot Password</h1>
          <p className="text-sm text-muted">Enter your email and we will send a reset link.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block space-y-2 text-sm font-medium">
            <span className="text-muted">Email address</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-foreground outline-none transition focus:border-brand focus:shadow-[0_0_0_4px_rgba(15,118,110,0.12)]"
            />
          </label>

          {status !== "idle" ? (
            <div className={`rounded-xl px-4 py-3 text-sm ${status === "ok" ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-red-200 bg-red-50 text-red-700"}`}>
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-brand px-5 py-3 font-semibold text-white transition hover:bg-brand-strong disabled:opacity-60"
          >
            {isPending ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-muted">
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}
