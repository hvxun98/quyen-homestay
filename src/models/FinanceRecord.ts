import mongoose, { Schema, Types } from 'mongoose';

export type FinanceType = 'income' | 'expense';

export interface IFinanceRecord {
  _id: Types.ObjectId;
  code: string; // I_2042 / C_1283
  type: FinanceType;
  houseId: Types.ObjectId; // ref House
  recordDate: Date; // ngày hạch toán
  year: number;
  month: number;
  amount: number; // VND (số nguyên, đơn vị: đồng)
  currency: 'VND';
  categoryId?: Types.ObjectId | null; // ref FinanceCategory (expense: bắt buộc)
  note?: string;
  attachments: Types.ObjectId[]; // ref FileAsset
  source?: 'manual' | 'booking';
  sourceRefId?: Types.ObjectId | null;
  createdBy: String; // ref User
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

const FinanceRecordSchema = new Schema<IFinanceRecord>(
  {
    code: { type: String, required: true, unique: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    houseId: { type: Schema.Types.ObjectId, ref: 'House', required: true },
    recordDate: { type: Date, default: Date.now },
    year: { type: Number, required: true, min: 2000, max: 2100 },
    month: { type: Number, required: true, min: 1, max: 12 },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, enum: ['VND'], default: 'VND' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'FinanceCategory', default: null },
    note: String,
    attachments: [{ type: Schema.Types.ObjectId, ref: 'FileAsset' }],
    source: { type: String, enum: ['manual', 'booking'], default: 'manual' },
    sourceRefId: { type: Schema.Types.ObjectId, default: null },
    createdBy: { type: String, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

// Index tối ưu list/filter
FinanceRecordSchema.index({ houseId: 1, year: 1, month: 1, type: 1, deletedAt: 1 });
FinanceRecordSchema.index({ createdAt: -1 });

export default (mongoose.models.FinanceRecord as mongoose.Model<IFinanceRecord>) ||
  mongoose.model<IFinanceRecord>('FinanceRecord', FinanceRecordSchema);
