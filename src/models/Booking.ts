// src/models/Booking.ts
import { Schema, model, models, Model, Types } from 'mongoose';

export type BookingStatus = 'pending' | 'success' | 'cancelled';
export type PaymentStatus = 'full' | 'deposit' | 'unpaid';
export type SOURCE = 'facebookAds' | 'zalo' | 'dayLaDau' | 'airbnb' | 'booking' | 'senstay' | 'congTacVien';

export interface IBooking {
  orderCode: string;
  orderCodeNorm?: string;
  houseId: Types.ObjectId;
  roomId: Types.ObjectId;
  customerName: string;
  customerPhone?: string;
  checkIn: Date;
  checkOut: Date;
  price: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  source?: SOURCE;
  note?: string;
  createdBy?: Types.ObjectId;
  updatedAt?: Date;
}

export interface BookingModel extends Model<IBooking> {}

const BookingSchema = new Schema<IBooking, BookingModel>(
  {
    orderCode: { type: String, required: true, unique: true, index: true, trim: true },
    orderCodeNorm: { type: String, index: true },
    houseId: { type: Schema.Types.ObjectId, ref: 'House', required: true, index: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },

    customerName: { type: String, required: true, trim: true, index: true },
    customerPhone: { type: String, trim: true },

    checkIn: { type: Date, required: true, index: true },
    checkOut: { type: Date, required: true, index: true },

    price: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ['pending', 'success', 'cancelled'],
      default: 'pending',
      index: true
    },

    paymentStatus: {
      type: String,
      enum: ['full', 'deposit', 'unpaid'],
      default: 'unpaid'
    },

    source: { type: String, trim: true },
    note: { type: String, trim: true },

    // ✅ liên kết tới bảng User
    createdBy: {
      type: String,
      required: true,
      trim: true,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtuals cho FE
BookingSchema.virtual('code').get(function (this: IBooking) {
  return this.orderCode;
});
BookingSchema.virtual('name').get(function (this: IBooking) {
  return this.customerName;
});

// Hooks
BookingSchema.pre('validate', function (next) {
  if (this.checkIn && this.checkOut && this.checkOut <= this.checkIn) {
    return next(new Error('checkOut must be after checkIn'));
  }
  next();
});

BookingSchema.pre('save', function (next) {
  if (this.isModified('orderCode')) {
    const digits = (this.orderCode || '').replace(/\D/g, '');
    this.orderCodeNorm = digits.padStart(8, '0');
  }
  next();
});

BookingSchema.index({ houseId: 1, createdAt: -1 });
BookingSchema.index({ roomId: 1, checkIn: 1, checkOut: 1 });
BookingSchema.index({ customerName: 'text' });

const Booking = (models.Booking as BookingModel) || model<IBooking, BookingModel>('Booking', BookingSchema);
export default Booking;
