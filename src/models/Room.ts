import { Schema, model, models, Types } from 'mongoose';

export type RoomStatus = 'available' | 'booked' | 'occupied' | 'maintenance';

interface IRoom {
  _id: Types.ObjectId;
  houseId: Types.ObjectId;
  code: string;
  codeNorm: string;
  name: string;
  type: 'Standard' | 'VIP';
  status?: RoomStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    houseId: { type: Schema.Types.ObjectId, ref: 'House', required: true, index: true },
    code: { type: String, required: true, trim: true },
    codeNorm: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Standard', 'VIP'], required: true },
    status: { type: String, enum: ['available', 'booked', 'occupied', 'maintenance'], default: 'available' }
  },
  { timestamps: true }
);

// Unique trong phạm vi 1 nhà
RoomSchema.index({ houseId: 1, codeNorm: 1 }, { unique: true });

// Phòng khi update code thủ công (nếu có), vẫn đồng bộ codeNorm
RoomSchema.pre('validate', function (next) {
  if (this.code) this.codeNorm = this.code.trim().toUpperCase();
  next();
});

export default models.Room || model<IRoom>('Room', RoomSchema);
