import { Schema, model, models, Types } from 'mongoose';

export type RoomStatus = 'available' | 'booked' | 'occupied';

interface IRoom {
  _id: Types.ObjectId;
  houseId: Types.ObjectId;
  code: string;
  codeNorm: string;
  name: string;
  type: 'Standard' | 'VIP';
  status: RoomStatus;
  isDirty: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    houseId: { type: Schema.Types.ObjectId, ref: 'House', required: true, index: true },
    code: { type: String, required: true, trim: true },
    codeNorm: { type: String, required: true, trim: true, uppercase: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Standard', 'VIP'], required: true },

    // ✅ status: string (3 trạng thái)
    status: {
      type: String,
      enum: ['available', 'booked', 'occupied'],
      required: true,
      default: 'available'
    },

    // ✅ thêm cờ isDirty
    isDirty: { type: Boolean, default: false }
  },
  { timestamps: true, strict: true }
);

// Unique trong phạm vi 1 nhà
RoomSchema.index({ houseId: 1, codeNorm: 1 }, { unique: true });

// Đồng bộ codeNorm khi cập nhật code
RoomSchema.pre('validate', function (next) {
  if ((this as any).code) {
    (this as any).codeNorm = (this as any).code.trim().replace(/\s+/g, '_').toUpperCase();
  }
  next();
});

export default models.Room || model<IRoom>('Room', RoomSchema);
