import { Schema, model, models, Types } from 'mongoose';

export type TxStatus = 'paid' | 'refund';
export type TxMethod = 'cash' | 'bank' | 'creditcard' | 'momo' | 'zalopay';

export interface ITransaction {
  _id: any;
  bookingId: Types.ObjectId;
  amount: number; // +: thu, -: hoàn
  method: TxMethod;
  status: TxStatus;
  note?: string;
  createdAt?: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['cash', 'bank', 'creditcard', 'momo', 'zalopay'], required: true },
    status: { type: String, enum: ['paid', 'refund'], default: 'paid', index: true },
    note: { type: String }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

TransactionSchema.index({ bookingId: 1, createdAt: -1 });

export default models.Transaction || model<ITransaction>('Transaction', TransactionSchema);
