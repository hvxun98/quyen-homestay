import mongoose, { Schema, Types } from 'mongoose';

export interface IFileAsset {
  _id: Types.ObjectId;
  provider: 'cloudinary' | 's3' | 'local';
  url: string;
  mimeType?: string;
  bytes?: number;
  width?: number;
  height?: number;
  originalName?: string;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FileAssetSchema = new Schema<IFileAsset>(
  {
    provider: { type: String, enum: ['cloudinary', 's3', 'local'], required: true },
    url: { type: String, required: true },
    mimeType: String,
    bytes: Number,
    width: Number,
    height: Number,
    originalName: String,
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default (mongoose.models.FileAsset as mongoose.Model<IFileAsset>) || mongoose.model<IFileAsset>('FileAsset', FileAssetSchema);
