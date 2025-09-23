import { Schema, model, models, Types } from 'mongoose';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'checkedin' | 'checkedout';

export interface IBooking {
  _id: any;
  code: string; // "OD_8082"
  customerId: Types.ObjectId;
  houseId: Types.ObjectId;
  roomId: Types.ObjectId;
  checkIn: Date; // ISO
  checkOut: Date; // phải > checkIn
  status: BookingStatus;
  totalPrice?: number;
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    code: { type: String, required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    houseId: { type: Schema.Types.ObjectId, ref: 'House', required: true, index: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    checkIn: { type: Date, required: true, index: true },
    checkOut: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'checkedin', 'checkedout'],
      default: 'pending',
      index: true
    },
    totalPrice: { type: Number },
    note: { type: String }
  },
  { timestamps: true }
);

// Chỉ số thời gian để query lịch nhanh theo house/room/phạm vi ngày
BookingSchema.index({ houseId: 1, roomId: 1, checkIn: 1, checkOut: 1 });

// (tuỳ chọn) Ngăn chồng lịch ở mức DB bằng partial index cho trạng thái active
// Lưu ý: MongoDB không hỗ trợ constraint overlap trực tiếp.
// Bạn nên kiểm tra overlap ở service trước khi insert/update:
//   (newIn < existingOut) && (newOut > existingIn)  && status in ['pending','confirmed','checkedin']

export default models.Booking || model<IBooking>('Booking', BookingSchema);
