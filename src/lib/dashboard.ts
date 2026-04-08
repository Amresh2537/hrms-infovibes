import { connectToDatabase } from "@/lib/db";
import Attendance from "@/models/Attendance";
import Employee from "@/models/Employee";
import Leave from "@/models/Leave";
import { endOfDay, endOfMonth, startOfDay, startOfMonth } from "@/lib/date";

export async function getHrDashboardData() {
  await connectToDatabase();

  const todayStart = startOfDay();
  const todayEnd = endOfDay();
  const currentYear = todayStart.getFullYear();
  const currentMonth = todayStart.getMonth() + 1;
  const monthStart = startOfMonth(currentYear, currentMonth);
  const monthEnd = endOfMonth(currentYear, currentMonth);

  const [
    totalEmployees,
    todayAttendance,
    pendingLeaves,
    monthlyAttendance,
    employees,
    leaves,
    presentToday,
    onLeaveToday,
  ] = await Promise.all([
    Employee.countDocuments({ status: "active" }),
    Attendance.find({ date: { $gte: todayStart, $lte: todayEnd } })
      .populate("employeeId", "name empCode department designation")
      .sort({ checkInTime: -1 })
      .lean(),
    Leave.countDocuments({ status: "Pending" }),
    Attendance.countDocuments({ date: { $gte: monthStart, $lte: monthEnd } }),
    Employee.find().sort({ createdAt: -1 }).lean(),
    Leave.find({ status: "Pending" })
      .populate("employeeId", "name empCode department")
      .sort({ createdAt: -1 })
      .lean(),
    Attendance.countDocuments({
      date: { $gte: todayStart, $lte: todayEnd },
      checkInTime: { $ne: null },
      status: { $ne: "Absent" },
    }),
    Leave.countDocuments({
      status: "Approved",
      fromDate: { $lte: todayEnd },
      toDate: { $gte: todayStart },
    }),
  ]);

  return {
    totalEmployees,
    todayAttendance,
    pendingLeaves,
    monthlyAttendance,
    employees,
    leaves,
    presentToday,
    onLeaveToday,
  };
}

export async function getEmployeeDashboardData(employeeId: string) {
  await connectToDatabase();

  const todayStart = startOfDay();
  const todayEnd = endOfDay();

  const [employee, todayAttendance, attendances, leaves] = await Promise.all([
    Employee.findById(employeeId).lean(),
    Attendance.findOne({ employeeId, date: { $gte: todayStart, $lte: todayEnd } }).lean(),
    Attendance.find({ employeeId }).sort({ date: -1 }).limit(10).lean(),
    Leave.find({ employeeId }).sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  return {
    employee,
    todayAttendance,
    attendances,
    leaves,
  };
}