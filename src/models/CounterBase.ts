import { Schema, model, models, Model } from 'mongoose';

export interface ICounter {
  key: string; // ví dụ: "booking", "invoice", "house:<id>:order"
  seq: number;
}

const CounterSchema = new Schema<ICounter>(
  {
    key: { type: String, required: true, unique: true, index: true },
    seq: { type: Number, required: true, default: 0 }
  },
  { timestamps: true }
);

const Counter: Model<ICounter> = (models.Counter as Model<ICounter>) || model<ICounter>('Counter', CounterSchema);

export default Counter;
