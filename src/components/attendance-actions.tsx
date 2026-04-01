"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LiveClock } from "@/components/live-clock";

type Position = {
  lat: number;
  lng: number;
};

function getCurrentPosition() {
  return new Promise<Position>((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported in this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => reject(new Error("Location access was denied.")),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });
}

export function AttendanceActions({ hasCheckedIn }: { hasCheckedIn: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleCheckIn() {
    setError(null);
    setMessage(null);

    try {
      const position = await getCurrentPosition();
      const response = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(position),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Attendance check-in failed.");
        return;
      }

      setMessage(`Check-in recorded with status ${data.attendance.status}.`);
      startTransition(() => router.refresh());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Attendance check-in failed.");
    }
  }

  async function handleCheckOut() {
    setError(null);
    setMessage(null);

    const response = await fetch("/api/attendance/check-out", {
      method: "POST",
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Attendance check-out failed.");
      return;
    }

    setMessage("Check-out recorded successfully.");
    startTransition(() => router.refresh());
  }

  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#1e293b]">Attendance</h2>
          <p className="mt-0.5 text-xs text-[#64748b]">Mark your check-in and check-out for today.</p>
        </div>
        <LiveClock variant="header" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleCheckIn}
          disabled={isPending || hasCheckedIn}
            className="rounded-lg bg-[#0f766e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d9488] disabled:opacity-50"
        >
          Mark Attendance
        </button>
        <button
          type="button"
          onClick={handleCheckOut}
          disabled={isPending || !hasCheckedIn}
          className="rounded-lg border border-[#e2e8f0] bg-white px-5 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#f8fafc] disabled:opacity-50"
        >
          Check Out
        </button>
      </div>
      {message ? <p className="mt-3 text-sm text-[#0f766e]">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-[#ef4444]">{error}</p> : null}
    </div>
  );
}