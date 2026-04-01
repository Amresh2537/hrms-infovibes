"use client";

import { useEffect, useState } from "react";

type LiveClockProps = {
  /** "header" = compact single-line; "card" = large display */
  variant?: "header" | "card";
};

function getISTString(type: "time" | "date"): string {
  const now = new Date();
  if (type === "time") {
    return now.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }
  return now.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function LiveClock({ variant = "card" }: LiveClockProps) {
  const [time, setTime] = useState(() => getISTString("time"));
  const [date, setDate] = useState(() => getISTString("date"));

  useEffect(() => {
    setTime(getISTString("time"));
    setDate(getISTString("date"));

    const id = setInterval(() => {
      setTime(getISTString("time"));
      setDate(getISTString("date"));
    }, 1000);

    return () => clearInterval(id);
  }, []);

  if (variant === "header") {
    return (
      <div className="hidden items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1.5 text-xs font-mono font-medium text-[#475569] md:flex">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
        <span className="tabular-nums">{time}</span>
        <span className="text-[#94a3b8]">IST</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between rounded-[2rem] bg-brand p-6 text-white shadow-[0_22px_50px_rgba(15,118,110,0.26)]">
      <div className="flex items-center gap-2 text-sm tracking-[0.14em] text-white/70 uppercase">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
        Live — India Standard Time
      </div>
      <div className="mt-3 font-mono text-4xl font-bold tracking-[-0.03em] tabular-nums leading-none sm:text-5xl">
        {time}
      </div>
      <div className="mt-2 text-sm text-white/75 leading-relaxed">{date}</div>
    </div>
  );
}
