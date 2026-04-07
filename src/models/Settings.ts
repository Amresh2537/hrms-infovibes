import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const shiftSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    lateThresholdMinutes: { type: Number, default: 15 },
  },
  { _id: true },
);

const holidaySchema = new Schema(
  {
    date: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
  },
  { _id: true },
);

const branchSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, default: "", trim: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    radius: { type: Number, default: 500 },
  },
  { _id: true },
);

const settingsSchema = new Schema(
  {
    // Company
    companyName: { type: String, default: "My Company", trim: true },
    companyEmail: { type: String, default: "", trim: true },
    companyPhone: { type: String, default: "", trim: true },
    companyAddress: { type: String, default: "", trim: true },
    companyWebsite: { type: String, default: "", trim: true },

    // System
    timezone: { type: String, default: "Asia/Kolkata" },
    dateFormat: { type: String, default: "DD/MM/YYYY" },
    timeFormat: { type: String, default: "12" },
    language: { type: String, default: "English" },
    fiscalYearStart: { type: String, default: "April" },

    // Notifications
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
    },

    // Office location
    officeLocation: {
      lat: { type: Number, default: 28.6139 },
      lng: { type: Number, default: 77.209 },
      radius: { type: Number, default: 500 },
      address: { type: String, default: "", trim: true },
      allowRemoteCheckIn: { type: Boolean, default: false },
    },
    branches: { type: [branchSchema], default: [] },

    // Working hours
    workingHours: {
      start: { type: String, default: "09:00" },
      end: { type: String, default: "18:00" },
      lateThresholdMinutes: { type: Number, default: 15 },
    },

    workingDays: {
      type: [String],
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    },

    // Attendance rules
    attendanceRules: {
      lateMarkAfter: { type: String, default: "09:15" },
      halfDayAfter: { type: String, default: "10:00" },
      absentAfter: { type: String, default: "13:00" },
      weekends: { type: [String], default: ["Saturday", "Sunday"] },
    },

    shifts: { type: [shiftSchema], default: [] },

    // Leave policy
    leavePolicy: {
      CL: {
        annualEntitlement: { type: Number, default: 10 },
        maxConsecutiveDays: { type: Number, default: 3 },
        carryForward: { type: Boolean, default: false },
        minNoticeDays: { type: Number, default: 1 },
      },
      SL: {
        annualEntitlement: { type: Number, default: 23 },
        maxConsecutiveDays: { type: Number, default: 7 },
        carryForward: { type: Boolean, default: false },
        minNoticeDays: { type: Number, default: 0 },
        requiresMedicalCertificate: { type: Boolean, default: false },
      },
      EL: {
        annualEntitlement: { type: Number, default: 1 },
        maxConsecutiveDays: { type: Number, default: 15 },
        carryForward: { type: Boolean, default: true },
        minNoticeDays: { type: Number, default: 7 },
      },
    },

    // Payroll
    payroll: {
      paymentCycle: { type: String, default: "Monthly" },
      paymentDate: { type: Number, default: 1 },
      taxPercentage: { type: Number, default: 10 },
      overtimeRate: { type: Number, default: 1.5 },
    },

    // Holidays
    holidays: { type: [holidaySchema], default: [] },

    // Security
    security: {
      passwordMinLength: { type: Number, default: 8 },
      passwordExpiry: { type: Number, default: 90 },
      requireUppercase: { type: Boolean, default: false },
      requireNumbers: { type: Boolean, default: false },
      requireSpecialChars: { type: Boolean, default: false },
      twoFactorAuth: { type: Boolean, default: false },
      accountLockout: { type: Boolean, default: false },
      maxFailedAttempts: { type: Number, default: 5 },
      lockoutDuration: { type: Number, default: 30 },
      sessionTimeout: { type: Number, default: 60 },
    },

    singleton: { type: String, default: "global", immutable: true },
  },
  { timestamps: true },
);

settingsSchema.index({ singleton: 1 }, { unique: true });

export type SettingsDocument = InferSchemaType<typeof settingsSchema> & { _id: string };

const Settings =
  (models.Settings as Model<SettingsDocument>) ||
  model<SettingsDocument>("Settings", settingsSchema);

export default Settings;