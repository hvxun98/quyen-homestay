import { Schema, model, models } from 'mongoose';

export interface IHouse {
  _id: any;
  code: string; // Ví dụ: H_690LLQ (cột "Mã")
  address: string; // Địa chỉ
  numOfFloors: number; // Số tầng
  numOfRooms: number; // Số phòng
  price: number; // Giá thuê (VND)
  createdAt?: Date;
  updatedAt?: Date;
}

const HouseSchema = new Schema<IHouse>(
  {
    code: { type: String, required: true, unique: true, trim: true, index: true },
    address: { type: String, required: true },
    numOfFloors: { type: Number, required: true, min: 0 },
    numOfRooms: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

export default models.House || model<IHouse>('House', HouseSchema);
