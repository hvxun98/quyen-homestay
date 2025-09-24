/// <reference types="node" />
import 'dotenv/config';
import { dbConnect } from '../src/lib/mongodb';
import mongoose from 'mongoose';
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
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to wipe in production. Set NODE_ENV to development.');
    process.exit(1);
  }

  await dbConnect();

  // chỉ xoá Counter
  await wipeOne('counters', () => Counter.deleteMany({}));

  // hoặc drop hẳn collection (comment/uncomment):
  await Counter.collection.drop().catch(() => {});

  await mongoose.connection.close();
  console.log('Done.');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
