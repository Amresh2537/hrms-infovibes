"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

export function ResetPasswordForm({ token }: { token: string }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");
    setMessage("");

    if (!token) {
      setStatus("error");
      setMessage("Reset token is missing.");
      return;
    }

    if (newPassword.length < 4) {
      setStatus("error");
      setMessage("Password must be at least 4 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus("error");
      setMessage(data.error ?? "Could not reset password.");
      return;
    }

    setStatus("ok");
    setMessage(data.message ?? "Password has been reset successfully.");
    startTransition(() => {
      setNewPassword("");
      setConfirmPassword("");
    });
  }

  return (
    <main className="grid-overlay flex min-h-screen items-center justify-center px-4 py-10">
      <div className="panel-strong w-full max-w-md rounded-[1.8rem] p-6 sm:p-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-foreground">Reset Password</h1>
          <p className="text-sm text-muted">Set a new password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block space-y-2 text-sm font-medium">
            <span className="text-muted">New Password</span>
            <input
              type="password"
              required
              minLength={4}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-foreground outline-none transition focus:border-brand focus:shadow-[0_0_0_4px_rgba(15,118,110,0.12)]"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium">
            <span className="text-muted">Confirm Password</span>
            <input
              type="password"
              required
              minLength={4}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
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
            {isPending ? "Updating..." : "Reset Password"}
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
