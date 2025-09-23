import { Schema, model, models } from 'mongoose';

export interface ICustomer {
  _id: any;
  name: string;
  phone?: string;
  email?: string;
  idCard?: string; // CCCD/Passport
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, index: true },
    phone: { type: String, index: true },
    email: { type: String, lowercase: true, index: true },
    idCard: { type: String, index: true },
    note: { type: String }
  },
  { timestamps: true }
);

export default models.Customer || model<ICustomer>('Customer', CustomerSchema);
