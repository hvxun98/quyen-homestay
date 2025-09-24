/// <reference types="node" />
import 'dotenv/config';
import mongoose from 'mongoose';
import Room from '../src/models/Room'; // ⚠️ chỉnh path cho đúng

async function main() {
  const uri = process.env.MONGODB_URI || '';
  if (!uri) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }
  await mongoose.connect(uri);

  const indexes = await Room.collection.indexes();
  console.log('Indexes on rooms:', indexes);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
