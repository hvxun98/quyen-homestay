// models/Counter.ts
import { Schema, model, models, Model, Types } from 'mongoose';

export interface ICounter {
  _id: Types.ObjectId;
  houseId: Types.ObjectId;
  seq: number;
}

const CounterRoomSchema = new Schema<ICounter>({
  houseId: { type: Schema.Types.ObjectId, ref: 'House', required: true, unique: true, index: true },
  seq: { type: Number, required: true, default: 0 }
});

export const Counter: Model<ICounter> = (models.Counter as Model<ICounter>) || model<ICounter>('CounterRoom', CounterRoomSchema);

export default Counter;
