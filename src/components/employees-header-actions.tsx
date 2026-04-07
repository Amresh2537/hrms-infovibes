"use client";

import Link from "next/link";

export function EmployeesHeaderActions() {
  function openAddEmployeeDialog() {
    window.dispatchEvent(new Event("open-add-employee-dialog"));
  }

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={openAddEmployeeDialog}
        className="flex items-center gap-2 rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d9488]"
      >
        Add Employee
      </button>
      <Link
        href="/api/employees/export"
        className="flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-4 py-2 text-sm font-semibold text-[#1e293b] shadow-sm transition hover:bg-[#f8fafc]"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export CSV
      </Link>
    </div>
  );
}
