// src/models/Booking.ts
import { Schema, model, models, Model, Types } from 'mongoose';

export type BookingStatus = 'pending' | 'success' | 'cancelled';

export interface IBooking {
  orderCode: string; // ví dụ: "OD_8073"
  orderCodeNorm?: string; // chuẩn hoá để sort/search (vd: "00008073")
  houseId: Types.ObjectId; // ref: House
  roomId: Types.ObjectId; // ref: Room
  customerName: string;
  customerPhone?: string;
  checkIn: Date;
  checkOut: Date;
  price: number; // VND
  status: BookingStatus; // 'pending' | 'success' | 'cancelled'
  note?: string;
  source: { type: String; trim: true }; // vd: "Facebook ads"
  paymentStatus: { type: String; enum: ['full', 'deposit', 'unpaid']; default: 'unpaid' };
  createdAt?: Date;
  updatedAt?: Date;
}

// Nếu cần static methods:
export interface BookingModel extends Model<IBooking> {}

const BookingSchema = new Schema<IBooking, BookingModel>(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    orderCodeNorm: {
      type: String,
      index: true
    },

    houseId: {
      type: Schema.Types.ObjectId,
      ref: 'House',
      required: true,
      index: true
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    customerPhone: {
      type: String,
      trim: true
    },

    checkIn: {
      type: Date,
      required: true,
      index: true
    },
    checkOut: {
      type: Date,
      required: true,
      index: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: ['pending', 'success', 'cancelled'],
      default: 'pending',
      index: true
    },

    note: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    // Cho phép FE nhận virtuals (code, name, …)
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/** --------- Virtuals cho FE (UI-friendly) ---------- */
// Alias "code" ↔ orderCode
BookingSchema.virtual('code').get(function (this: IBooking) {
  return this.orderCode;
});
// Alias "name" ↔ customerName
BookingSchema.virtual('name').get(function (this: IBooking) {
  return this.customerName;
});

/** --------- Hooks / Validators ---------- */
// Check logic ngày
BookingSchema.pre('validate', function (next) {
  if (this.checkIn && this.checkOut && this.checkOut <= this.checkIn) {
    return next(new Error('checkOut must be after checkIn'));
  }
  next();
});

// Chuẩn hoá orderCodeNorm để sort/search ( giữ số và pad 8 )
BookingSchema.pre('save', function (next) {
  if (this.isModified('orderCode')) {
    const digits = (this.orderCode || '').replace(/\D/g, '');
    this.orderCodeNorm = digits.padStart(8, '0');
  }
  next();
});

/** --------- Indexes bổ sung ---------- */
BookingSchema.index({ houseId: 1, createdAt: -1 });
BookingSchema.index({ roomId: 1, checkIn: 1, checkOut: 1 });
BookingSchema.index({ customerName: 'text' }); // nếu muốn search tên nhanh

const Booking = (models.Booking as BookingModel) || model<IBooking, BookingModel>('Booking', BookingSchema);

export default Booking;
