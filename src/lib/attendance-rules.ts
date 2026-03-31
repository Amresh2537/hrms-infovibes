import { connectToDatabase } from "@/lib/db";
import Settings from "@/models/Settings";

export type AttendanceRules = {
  officeStartTime: string;  // e.g. "09:00" — shift start
  lateMarkAfter: string;    // e.g. "09:15" — after this = Late
  halfDayAfter: string;     // e.g. "10:00" — after this = Half Day
  absentAfter: string;      // e.g. "13:00" — after this = Absent (cannot check in)
};

export async function getAttendanceRules(): Promise<AttendanceRules> {
  await connectToDatabase();
  const settings = await Settings.findOne({ singleton: "global" }).lean();

  return {
    officeStartTime: settings?.workingHours?.start ?? "09:00",
    lateMarkAfter: settings?.attendanceRules?.lateMarkAfter ?? "09:15",
    halfDayAfter: settings?.attendanceRules?.halfDayAfter ?? "10:00",
    absentAfter: settings?.attendanceRules?.absentAfter ?? "13:00",
  };
}

/** Returns total minutes since midnight for a "HH:MM" string */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export type AttendanceStatus = "Present" | "Late" | "Half Day" | "Absent" | "Outside Location";

export function resolveStatusFromRules(
  checkInTime: Date,
  isInsideRadius: boolean,
  rules: AttendanceRules,
): AttendanceStatus {
  if (!isInsideRadius) return "Outside Location";

  const totalMinutes = checkInTime.getHours() * 60 + checkInTime.getMinutes();
  const absentMinutes = timeToMinutes(rules.absentAfter);
  const halfDayMinutes = timeToMinutes(rules.halfDayAfter);
  const lateMinutes = timeToMinutes(rules.lateMarkAfter);

  if (totalMinutes >= absentMinutes) return "Absent";
  if (totalMinutes >= halfDayMinutes) return "Half Day";
  if (totalMinutes >= lateMinutes) return "Late";
  return "Present";
}
