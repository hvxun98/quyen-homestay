import { NextRequest, NextResponse } from 'next/server';
import Room from 'models/Room';
import House from 'models/House';
import { Types } from 'mongoose';
import { dbConnect } from 'lib/mongodb';

// Hỗ trợ parse nhiều giá trị "a,b,c"
function parseCSV(q?: string | null) {
  if (!q) return [];
  return q
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const statusParam = parseCSV(searchParams.get('status')); // available,booked,occupied,dirty
    const houseIdsParam = parseCSV(searchParams.get('houseIds')); // 65f...,66a...

    const filter: any = {};
    if (statusParam.length) filter.status = { $in: statusParam };
    if (houseIdsParam.length) {
      filter.houseId = { $in: houseIdsParam.map((id) => new Types.ObjectId(id)) };
    }

    // Lấy toàn bộ phòng theo filter
    const rooms = await Room.find(filter).select('_id houseId code codeNorm name type status').lean();

    // Map houseIds
    const houseIds = Array.from(new Set(rooms.map((r) => String(r.houseId))));
    const houses = await House.find({ _id: { $in: houseIds } })
      .select('_id name code address')
      .lean();

    const houseDict = new Map(houses.map((h) => [String(h._id), h]));

    // Group theo house + thống kê theo status
    type Bucket = {
      houseId: string;
      houseName: string;
      houseCode?: string;
      address?: string;
      count: number;
      countsByStatus: Record<'available' | 'booked' | 'occupied' | 'dirty', number>;
      rooms: Array<{
        _id: any;
        code: string;
        name: string;
        type: 'Standard' | 'VIP';
        status: 'available' | 'booked' | 'occupied' | 'dirty';
      }>;
    };

    const buckets = new Map<string, Bucket>();

    const inc = (obj: any, key: string) => (obj[key] = (obj[key] || 0) + 1);

    const summary = { total: 0, available: 0, booked: 0, occupied: 0, dirty: 0 };

    for (const r of rooms) {
      const hid = String(r.houseId);
      if (!buckets.has(hid)) {
        const h = houseDict.get(hid);
        buckets.set(hid, {
          houseId: hid,
          houseName: h?.name || 'Unknown',
          houseCode: (h as any)?.code,
          address: (h as any)?.address,
          count: 0,
          countsByStatus: { available: 0, booked: 0, occupied: 0, dirty: 0 },
          rooms: []
        });
      }
      const b = buckets.get(hid)!;
      b.rooms.push({
        _id: r._id,
        code: r.code,
        name: r.name,
        type: r.type,
        status: r.status
      });
      b.count += 1;
      inc(b.countsByStatus, r.status);

      summary.total += 1;
      inc(summary, r.status);
    }

    // Sắp xếp house theo tên, room theo codeNorm (nếu có) rồi tới code
    const housesArr = Array.from(buckets.values())
      .sort((a, b) => a.houseName.localeCompare(b.houseName))
      .map((h) => ({
        ...h,
        rooms: h.rooms.sort((r1, r2) => {
          // Ưu tiên sắp theo phần số trong code nếu tách được
          const n1 = parseInt((r1.code || '').match(/\d+/)?.[0] || '0', 10);
          const n2 = parseInt((r2.code || '').match(/\d+/)?.[0] || '0', 10);
          if (!Number.isNaN(n1) && !Number.isNaN(n2) && n1 !== n2) return n1 - n2;
          return (r1.code || '').localeCompare(r2.code || '');
        })
      }));

    return NextResponse.json({ summary, houses: housesArr }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Internal error' }, { status: 500 });
  }
}
