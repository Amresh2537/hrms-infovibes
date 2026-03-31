import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["HR", "EMPLOYEE"], required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee" },
  },
  {
    timestamps: true,
  },
);

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: string };

const User = (models.User as Model<UserDocument>) || model<UserDocument>("User", userSchema);

export default User;