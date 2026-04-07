"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Day = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
const ALL_DAYS: Day[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Shift = { name: string; start: string; end: string; lateThresholdMinutes: number };
type Holiday = { date: string; name: string; description: string };
type Branch = { id: string; name: string; address: string; lat: number; lng: number; radius: number };

export type InitialSettings = {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyWebsite: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
  fiscalYearStart: string;
  notifications: { email: boolean; sms: boolean; push: boolean };
  officeLocation: { lat: number; lng: number; radius: number; address: string; allowRemoteCheckIn: boolean };
  branches: Branch[];
  workingHours: { start: string; end: string; lateThresholdMinutes: number };
  workingDays: Day[];
  attendanceRules: { lateMarkAfter: string; halfDayAfter: string; absentAfter: string; weekends: string[] };
  shifts: Shift[];
  leavePolicy: {
    CL: { annualEntitlement: number; maxConsecutiveDays: number; carryForward: boolean; minNoticeDays: number };
    SL: { annualEntitlement: number; maxConsecutiveDays: number; carryForward: boolean; minNoticeDays: number; requiresMedicalCertificate: boolean };
    EL: { annualEntitlement: number; maxConsecutiveDays: number; carryForward: boolean; minNoticeDays: number };
  };
  payroll: { paymentCycle: string; paymentDate: number; taxPercentage: number; overtimeRate: number };
  holidays: Holiday[];
  security: {
    passwordMinLength: number; passwordExpiry: number;
    requireUppercase: boolean; requireNumbers: boolean; requireSpecialChars: boolean;
    twoFactorAuth: boolean; accountLockout: boolean;
    maxFailedAttempts: number; lockoutDuration: number; sessionTimeout: number;
  };
};

const cls = {
  input: "w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-sm outline-none transition focus:border-[#4f46e5] focus:bg-white",
  label: "block text-sm font-medium text-[#374151]",
  select: "w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-sm outline-none transition focus:border-[#4f46e5]",
  card: "rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm",
  saveBtn: "rounded-lg bg-[#4f46e5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4338ca] disabled:opacity-60",
  toggle: "relative inline-flex h-5 w-9 cursor-pointer rounded-full border-2 border-transparent transition-colors",
};

function useSave() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  async function save(payload: Record<string, unknown>) {
    setStatus("saving");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setErrMsg(data.error ?? "Save failed"); setStatus("error"); return; }
      setStatus("ok");
      startTransition(() => router.refresh());
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setErrMsg("Network error"); setStatus("error");
    }
  }

  return { save, isPending: isPending || status === "saving", status, errMsg };
}

