import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const uploadSchema = new Schema(
  {
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  {
    timestamps: true,
  },
);

export type UploadDocument = InferSchemaType<typeof uploadSchema> & { _id: string };

const Upload = (models.Upload as Model<UploadDocument>) || model<UploadDocument>("Upload", uploadSchema);

export default Upload;
