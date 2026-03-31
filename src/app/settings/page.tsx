import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Settings from "@/models/Settings";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const session = await requireRole("HR");
  await connectToDatabase();

  let settings = await Settings.findOne({ singleton: "global" }).lean();
  if (!settings) {
    settings = await Settings.create({ singleton: "global" });
  }

  const s = settings;

  const initial = {
    companyName: s.companyName ?? "My Company",
    companyEmail: s.companyEmail ?? "",
    companyPhone: s.companyPhone ?? "",
    companyAddress: s.companyAddress ?? "",
    companyWebsite: s.companyWebsite ?? "",
    timezone: s.timezone ?? "Asia/Kolkata",
    dateFormat: s.dateFormat ?? "DD/MM/YYYY",
    timeFormat: s.timeFormat ?? "12",
    language: s.language ?? "English",
    fiscalYearStart: s.fiscalYearStart ?? "April",
    notifications: {
      email: s.notifications?.email ?? true,
      sms: s.notifications?.sms ?? false,
      push: s.notifications?.push ?? true,
    },
    officeLocation: {
      lat: s.officeLocation?.lat ?? 28.6139,
      lng: s.officeLocation?.lng ?? 77.209,
      radius: s.officeLocation?.radius ?? 500,
      address: s.officeLocation?.address ?? "",
      allowRemoteCheckIn: s.officeLocation?.allowRemoteCheckIn ?? false,
    },
    workingHours: {
      start: s.workingHours?.start ?? "09:00",
      end: s.workingHours?.end ?? "18:00",
      lateThresholdMinutes: s.workingHours?.lateThresholdMinutes ?? 15,
    },
    workingDays: (s.workingDays ?? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]) as (
      | "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday"
    )[],
    attendanceRules: {
      lateMarkAfter: s.attendanceRules?.lateMarkAfter ?? "09:15",
      halfDayAfter: s.attendanceRules?.halfDayAfter ?? "10:00",
      absentAfter: s.attendanceRules?.absentAfter ?? "13:00",
      weekends: (s.attendanceRules?.weekends as string[]) ?? ["Saturday", "Sunday"],
    },
    shifts: (s.shifts ?? []).map((sh) => ({
      name: sh.name,
      start: sh.start,
      end: sh.end,
      lateThresholdMinutes: sh.lateThresholdMinutes ?? 15,
    })),
    leavePolicy: {
      CL: {
        annualEntitlement: s.leavePolicy?.CL?.annualEntitlement ?? 10,
        maxConsecutiveDays: s.leavePolicy?.CL?.maxConsecutiveDays ?? 3,
        carryForward: s.leavePolicy?.CL?.carryForward ?? false,
        minNoticeDays: s.leavePolicy?.CL?.minNoticeDays ?? 1,
      },
      SL: {
        annualEntitlement: s.leavePolicy?.SL?.annualEntitlement ?? 23,
        maxConsecutiveDays: s.leavePolicy?.SL?.maxConsecutiveDays ?? 7,
        carryForward: s.leavePolicy?.SL?.carryForward ?? false,
        minNoticeDays: s.leavePolicy?.SL?.minNoticeDays ?? 0,
        requiresMedicalCertificate: s.leavePolicy?.SL?.requiresMedicalCertificate ?? false,
      },
      EL: {
        annualEntitlement: s.leavePolicy?.EL?.annualEntitlement ?? 1,
        maxConsecutiveDays: s.leavePolicy?.EL?.maxConsecutiveDays ?? 15,
        carryForward: s.leavePolicy?.EL?.carryForward ?? true,
        minNoticeDays: s.leavePolicy?.EL?.minNoticeDays ?? 7,
      },
    },
    payroll: {
      paymentCycle: s.payroll?.paymentCycle ?? "Monthly",
      paymentDate: s.payroll?.paymentDate ?? 1,
      taxPercentage: s.payroll?.taxPercentage ?? 10,
      overtimeRate: s.payroll?.overtimeRate ?? 1.5,
    },
    holidays: (s.holidays ?? []).map((h) => ({
      date: h.date,
      name: h.name,
      description: h.description ?? "",
    })),
    security: {
      passwordMinLength: s.security?.passwordMinLength ?? 8,
      passwordExpiry: s.security?.passwordExpiry ?? 90,
      requireUppercase: s.security?.requireUppercase ?? false,
      requireNumbers: s.security?.requireNumbers ?? false,
      requireSpecialChars: s.security?.requireSpecialChars ?? false,
      twoFactorAuth: s.security?.twoFactorAuth ?? false,
      accountLockout: s.security?.accountLockout ?? false,
      maxFailedAttempts: s.security?.maxFailedAttempts ?? 5,
      lockoutDuration: s.security?.lockoutDuration ?? 30,
      sessionTimeout: s.security?.sessionTimeout ?? 60,
    },
  };

  return (
    <AppShell role={session.role} name={session.name} email={session.email}>
      <div className="p-6 md:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#0f172a]">Settings</h1>
          <p className="mt-0.5 text-sm text-[#64748b]">Manage your system settings</p>
        </div>
        <SettingsForm initialSettings={initial} />
      </div>
    </AppShell>
  );
}