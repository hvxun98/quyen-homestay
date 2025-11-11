import mongoose, { Schema, Types } from 'mongoose';

export type FinanceCategoryType = 'income' | 'expense';

export interface IFinanceCategory {
  _id: Types.ObjectId;
  type: FinanceCategoryType; // income | expense
  code: string; // ví dụ 'operating', 'electricity'
  name: string; // 'Chi phí vận hành', 'Điện'...
  description?: string;
  isActive: boolean;
  houseId?: Types.ObjectId | null; // null = global
  createdAt: Date;
  updatedAt: Date;
}

const FinanceCategorySchema = new Schema<IFinanceCategory>(
  {
    type: { type: String, enum: ['income', 'expense'], required: true },
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: String,
    isActive: { type: Boolean, default: true },
    houseId: { type: Schema.Types.ObjectId, ref: 'House', default: null }
  },
  { timestamps: true }
);

// Tránh trùng code trong cùng type + houseId (global/null cho phép trùng giữa các nhà).
FinanceCategorySchema.index({ type: 1, code: 1, houseId: 1 }, { unique: true, sparse: true });

export default (mongoose.models.FinanceCategory as mongoose.Model<IFinanceCategory>) ||
  mongoose.model<IFinanceCategory>('FinanceCategory', FinanceCategorySchema);
