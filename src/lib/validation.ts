import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(["HR", "EMPLOYEE"]),
  employeeId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const employeeSchema = z.object({
  name: z.string().min(2),
  empCode: z.string().min(2),
  email: z.email(),
  officialEmail: z.string().optional(),
  phone: z.string().min(6),
  altPhone: z.string().optional(),
  department: z.string().min(2),
  designation: z.string().min(2),
  gender: z.enum(["Male", "Female", "Other", ""]).optional(),
  maritalStatus: z.enum(["Single", "Married", "Divorced", "Widowed", ""]).optional(),
  numChildren: z.number().int().nonnegative().optional(),
  dob: z.string().optional(),
  joinDate: z.string(),
  residenceAddress: z.string().optional(),
  correspondenceAddress: z.string().optional(),
  salary: z.number().nonnegative().optional(),
  workLocation: z.object({
    lat: z.number(),
    lng: z.number(),
    radius: z.number().positive(),
  }),
  leaveBalance: z.object({
    CL: z.number().int().nonnegative(),
    SL: z.number().int().nonnegative(),
  }),
  bankDetails: z.object({
    bankName: z.string().optional(),
    accountHolderName: z.string().optional(),
    accountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
    passbookFileUrl: z.string().optional(),
  }).optional(),
  documents: z.object({
    aadharUrl: z.string().optional(),
    panUrl: z.string().optional(),
    offerLetterUrl: z.string().optional(),
    offerAcceptanceUrl: z.string().optional(),
    joiningLetterUrl: z.string().optional(),
    employeeAgreementUrl: z.string().optional(),
    responsibilitiesLetterUrl: z.string().optional(),
    dresscodeGuidelinesUrl: z.string().optional(),
    resignationFromLastOrgUrl: z.string().optional(),
    resumeUrl: z.string().optional(),
    idUrl: z.string().optional(),
    upiScannerUrl: z.string().optional(),
  }).optional(),
  remarks: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  password: z.string().min(6).optional(),
});

export const attendanceCheckInSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const attendanceCheckOutSchema = z.object({});

export const leaveSchema = z.object({
  type: z.enum(["CL", "SL", "Other"]),
  fromDate: z.string(),
  toDate: z.string(),
  reason: z.string().min(4),
});

export const leaveApprovalSchema = z.object({
  leaveId: z.string().min(1),
  status: z.enum(["Approved", "Rejected"]),
});

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

const shiftSchema = z.object({
  name: z.string().min(1),
  start: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM"),
  end: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM"),
  lateThresholdMinutes: z.number().int().nonnegative().default(15),
});

const holidaySchema = z.object({
  date: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(""),
});

export const settingsSchema = z.object({
  // Company
  companyName: z.string().min(1),
  companyEmail: z.string().default(""),
  companyPhone: z.string().default(""),
  companyAddress: z.string().default(""),
  companyWebsite: z.string().default(""),
  // System
  timezone: z.string().min(1),
  dateFormat: z.string().default("DD/MM/YYYY"),
  timeFormat: z.string().default("12"),
  language: z.string().default("English"),
  fiscalYearStart: z.string().default("April"),
  // Notifications
  notifications: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    push: z.boolean().default(true),
  }).default({ email: true, sms: false, push: true }),
  // Location
  officeLocation: z.object({
    lat: z.number(),
    lng: z.number(),
    radius: z.number().positive(),
    address: z.string().default(""),
    allowRemoteCheckIn: z.boolean().default(false),
  }),
  // Working hours
  workingHours: z.object({
    start: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM"),
    end: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM"),
    lateThresholdMinutes: z.number().int().nonnegative(),
  }),
  workingDays: z.array(z.enum(DAYS)).min(1),
  // Attendance rules
  attendanceRules: z.object({
    lateMarkAfter: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM"),
    halfDayAfter: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM"),
    absentAfter: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM"),
    weekends: z.array(z.string()).default(["Saturday", "Sunday"]),
  }).default({ lateMarkAfter: "09:15", halfDayAfter: "10:00", absentAfter: "13:00", weekends: ["Saturday", "Sunday"] }),
  shifts: z.array(shiftSchema).default([]),
  // Leave policy
  leavePolicy: z.object({
    CL: z.object({
      annualEntitlement: z.number().int().nonnegative(),
      maxConsecutiveDays: z.number().int().nonnegative(),
      carryForward: z.boolean(),
      minNoticeDays: z.number().int().nonnegative(),
    }),
    SL: z.object({
      annualEntitlement: z.number().int().nonnegative(),
      maxConsecutiveDays: z.number().int().nonnegative(),
      carryForward: z.boolean(),
      minNoticeDays: z.number().int().nonnegative(),
      requiresMedicalCertificate: z.boolean(),
    }),
    EL: z.object({
      annualEntitlement: z.number().int().nonnegative(),
      maxConsecutiveDays: z.number().int().nonnegative(),
      carryForward: z.boolean(),
      minNoticeDays: z.number().int().nonnegative(),
    }).default({ annualEntitlement: 1, maxConsecutiveDays: 15, carryForward: true, minNoticeDays: 7 }),
  }),
  // Payroll
  payroll: z.object({
    paymentCycle: z.string().default("Monthly"),
    paymentDate: z.number().int().min(1).max(31).default(1),
    taxPercentage: z.number().nonnegative().default(10),
    overtimeRate: z.number().nonnegative().default(1.5),
  }).default({ paymentCycle: "Monthly", paymentDate: 1, taxPercentage: 10, overtimeRate: 1.5 }),
  // Holidays
  holidays: z.array(holidaySchema).default([]),
  // Security
  security: z.object({
    passwordMinLength: z.number().int().min(4).default(8),
    passwordExpiry: z.number().int().nonnegative().default(90),
    requireUppercase: z.boolean().default(false),
    requireNumbers: z.boolean().default(false),
    requireSpecialChars: z.boolean().default(false),
    twoFactorAuth: z.boolean().default(false),
    accountLockout: z.boolean().default(false),
    maxFailedAttempts: z.number().int().min(1).default(5),
    lockoutDuration: z.number().int().min(1).default(30),
    sessionTimeout: z.number().int().min(1).default(60),
  }).default({ passwordMinLength: 8, passwordExpiry: 90, requireUppercase: false, requireNumbers: false, requireSpecialChars: false, twoFactorAuth: false, accountLockout: false, maxFailedAttempts: 5, lockoutDuration: 30, sessionTimeout: 60 }),
});