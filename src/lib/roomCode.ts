import { Types } from 'mongoose';
import House from 'models/House';
import { nextSeq } from './counter';

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
  const n = await nextSeq('room');

  const house = await House.findById(houseId).select('code address').lean<{ code?: string; address?: string } | null>();
  const houseCode = house?.code?.toUpperCase() || shortFromAddress(house?.address);

  const seqStr = String(n).padStart(3, '0');
  return `R_${seqStr}_${houseCode}`;
}
