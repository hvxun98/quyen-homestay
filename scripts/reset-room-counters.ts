/// <reference types="node" />
//npx ts-node -P tsconfig.scripts.json -r tsconfig-paths/register -r dotenv/config scripts/reset-room-counters.ts

import 'dotenv/config';
import { dbConnect } from '../src/lib/mongodb';
import Counter from '../src/models/Counter';

async function main() {
  await dbConnect();

  // Xoá hết counters để sinh từ 001
  const res = await Counter.deleteMany({});
  console.log(`Counters deleted: ${res.deletedCount}`);

  process.exit(0);
}

main().catch((err) => {
  console.error('reset-room-counters error:', err);
  process.exit(1);
});
