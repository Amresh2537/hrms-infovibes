"use client";

import { useEffect, useState } from "react";

type AttendanceRow = {
  employeeId: string;
  name: string;
  empCode: string;
  department: string;
  designation: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: "Present" | "Absent" | "Late" | "Outside Location";
  location: { lat: number; lng: number } | null;
  distanceFromOffice: number | null;
};

function fmt(val: string | null) {
  if (!val) return "-";
  return new Intl.DateTimeFormat("en-IN", { timeStyle: "short" }).format(new Date(val));
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const statusClsMap: Record<string, string> = {
  Present: "bg-[#dcfce7] text-[#166534]",
  Late: "bg-[#fef9c3] text-[#854d0e]",
  Absent: "bg-[#fee2e2] text-[#991b1b]",
  "Outside Location": "bg-[#e0e7ff] text-[#0f766e]",
};

export default function HrAttendancePage() {
  const today = todayIso();
  const [filterMode, setFilterMode] = useState<"single" | "range">("single");
  const [date, setDate] = useState(today);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterMode === "range") {
      params.set("fromDate", fromDate);
      params.set("toDate", toDate);
    } else {
      params.set("date", date);
    }
    if (department) params.set("department", department);
    const res = await fetch(`/api/attendance?${params}`);
    if (res.ok) {
      const json = await res.json();
      setRows(json.rows ?? []);
      setDepartments(json.departments ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = rows.length;
  const present = rows.filter((r) => r.status === "Present" || r.status === "Late").length;
  const absent = rows.filter((r) => r.status === "Absent").length;
  const late = rows.filter((r) => r.status === "Late").length;

  const statCards = [
    { label: "Total", value: total, bg: "bg-[#f0fdf4]", color: "text-[#166534]", border: "border-[#bbf7d0]" },
    { label: "Present", value: present, bg: "bg-[#f0fdf4]", color: "text-[#166534]", border: "border-[#bbf7d0]" },
    { label: "Absent", value: absent, bg: "bg-[#fef2f2]", color: "text-[#991b1b]", border: "border-[#fecaca]" },
    { label: "Late", value: late, bg: "bg-[#fffbeb]", color: "text-[#854d0e]", border: "border-[#fde68a]" },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e293b]">Attendance Management</h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Track employee attendance — filter by a specific date or a date range
        </p>
      </div>

      {/* Filter card */}
      <div className="mb-6 rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        {/* Mode toggle */}
        <div className="mb-4 flex items-center gap-1 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-1 w-fit">
          <button
            type="button"
            onClick={() => setFilterMode("single")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              filterMode === "single"
                ? "bg-white shadow-sm text-[#1e293b]"
                : "text-[#64748b] hover:text-[#1e293b]"
            }`}
          >
            Single Date
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("range")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              filterMode === "range"
                ? "bg-white shadow-sm text-[#1e293b]"
                : "text-[#64748b] hover:text-[#1e293b]"
            }`}
          >
            Date Range
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          {filterMode === "single" ? (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm text-[#1e293b] outline-none focus:border-[#0f766e] focus:bg-white"
              />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">From</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm text-[#1e293b] outline-none focus:border-[#0f766e] focus:bg-white"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">To</label>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm text-[#1e293b] outline-none focus:border-[#0f766e] focus:bg-white"
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm text-[#1e293b] outline-none focus:border-[#0f766e] focus:bg-white"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={fetchData}
            className="rounded-lg bg-[#0f766e] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0d9488]"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`flex items-center justify-between rounded-xl border p-5 ${card.bg} ${card.border}`}
          >
            <div>
              <div className="text-sm font-medium text-[#64748b]">{card.label}</div>
              <div className={`mt-0.5 text-3xl font-bold ${card.color}`}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-sm text-[#64748b]">Loading...</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Distance</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-[#64748b]">
                      No records found for the selected period.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.employeeId} className="hover:bg-[#f8fafc]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ccfbf1] text-xs font-bold text-[#0f766e]">
                            {row.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-[#1e293b]">{row.name}</div>
                            <div className="text-xs text-[#64748b]">{row.empCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#475569]">{row.department || "Unassigned"}</td>
                      <td className="px-6 py-4">
                        <div className="text-[#1e293b]">{fmt(row.checkInTime)}</div>
                        {row.location && (
                          <div className="text-xs text-[#64748b]">
                            {row.location.lat.toFixed(4)}, {row.location.lng.toFixed(4)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[#475569]">{fmt(row.checkOutTime)}</td>
                      <td className="px-6 py-4 text-xs text-[#475569]">
                        {row.distanceFromOffice != null ? `${row.distanceFromOffice} m` : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            statusClsMap[row.status] ?? "bg-[#f1f5f9] text-[#64748b]"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
