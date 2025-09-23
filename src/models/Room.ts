import { Schema, model, models, Types } from 'mongoose';

export type RoomStatus = 'available' | 'booked' | 'occupied' | 'maintenance';

export interface IRoom {
  _id: any;
  houseId: Types.ObjectId;
  name: string; // "Phòng 201"
  floor?: number;
  type?: string; // "Standard" | "Vip"
  status: RoomStatus; // hiển thị nhanh trên sơ đồ
  pricePerNight?: number;
  capacity?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    houseId: { type: Schema.Types.ObjectId, ref: 'House', required: true, index: true },
    name: { type: String, required: true },
    floor: { type: Number },
    type: { type: String },
    status: { type: String, enum: ['available', 'booked', 'occupied', 'maintenance'], default: 'available', index: true },
    pricePerNight: { type: Number },
    capacity: { type: Number }
  },
  { timestamps: true }
);

// 1 nhà không nên có 2 phòng trùng tên
RoomSchema.index({ houseId: 1, name: 1 }, { unique: true });

export default models.Room || model<IRoom>('Room', RoomSchema);
