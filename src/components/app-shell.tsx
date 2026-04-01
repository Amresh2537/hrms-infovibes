"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { LogoutButton } from "@/components/logout-button";
import { LiveClock } from "@/components/live-clock";

type SessionRole = "HR" | "EMPLOYEE";

type ShellProps = {
  role: SessionRole;
  name: string;
  email: string;
  children: React.ReactNode;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

/* ── inline SVG icons ── */
function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconClipboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}
function IconBarChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function IconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

const hrNavItems: NavItem[] = [
  { href: "/dashboard/hr", label: "Dashboard", icon: <IconDashboard /> },
  { href: "/dashboard/hr/employees", label: "Employees", icon: <IconUsers /> },
  { href: "/dashboard/hr/attendance", label: "Attendance", icon: <IconCalendar /> },
  { href: "/dashboard/hr/leaves", label: "Leave Requests", icon: <IconClipboard /> },
  { href: "/reports", label: "Reports", icon: <IconBarChart /> },
  { href: "/settings", label: "Settings", icon: <IconSettings /> },
];

const employeeNavItems: NavItem[] = [
  { href: "/dashboard/employee", label: "Dashboard", icon: <IconDashboard /> },
  { href: "/dashboard/employee/attendance", label: "Attendance", icon: <IconCalendar /> },
  { href: "/dashboard/employee/leave", label: "Leave", icon: <IconClipboard /> },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard/hr" || href === "/dashboard/employee") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ role, name, email, children }: ShellProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const navItems = useMemo(() => (role === "HR" ? hrNavItems : employeeNavItems), [role]);
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity md:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col bg-[#0f2027] text-white transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">HRMS Admin</span>
        </div>

        {/* User info */}
        <div className="border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">{name}</div>
              <div className="truncate text-xs text-white/50">{email}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-white">
            Main Menu
          </div>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-white/15 text-white"
                        : "text-white hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-white">
                        {item.icon}
                      </span>
                      {item.label}
                    </span>
                    {active && (
                      <span className="h-2 w-2 rounded-full bg-brand" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 px-3 py-4">
          <LogoutButton />
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
        {/* Top header bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-[#e2e8f0] bg-white px-4 md:px-6">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="rounded-lg p-2 text-[#64748b] hover:bg-[#f1f5f9] md:hidden"
          >
            <IconMenu />
          </button>

          {/* Search — hidden on mobile */}
          <div className="hidden flex-1 items-center gap-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm text-[#64748b] sm:flex sm:max-w-xs">
            <IconSearch />
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 bg-transparent outline-none placeholder:text-[#94a3b8]"
            />
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {/* Live IST clock */}
            <LiveClock variant="header" />
            {/* Bell */}
            <button
              type="button"
              className="relative rounded-full p-2 text-[#64748b] hover:bg-[#f1f5f9]"
            >
              <IconBell />
            </button>
            {/* Avatar */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#f1f5f9]">
          {children}
        </main>
      </div>
    </div>
  );
}

