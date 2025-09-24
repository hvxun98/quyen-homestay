/// <reference types="node" />
import 'dotenv/config';
import { dbConnect } from '../src/lib/mongodb';
import mongoose from 'mongoose';

// import model để lấy đúng collection name
import Room from '../src/models/Room';
import Booking from '../src/models/Booking';
import Counter from '../src/models/Counter';

async function wipeOne(name: string, fn: () => Promise<any>) {
  try {
    const res = await fn();
    console.log(`✓ Wiped ${name}`, res?.deletedCount != null ? `(${res.deletedCount})` : '');
  } catch (e) {
    console.error(`✗ Failed wiping ${name}:`, (e as any)?.message || e);
  }
}

async function main() {
  // CHẮC CHẮN bạn đang ở môi trường đúng
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to wipe in production. Set NODE_ENV to development.');
    process.exit(1);
  }

  await dbConnect();

  // Xoá theo nhu cầu của bạn:
  await wipeOne('bookings', () => Booking.deleteMany({})); // đơn đặt
  await wipeOne('rooms', () => Room.deleteMany({})); // phòng
  await wipeOne('counters', () => Counter.deleteMany({})); // counter (order, room:<houseId>)
  // Nếu muốn xoá cả houses thì mở dòng dưới, nhưng thường giữ lại houses
  // await wipeOne('houses',    () => House.deleteMany({}));

  // Hoặc xoá hẳn collection (drop) — comment/uncomment nếu cần:
  // await Booking.collection.drop().catch(() => {});
  // await Room.collection.drop().catch(() => {});
  // await Counter.collection.drop().catch(() => {});
  // await House.collection.drop().catch(() => {});

  await mongoose.connection.close();
  console.log('Done.');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
