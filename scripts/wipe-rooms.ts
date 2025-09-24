/// <reference types="node" />
//npx ts-node -P tsconfig.scripts.json -r tsconfig-paths/register -r dotenv/config scripts/wipe-rooms.ts

import 'dotenv/config';
import { dbConnect } from '../src/lib/mongodb';
import Room from '../src/models/Room';

async function main() {
  await dbConnect();

  // Đếm trước cho biết
  const before = await Room.countDocuments({});
  const res = await Room.deleteMany({});

  const after = await Room.countDocuments({});
  console.log(`Rooms before: ${before}`);
  console.log(`Deleted: ${res.deletedCount}`);
  console.log(`Rooms after: ${after}`);

  process.exit(0);
}

main().catch((err) => {
  console.error('wipe-rooms error:', err);
  process.exit(1);
});
