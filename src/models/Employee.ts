import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const employeeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    empCode: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    officialEmail: { type: String, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    altPhone: { type: String, trim: true },
    department: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    gender: { type: String, enum: ["Male", "Female", "Other", ""], default: "" },
    maritalStatus: { type: String, enum: ["Single", "Married", "Divorced", "Widowed", ""], default: "" },
    numChildren: { type: Number, default: 0 },
    dob: { type: Date },
    joinDate: { type: Date, required: true },
    residenceAddress: { type: String, trim: true },
    correspondenceAddress: { type: String, trim: true },
    salary: { type: Number },
    workingStatus: { type: String, trim: true, default: "Full-time" },
    leavesBenefit: { type: String, trim: true, default: "Standard" },
    daysWorking: { type: Number, default: 5 },
    branchId: { type: String, trim: true, default: "" },
    workLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      radius: { type: Number, default: 500 },
    },
    leaveBalance: {
      CL: { type: Number, default: 12 },
      SL: { type: Number, default: 6 },
    },
    bankDetails: {
      bankName: { type: String, trim: true },
      accountHolderName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      ifscCode: { type: String, trim: true, uppercase: true },
      passbookFileUrl: { type: String },
    },
    documents: {
      aadharUrl: { type: String },
      panUrl: { type: String },
      offerLetterUrl: { type: String },
      offerAcceptanceUrl: { type: String },
      joiningLetterUrl: { type: String },
      employeeAgreementUrl: { type: String },
      responsibilitiesLetterUrl: { type: String },
      dresscodeGuidelinesUrl: { type: String },
      resignationFromLastOrgUrl: { type: String },
      resumeUrl: { type: String },
      idUrl: { type: String },
      upiScannerUrl: { type: String },
    },
    remarks: { type: String, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  {
    timestamps: true,
  },
);

export type EmployeeDocument = InferSchemaType<typeof employeeSchema> & { _id: string };

const Employee =
  (models.Employee as Model<EmployeeDocument>) ||
  model<EmployeeDocument>("Employee", employeeSchema);

export default Employee;