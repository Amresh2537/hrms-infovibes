import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const leaveSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    type: { type: String, enum: ["CL", "SL", "Other"], required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  },
);

export type LeaveDocument = InferSchemaType<typeof leaveSchema> & { _id: string };

const Leave = (models.Leave as Model<LeaveDocument>) || model<LeaveDocument>("Leave", leaveSchema);

export default Leave;