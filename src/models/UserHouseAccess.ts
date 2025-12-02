import { Schema, model, models, Model, Types } from 'mongoose';

export interface IUserHouseAccess {
  _id: any;
  userId: Types.ObjectId;
  houseId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserHouseAccessSchema = new Schema<IUserHouseAccess>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    houseId: { type: Schema.Types.ObjectId, ref: 'House', required: true, index: true }
  },
  { timestamps: true }
);

UserHouseAccessSchema.index({ userId: 1, houseId: 1 }, { unique: true });

const UserHouseAccess =
  (models.UserHouseAccess as Model<IUserHouseAccess>) || model<IUserHouseAccess>('UserHouseAccess', UserHouseAccessSchema);

export default UserHouseAccess;
