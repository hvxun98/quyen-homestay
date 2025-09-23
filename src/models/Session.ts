import { Schema, model, models, Types } from 'mongoose';
const SessionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', index: true, required: true },
    refreshTokenHash: { type: String, required: true },
    userAgent: String,
    ip: String,
    expiresAt: { type: Date, index: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
export default models.Session || model('Session', SessionSchema);
