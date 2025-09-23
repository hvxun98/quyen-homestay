import { Schema, model, models } from 'mongoose';

export type UserRole = 'admin' | 'staff';

export interface IUser {
  _id: any;
  email: string;
  passwordHash: string;
  name?: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String },
    role: { type: String, enum: ['admin', 'staff'], default: 'staff' }
  },
  { timestamps: true }
);

export default models.User || model<IUser>('User', UserSchema);