/* ── Section: Company ── */
function CompanySection({ init }: { init: Pick<InitialSettings,"companyName"|"companyEmail"|"companyPhone"|"companyAddress"|"companyWebsite"> }) {
  const [f, setF] = useState(init);
  const { save, isPending, status, errMsg } = useSave();
  return (
    <div className={cls.card}>
      <div className="mb-5 border-b border-[#f1f5f9] pb-4">
        <h2 className="text-base font-semibold text-[#1e293b]">Company Information</h2>
        <p className="text-xs text-[#94a3b8]">Update your company details and contact information.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {([["Company Name","companyName","text"],["Email Address","companyEmail","email"],["Phone Number","companyPhone","tel"],["Address","companyAddress","text"],["Website","companyWebsite","url"]] as [string,keyof typeof f,string][]).map(([label,key,type]) => (
          <label key={key} className="block space-y-1.5">
            <span className={cls.label}>{label}</span>
            <input type={type} className={cls.input} value={f[key] as string} onChange={e => setF(p => ({...p,[key]:e.target.value}))} />
          </label>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button className={cls.saveBtn} disabled={isPending} onClick={() => save({ companyName:f.companyName, companyEmail:f.companyEmail, companyPhone:f.companyPhone, companyAddress:f.companyAddress, companyWebsite:f.companyWebsite })}>
          {isPending ? "Saving…" : "Save Company Settings"}
        </button>
        {status === "ok" && <span className="text-sm text-emerald-600">Saved.</span>}
        {status === "error" && <span className="text-sm text-red-500">{errMsg}</span>}
      </div>
    </div>
  );
}

/* ── Section: System ── */
function SystemSection({ init }: { init: Pick<InitialSettings,"timezone"|"dateFormat"|"timeFormat"|"language"|"fiscalYearStart"> }) {
  const [f, setF] = useState(init);
  const { save, isPending, status, errMsg } = useSave();
  const field = (label: string, key: keyof typeof f, options: string[]) => (
    <label key={key} className="block space-y-1.5">
      <span className={cls.label}>{label}</span>
      <select className={cls.select} value={f[key]} onChange={e => setF(p => ({...p,[key]:e.target.value}))}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
  return (
    <div className={cls.card}>
      <div className="mb-5 border-b border-[#f1f5f9] pb-4">
        <h2 className="text-base font-semibold text-[#1e293b]">System Settings</h2>
        <p className="text-xs text-[#94a3b8]">Configure system-wide settings and preferences.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {field("Time Zone","timezone",["Asia/Kolkata","Asia/Dhaka","Asia/Dubai","America/New_York","America/Los_Angeles","Europe/London","Europe/Berlin","UTC"])}
        {field("Date Format","dateFormat",["DD/MM/YYYY","MM/DD/YYYY","YYYY-MM-DD"])}
        {field("Time Format","timeFormat",["12","24"])}
        {field("Default Language","language",["English","Hindi","Bengali","Urdu"])}
        {field("Fiscal Year Start","fiscalYearStart",["January","April","July","October"])}
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button className={cls.saveBtn} disabled={isPending} onClick={() => save(f)}>
          {isPending ? "Saving…" : "Save System Settings"}
        </button>
        {status === "ok" && <span className="text-sm text-emerald-600">Saved.</span>}
        {status === "error" && <span className="text-sm text-red-500">{errMsg}</span>}
      </div>
    </div>
  );
}

/* ── Section: Notifications ── */
function NotificationsSection({ init }: { init: InitialSettings["notifications"] }) {
  const [f, setF] = useState(init);
  const { save, isPending, status, errMsg } = useSave();
  const toggle = (key: keyof typeof f) => (
    <div key={key} className="flex items-center justify-between rounded-lg border border-[#e2e8f0] px-4 py-3">
      <div>
        <p className="text-sm font-medium text-[#1e293b]">
          {key === "email" ? "Email Notifications" : key === "sms" ? "SMS Notifications" : "Push Notifications"}
        </p>
        <p className="text-xs text-[#94a3b8]">
          {key === "email" ? "Receive notifications via email." : key === "sms" ? "Receive notifications via SMS." : "Receive push notifications in the app."}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setF(p => ({...p,[key]:!p[key]}))}
        className={`${cls.toggle} ${f[key] ? "bg-[#4f46e5]" : "bg-[#cbd5e1]"}`}
        aria-pressed={f[key]}
      >
        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${f[key] ? "translate-x-4" : "translate-x-0"}`} />
      </button>
    </div>
  );
  return (
    <div className={cls.card}>
      <div className="mb-5 border-b border-[#f1f5f9] pb-4">
        <h2 className="text-base font-semibold text-[#1e293b]">Notification Settings</h2>
        <p className="text-xs text-[#94a3b8]">Configure how and when notifications are sent.</p>
      </div>
      <div className="space-y-3">
        {toggle("email")}
        {toggle("sms")}
        {toggle("push")}
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button className={cls.saveBtn} disabled={isPending} onClick={() => save({ notifications: f })}>
          {isPending ? "Saving…" : "Save Notification Settings"}
        </button>
        {status === "ok" && <span className="text-sm text-emerald-600">Saved.</span>}
        {status === "error" && <span className="text-sm text-red-500">{errMsg}</span>}
      </div>
    </div>
  );
}

/* ── Section: Leave Settings ── */
function LeaveSection({ init }: { init: InitialSettings["leavePolicy"] }) {
  const [f, setF] = useState(init);
  const { save, isPending, status, errMsg } = useSave();
  const leaveRow = (label: string, key: "CL" | "SL" | "EL") => (
    <div key={key} className="rounded-lg border border-[#e2e8f0] p-4">
      <div className="mb-3 text-sm font-semibold text-[#4f46e5] uppercase tracking-wide">{label}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className={cls.label}>Annual Entitlement (Days)</span>
          <input type="number" min="0" className={cls.input} value={f[key].annualEntitlement}
            onChange={e => setF(p => ({...p,[key]:{...p[key],annualEntitlement:Number(e.target.value)}}))} />
        </label>
        <label className="block space-y-1.5">
          <span className={cls.label}>Max Consecutive Days</span>
          <input type="number" min="1" className={cls.input} value={f[key].maxConsecutiveDays}
            onChange={e => setF(p => ({...p,[key]:{...p[key],maxConsecutiveDays:Number(e.target.value)}}))} />
        </label>
        <label className="block space-y-1.5">
          <span className={cls.label}>Min Notice Days</span>
          <input type="number" min="0" className={cls.input} value={f[key].minNoticeDays}
            onChange={e => setF(p => ({...p,[key]:{...p[key],minNoticeDays:Number(e.target.value)}}))} />
        </label>
        <label className="flex items-center gap-3 text-sm font-medium text-[#374151]">
          <input type="checkbox" className="h-4 w-4 accent-[#4f46e5]" checked={f[key].carryForward}
            onChange={e => setF(p => ({...p,[key]:{...p[key],carryForward:e.target.checked}}))} />
          <span>Carry forward to next year</span>
        </label>
        {"requiresMedicalCertificate" in f[key] && (
          <label className="flex items-center gap-3 text-sm font-medium text-[#374151]">
            <input type="checkbox" className="h-4 w-4 accent-[#4f46e5]"
              checked={(f[key] as typeof f.SL).requiresMedicalCertificate}
              onChange={e => setF(p => ({...p,[key]:{...p[key],requiresMedicalCertificate:e.target.checked}}))} />
            <span>Requires medical certificate</span>
          </label>
        )}
      </div>
    </div>
  );
  return (
    <div className={cls.card}>
      <div className="mb-5 border-b border-[#f1f5f9] pb-4">
        <h2 className="text-base font-semibold text-[#1e293b]">Leave Settings</h2>
        <p className="text-xs text-[#94a3b8]">Configure leave policies and annual leave limits.</p>
      </div>
      <div className="space-y-4">
        {leaveRow("Casual Leave (CL)","CL")}
        {leaveRow("Sick Leave (SL)","SL")}
        {leaveRow("Earned Leave (EL)","EL")}
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button className={cls.saveBtn} disabled={isPending} onClick={() => save({ leavePolicy: f })}>
          {isPending ? "Saving…" : "Save Leave Settings"}
        </button>
        {status === "ok" && <span className="text-sm text-emerald-600">Saved.</span>}
        {status === "error" && <span className="text-sm text-red-500">{errMsg}</span>}
      </div>
    </div>
  );
}

/* ── Section: Attendance Rules ── */
function AttendanceSection({ init, initDays }: { init: InitialSettings["attendanceRules"]; initDays: InitialSettings["workingDays"] }) {
  const [rules, setRules] = useState(init);
  const [workDays, setWorkDays] = useState(initDays);
  const { save, isPending, status, errMsg } = useSave();
  const timeField = (label: string, desc: string, key: keyof typeof rules) => (
    <label key={key} className="block space-y-1.5">
      <span className={cls.label}>{label}</span>
      <input type="time" className={cls.input} value={rules[key] as string}
        onChange={e => setRules(p => ({...p,[key]:e.target.value}))} />
      <span className="text-xs text-[#94a3b8]">{desc}</span>
    </label>
  );
  const toggleDay = (d: Day) => setWorkDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]);
  return (
    <div className={cls.card}>
      <div className="mb-5 border-b border-[#f1f5f9] pb-4">
        <h2 className="text-base font-semibold text-[#1e293b]">Attendance Rules</h2>
        <p className="text-xs text-[#94a3b8]">Configure attendance policies, late marks, and weekend settings.</p>
      </div>
      <div className="mb-5">
        <p className="mb-3 text-sm font-semibold text-[#374151]">Working Days</p>
        <div className="flex flex-wrap gap-2">
          {ALL_DAYS.map(d => (
            <button key={d} type="button" onClick={() => toggleDay(d)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${workDays.includes(d) ? "border-[#4f46e5] bg-[#4f46e5] text-white" : "border-[#e2e8f0] bg-[#f8fafc] text-[#64748b] hover:border-[#4f46e5]"}`}>
              {d.slice(0,3)}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-5">
        <p className="mb-3 text-sm font-semibold text-[#374151]">Time Rules</p>
        <div className="grid gap-4 md:grid-cols-3">
          {timeField("Late Mark After","Time after which check-in is marked late","lateMarkAfter")}
          {timeField("Half Day After","Time after which only half day is counted","halfDayAfter")}
          {timeField("Absent After","Time after which full day absent is marked","absentAfter")}
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold text-[#374151]">Weekend Settings</p>
        <div className="space-y-2">
          {(["Saturday","Sunday"] as const).map(d => (
            <label key={d} className="flex items-center gap-3 text-sm font-medium text-[#374151]">
              <input type="checkbox" className="h-4 w-4 accent-[#4f46e5]"
                checked={rules.weekends.includes(d)}
                onChange={e => setRules(p => ({...p, weekends: e.target.checked ? [...p.weekends,d] : p.weekends.filter(x=>x!==d)}))} />
              <span>{d} is Weekend</span>
            </label>
          ))}
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button className={cls.saveBtn} disabled={isPending}
          onClick={() => save({ attendanceRules: rules, workingDays: workDays })}>
          {isPending ? "Saving…" : "Save Attendance Rules"}
        </button>
        {status === "ok" && <span className="text-sm text-emerald-600">Saved.</span>}
        {status === "error" && <span className="text-sm text-red-500">{errMsg}</span>}
      </div>
    </div>
  );
}

/* ── Section: Payroll ── */
function PayrollSection({ init }: { init: InitialSettings["payroll"] }) {
  const [f, setF] = useState(init);
  const { save, isPending, status, errMsg } = useSave();
  return (
    <div className={cls.card}>
      <div className="mb-5 border-b border-[#f1f5f9] pb-4">
        <h2 className="text-base font-semibold text-[#1e293b]">Payroll Settings</h2>
        <p className="text-xs text-[#94a3b8]">Configure payroll calculation and payment schedules.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-1.5">
          <span className={cls.label}>Payment Cycle</span>
          <select className={cls.select} value={f.paymentCycle} onChange={e => setF(p => ({...p,paymentCycle:e.target.value}))}>
            <option>Monthly</option><option>Bi-weekly</option><option>Weekly</option>
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className={cls.label}>Payment Date (day of month)</span>
          <input type="number" min="1" max="31" className={cls.input} value={f.paymentDate}
            onChange={e => setF(p => ({...p,paymentDate:Number(e.target.value)}))} />
        </label>
        <label className="block space-y-1.5">
          <span className={cls.label}>Tax Percentage (%)</span>
          <input type="number" min="0" max="100" step="0.1" className={cls.input} value={f.taxPercentage}
            onChange={e => setF(p => ({...p,taxPercentage:Number(e.target.value)}))} />
        </label>
        <label className="block space-y-1.5">
          <span className={cls.label}>Overtime Rate (multiplier)</span>
          <input type="number" min="1" step="0.1" className={cls.input} value={f.overtimeRate}
            onChange={e => setF(p => ({...p,overtimeRate:Number(e.target.value)}))} />
        </label>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button className={cls.saveBtn} disabled={isPending} onClick={() => save({ payroll: f })}>
          {isPending ? "Saving…" : "Save Payroll Settings"}
        </button>
        {status === "ok" && <span className="text-sm text-emerald-600">Saved.</span>}
        {status === "error" && <span className="text-sm text-red-500">{errMsg}</span>}
      </div>
    </div>
  );
}

/* ── Section: Location ── */
function LocationSection({ init }: { init: InitialSettings["officeLocation"] }) {
  const [f, setF] = useState(init);
  const { save, isPending, status, errMsg } = useSave();
  return (
    <div className={cls.card}>
      <div className="mb-5 border-b border-[#f1f5f9] pb-4">
        <h2 className="text-base font-semibold text-[#1e293b]">Location Settings</h2>
        <p className="text-xs text-[#94a3b8]">Configure office location and check-in radius for attendance.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-1.5">
          <span className={cls.label}>Office Latitude</span>
          <input type="number" step="any" className={cls.input} value={f.lat}
            onChange={e => setF(p => ({...p,lat:Number(e.target.value)}))} />
        </label>
        <label className="block space-y-1.5">
          <span className={cls.label}>Office Longitude</span>
          <input type="number" step="any" className={cls.input} value={f.lng}
            onChange={e => setF(p => ({...p,lng:Number(e.target.value)}))} />
        </label>
        <label className="block space-y-1.5 md:col-span-2">
          <span className={cls.label}>Check-in Radius (meters)</span>
          <input type="number" min="1" className={cls.input} value={f.radius}
            onChange={e => setF(p => ({...p,radius:Number(e.target.value)}))} />
          <span className="text-xs text-[#94a3b8]">Punch-ins outside this radius will be rejected (default: 200m)</span>
        </label>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg border border-[#e2e8f0] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-[#1e293b]">Allow Remote Check-in</p>
          <p className="text-xs text-[#94a3b8]">Enable this to allow check-ins from any location (ignores radius check).</p>
        </div>
        <button type="button" onClick={() => setF(p => ({...p,allowRemoteCheckIn:!p.allowRemoteCheckIn}))}
          className={`${cls.toggle} ${f.allowRemoteCheckIn ? "bg-[#4f46e5]" : "bg-[#cbd5e1]"}`} aria-pressed={f.allowRemoteCheckIn}>
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${f.allowRemoteCheckIn ? "translate-x-4" : "translate-x-0"}`} />
        </button>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button className={cls.saveBtn} disabled={isPending} onClick={() => save({ officeLocation: f })}>
          {isPending ? "Saving…" : "Save Location Settings"}
        </button>
        {status === "ok" && <span className="text-sm text-emerald-600">Saved.</span>}
        {status === "error" && <span className="text-sm text-red-500">{errMsg}</span>}
      </div>
    </div>
  );
}

/* ── Section: Branches ── */
function BranchesSection({ init }: { init: InitialSettings["branches"] }) {
  const [branches, setBranches] = useState<Branch[]>(init);
  const [newBranch, setNewBranch] = useState<Branch>({
    id: "",
    name: "",
    address: "",
    lat: 28.6139,
    lng: 77.209,
    radius: 500,
  });
  const { save, isPending, status, errMsg } = useSave();

  function saveBranches(updated: Branch[]) {
    save({ branches: updated.map(({ name, address, lat, lng, radius }) => ({ name, address, lat, lng, radius })) });
  }

  function addBranch() {
    if (!newBranch.name.trim()) return;
    const updated = [
      ...branches,
      { ...newBranch, id: `${Date.now()}` },
    ];
    setBranches(updated);
    setNewBranch({ id: "", name: "", address: "", lat: 28.6139, lng: 77.209, radius: 500 });
    saveBranches(updated);
  }

  function removeBranch(index: number) {
    const updated = branches.filter((_, i) => i !== index);
    setBranches(updated);
    saveBranches(updated);
  }

  return (
    <div className={cls.card}>
      <div className="mb-5 border-b border-[#f1f5f9] pb-4">
        <h2 className="text-base font-semibold text-[#1e293b]">Branch Locations</h2>
        <p className="text-xs text-[#94a3b8]">Add all office branches with location coordinates and radius.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block space-y-1.5">
          <span className={cls.label}>Branch Name</span>
          <input type="text" className={cls.input} value={newBranch.name} onChange={(e) => setNewBranch((p) => ({ ...p, name: e.target.value }))} />
        </label>
        <label className="block space-y-1.5">
          <span className={cls.label}>Address</span>
          <input type="text" className={cls.input} value={newBranch.address} onChange={(e) => setNewBranch((p) => ({ ...p, address: e.target.value }))} />
        </label>
        <label className="block space-y-1.5">
          <span className={cls.label}>Latitude</span>
          <input type="number" step="any" className={cls.input} value={newBranch.lat} onChange={(e) => setNewBranch((p) => ({ ...p, lat: Number(e.target.value) }))} />
        </label>
        <label className="block space-y-1.5">
          <span className={cls.label}>Longitude</span>
          <input type="number" step="any" className={cls.input} value={newBranch.lng} onChange={(e) => setNewBranch((p) => ({ ...p, lng: Number(e.target.value) }))} />
        </label>
        <label className="block space-y-1.5 md:col-span-2">
          <span className={cls.label}>Radius (meters)</span>
          <input type="number" min="1" className={cls.input} value={newBranch.radius} onChange={(e) => setNewBranch((p) => ({ ...p, radius: Number(e.target.value) }))} />
        </label>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={addBranch}
          disabled={isPending || !newBranch.name.trim()}
          className="rounded-lg border border-[#4f46e5] px-4 py-2 text-sm font-semibold text-[#4f46e5] transition hover:bg-[#4f46e5] hover:text-white disabled:opacity-50"
        >
          {isPending ? "Saving…" : "+ Add Branch"}
        </button>
        {status === "ok" && <span className="text-sm text-emerald-600">Saved.</span>}
        {status === "error" && <span className="text-sm text-red-500">{errMsg}</span>}
      </div>

      {branches.length > 0 ? (
        <div className="mt-4 overflow-x-auto rounded-lg border border-[#e2e8f0]">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f8fafc]">
              <tr>
                {[
                  "Branch",
                  "Address",
                  "Latitude",
                  "Longitude",
                  "Radius",
                  "Action",
                ].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {branches.map((branch, index) => (
                <tr key={branch.id || `${branch.name}-${index}`}>
                  <td className="px-4 py-2.5 font-medium text-[#1e293b]">{branch.name}</td>
                  <td className="px-4 py-2.5 text-[#64748b]">{branch.address}</td>
                  <td className="px-4 py-2.5 text-[#64748b]">{branch.lat}</td>
                  <td className="px-4 py-2.5 text-[#64748b]">{branch.lng}</td>
                  <td className="px-4 py-2.5 text-[#64748b]">{branch.radius}</td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => removeBranch(index)} disabled={isPending} className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

/* ── Section: Holiday Calendar ── */
function HolidaySection({ init }: { init: Holiday[] }) {
  const [holidays, setHolidays] = useState<Holiday[]>(init);
  const [newH, setNewH] = useState<Holiday>({ date: "", name: "", description: "" });
  const { save, isPending, status, errMsg } = useSave();

  function addHoliday() {
    if (!newH.date || !newH.name) return;
    setHolidays(p => [...p, newH]);
    setNewH({ date: "", name: "", description: "" });
  }
  function removeHoliday(i: number) { setHolidays(p => p.filter((_, idx) => idx !== i)); }

  return (
    <div className={cls.card}>
      <div className="mb-5 border-b border-[#f1f5f9] pb-4">
        <h2 className="text-base font-semibold text-[#1e293b]">Holiday Calendar</h2>
        <p className="text-xs text-[#94a3b8]">Manage company holidays and observances.</p>
      </div>
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <label className="block space-y-1.5">
          <span className={cls.label}>Date</span>
          <input type="date" className={cls.input} value={newH.date}
            onChange={e => setNewH(p => ({...p,date:e.target.value}))} />
        </label>
        <label className="block space-y-1.5">
          <span className={cls.label}>Name</span>
          <input type="text" className={cls.input} placeholder="e.g. Diwali" value={newH.name}
            onChange={e => setNewH(p => ({...p,name:e.target.value}))} />
        </label>
        <label className="block space-y-1.5">
          <span className={cls.label}>Description</span>
          <input type="text" className={cls.input} placeholder="Optional" value={newH.description}
            onChange={e => setNewH(p => ({...p,description:e.target.value}))} />
        </label>
      </div>
      <button type="button" onClick={addHoliday}
        className="mb-5 rounded-lg border border-[#4f46e5] px-4 py-2 text-sm font-semibold text-[#4f46e5] transition hover:bg-[#4f46e5] hover:text-white">
        + Add Holiday
      </button>
      {holidays.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-[#e2e8f0]">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f8fafc]">
              <tr>
                {["Date","Name","Description","Actions"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {holidays.map((h, i) => (
                <tr key={i}>
                  <td className="px-4 py-2.5 text-[#374151]">{h.date}</td>
                  <td className="px-4 py-2.5 font-medium text-[#1e293b]">{h.name}</td>
                  <td className="px-4 py-2.5 text-[#64748b]">{h.description}</td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => removeHoliday(i)}
                      className="text-xs font-medium text-red-500 hover:text-red-700">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-5 flex items-center gap-3">
        <button className={cls.saveBtn} disabled={isPending} onClick={() => save({ holidays })}>
          {isPending ? "Saving…" : "Save Holiday Calendar"}
        </button>
        {status === "ok" && <span className="text-sm text-emerald-600">Saved.</span>}
        {status === "error" && <span className="text-sm text-red-500">{errMsg}</span>}
      </div>
    </div>
  );
}

/* ── Section: Security ── */
function SecuritySection({ init }: { init: InitialSettings["security"] }) {
  const [f, setF] = useState(init);
  const { save, isPending, status, errMsg } = useSave();
  const numField = (label: string, key: keyof typeof f) => (
    <label key={key} className="block space-y-1.5">
      <span className={cls.label}>{label}</span>
      <input type="number" min="0" className={cls.input} value={f[key] as number}
        onChange={e => setF(p => ({...p,[key]:Number(e.target.value)}))} />
    </label>
  );
  const checkField = (label: string, key: keyof typeof f) => (
    <label key={key} className="flex items-center gap-3 text-sm font-medium text-[#374151]">
      <input type="checkbox" className="h-4 w-4 accent-[#4f46e5]" checked={f[key] as boolean}
        onChange={e => setF(p => ({...p,[key]:e.target.checked}))} />
      <span>{label}</span>
    </label>
  );
  return (
    <div className={cls.card}>
      <div className="mb-5 border-b border-[#f1f5f9] pb-4">
        <h2 className="text-base font-semibold text-[#1e293b]">Security Settings</h2>
        <p className="text-xs text-[#94a3b8]">Configure security policies and access controls.</p>
      </div>
      <div className="space-y-5">
        <div>
          <p className="mb-3 text-sm font-semibold text-[#374151]">Password Policy</p>
          <div className="grid gap-4 md:grid-cols-2">
            {numField("Minimum Password Length","passwordMinLength")}
            {numField("Password Expiry (days — 0 = no expiry)","passwordExpiry")}
          </div>
          <div className="mt-3 space-y-2">
            {checkField("Require Uppercase Letters","requireUppercase")}
            {checkField("Require Numbers","requireNumbers")}
            {checkField("Require Special Characters","requireSpecialChars")}
          </div>
        </div>
        <div className="border-t border-[#f1f5f9] pt-5">
          <p className="mb-3 text-sm font-semibold text-[#374151]">Login Security</p>
          <div className="space-y-2">
            {checkField("Enable Two-Factor Authentication","twoFactorAuth")}
            {checkField("Enable Account Lockout","accountLockout")}
          </div>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {numField("Max Failed Attempts","maxFailedAttempts")}
            {numField("Lockout Duration (minutes)","lockoutDuration")}
          </div>
        </div>
        <div className="border-t border-[#f1f5f9] pt-5">
          <p className="mb-3 text-sm font-semibold text-[#374151]">Session Settings</p>
          {numField("Session Timeout (minutes)","sessionTimeout")}
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button className={cls.saveBtn} disabled={isPending} onClick={() => save({ security: f })}>
          {isPending ? "Saving…" : "Save Security Settings"}
        </button>
        {status === "ok" && <span className="text-sm text-emerald-600">Saved.</span>}
        {status === "error" && <span className="text-sm text-red-500">{errMsg}</span>}
      </div>
    </div>
  );
}

/* ── Main SettingsForm ── */
export function SettingsForm({ initialSettings }: { initialSettings: InitialSettings }) {
  const s = initialSettings;
  return (
    <div className="space-y-6">
      <CompanySection init={{ companyName: s.companyName, companyEmail: s.companyEmail, companyPhone: s.companyPhone, companyAddress: s.companyAddress, companyWebsite: s.companyWebsite }} />
      <SystemSection init={{ timezone: s.timezone, dateFormat: s.dateFormat, timeFormat: s.timeFormat, language: s.language, fiscalYearStart: s.fiscalYearStart }} />
      <NotificationsSection init={s.notifications} />
      <LeaveSection init={s.leavePolicy} />
      <AttendanceSection init={s.attendanceRules} initDays={s.workingDays} />
      <PayrollSection init={s.payroll} />
      <LocationSection init={s.officeLocation} />
      <BranchesSection init={s.branches} />
      <HolidaySection init={s.holidays} />
      <SecuritySection init={s.security} />
    </div>
  );
}