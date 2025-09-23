import { Schema, model, models } from 'mongoose';

export interface IHouse {
  _id: any;
  name: string;
  address?: string;
  floors?: number;
  totalRooms?: number;
  basePrice?: number; // giá thuê toàn nhà (nếu áp dụng)
  createdAt?: Date;
  updatedAt?: Date;
}

const HouseSchema = new Schema<IHouse>(
  {
    name: { type: String, required: true, index: true },
    address: { type: String },
    floors: { type: Number },
    totalRooms: { type: Number },
    basePrice: { type: Number }
  },
  { timestamps: true }
);

export default models.House || model<IHouse>('House', HouseSchema);
