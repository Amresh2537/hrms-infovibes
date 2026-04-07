import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const attendanceSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: Date, required: true },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Half Day", "Outside Location", "WorkFromHome"],
      default: "Present",
    },
    distanceFromOffice: { type: Number, default: 0 },
    selfieUrl: { type: String },
    checkOutSelfieUrl: { type: String },
    isWFH: { type: Boolean, default: false },
    lastActiveAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export type AttendanceDocument = InferSchemaType<typeof attendanceSchema> & { _id: string };

const Attendance =
  (models.Attendance as Model<AttendanceDocument>) ||
  model<AttendanceDocument>("Attendance", attendanceSchema);

export default Attendance;