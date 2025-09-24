import { Types } from 'mongoose';
import Counter, { ICounter } from 'models/Counter';
import House from 'models/House';

function shortFromAddress(address?: string): string {
  if (!address) return 'HOUSE';
  const letters = address
    .normalize('NFKD')
    .replace(/[^A-Za-z0-9 ]/g, ' ')
    .split(/\s+/);
  const picked = letters
    .slice(0, 3)
    .map((w) => (w ? w[0] : ''))
    .join('')
    .toUpperCase();
  const digits = (address.match(/\d+/g) || []).pop() || '';
  const res = (picked + digits).slice(0, 6);
  return res || 'HOUSE';
}

export async function nextRoomCode(houseId: Types.ObjectId) {
  // ✅ Gõ kiểu rõ ràng cho lean()
  const counter = await Counter.findOneAndUpdate({ houseId }, { $inc: { seq: 1 } }, { new: true, upsert: true })
    .select('seq')
    .lean<ICounter | null>();

  const seq = counter?.seq ?? 1;

  const house = await House.findById(houseId).select('code address').lean<{ code?: string; address?: string } | null>();
  const houseCode = house?.code?.toUpperCase() || shortFromAddress(house?.address);

  const seqStr = String(seq).padStart(3, '0');
  return `R_${seqStr}_${houseCode}`;
}
