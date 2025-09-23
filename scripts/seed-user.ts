// Run this script with: npx ts-node -P tsconfig.scripts.json -r tsconfig-paths/register -r dotenv/config .\scripts\seed-user.ts
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../src/models/User';
import { dbConnect } from '../src/lib/mongodb';

async function main() {
  await dbConnect();

  const email = 'admin@gmail.com';
  const plainPassword = '123456aA@';
  const passwordHash = await bcrypt.hash(plainPassword, 12);

  const user = await User.findOneAndUpdate(
    { email },
    { email, passwordHash, name: 'Test User', role: 'user' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('✅ Seeded user:', { id: user._id, email, password: plainPassword });
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Error seeding user:', err);
  process.exit(1);
});
