// app/api/dashboard/daily/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import Booking from 'models/Booking';
import Room from 'models/Room';

export const dynamic = 'force-dynamic';

type Basis = 'checkIn' | 'createdAt';

const CHANNEL_VALUES = ['facebookAds', 'zalo', 'dayLaDau', 'airbnb', 'booking', 'senstay', 'congTacVien'] as const;
type ChannelVal = (typeof CHANNEL_VALUES)[number];

export const PAYMENT_VALUES = ['full', 'deposit', 'unpaid'] as const;
type PaymentVal = (typeof PAYMENT_VALUES)[number];

function emptyByChannel(): Record<ChannelVal, number> {
  return {
    facebookAds: 0,
    zalo: 0,
    dayLaDau: 0,
    airbnb: 0,
    booking: 0,
    senstay: 0,
    congTacVien: 0
  };
}

function getStartEndUTC(dateStr: string) {
  const start = new Date(`${dateStr}T00:00:00.000Z`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = (searchParams.get('date') || '').trim();
  const basis = ((searchParams.get('basis') as Basis) || 'checkIn') as Basis;
  if (!date) return NextResponse.json({ error: "Missing 'date' (YYYY-MM-DD)" }, { status: 422 });
  return run(date, basis);
}

export async function POST(req: NextRequest) {
  let body: { date?: string; basis?: Basis };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const date = (body?.date || '').trim();
  const basis = (body?.basis || 'checkIn') as Basis;
  if (!date) return NextResponse.json({ error: "Missing 'date' (YYYY-MM-DD)" }, { status: 422 });
  return run(date, basis);
}

async function run(date: string, basis: Basis) {
  await dbConnect();
  const { start, end } = getStartEndUTC(date);

  // -------- Occupancy (overlap trong ngày) --------
  const occupiedRoomIds: string[] = await Booking.distinct('roomId', {
    status: { $ne: 'cancelled' },
    checkIn: { $lt: end },
    checkOut: { $gt: start }
  }).then((ids: any[]) => ids.map(String));
  const totalRooms = await Room.countDocuments({});
  const booked = occupiedRoomIds.length;
  const available = Math.max(0, totalRooms - booked);
  const rate = totalRooms ? booked / totalRooms : 0;

  // -------- Revenue theo paymentStatus + channel --------
  const timeField = basis === 'createdAt' ? 'createdAt' : 'checkIn';

  const revenueAgg = await Booking.aggregate([
    {
      $match: {
        status: { $ne: 'cancelled' },
        [timeField]: { $gte: start, $lt: end }
      }
    },
    {
      $addFields: {
        _channelRaw: {
          $toLower: {
            $ifNull: ['$channel', { $ifNull: ['$source', { $ifNull: ['$platform', ''] }] }]
          }
        },
        paymentStatus: { $toLower: { $ifNull: ['$paymentStatus', 'unpaid'] } },
        amountTotal: {
          $toDouble: {
            $ifNull: ['$amount', { $ifNull: ['$totalAmount', { $ifNull: ['$totalPrice', { $ifNull: ['$price', 0] }] }] }]
          }
        },
        amountDeposit: {
          $toDouble: {
            $ifNull: ['$depositAmount', { $ifNull: ['$prepaid', { $ifNull: ['$advance', { $ifNull: ['$downPayment', 0] }] }] }]
          }
        }
      }
    },
    // ghi nhận tiền mặt theo paymentStatus
    {
      $addFields: {
        cashAmount: {
          $switch: {
            branches: [
              { case: { $eq: ['$paymentStatus', 'full'] }, then: '$amountTotal' },
              { case: { $eq: ['$paymentStatus', 'deposit'] }, then: '$amountDeposit' }
            ],
            default: 0
          }
        }
      }
    },
    // chuẩn hoá channel về đúng value FE
    {
      $addFields: {
        channelNorm: {
          $switch: {
            branches: [
              { case: { $regexMatch: { input: '$_channelRaw', regex: /facebook|fb/ } }, then: 'facebookAds' },
              { case: { $regexMatch: { input: '$_channelRaw', regex: /zalo/ } }, then: 'zalo' },
              { case: { $regexMatch: { input: '$_channelRaw', regex: /day.?la.?dau|đây là đâu/i } }, then: 'dayLaDau' },
              { case: { $regexMatch: { input: '$_channelRaw', regex: /airbnb/ } }, then: 'airbnb' },
              { case: { $regexMatch: { input: '$_channelRaw', regex: /booking(\.com)?/ } }, then: 'booking' },
              { case: { $regexMatch: { input: '$_channelRaw', regex: /senstay/ } }, then: 'senstay' },
              { case: { $regexMatch: { input: '$_channelRaw', regex: /ctv|collab|cộng tác viên|cong tac vien/ } }, then: 'congTacVien' }
            ],
            // nếu không khớp, để null -> rơi vào 'unknown' khi group
            default: null
          }
        }
      }
    },
    {
      $group: {
        _id: { channel: '$channelNorm', paymentStatus: '$paymentStatus' },
        cash: { $sum: '$cashAmount' },
        count: { $sum: 1 }
      }
    }
  ]);

  const byChannel = emptyByChannel();
  const byPaymentStatus: Record<PaymentVal, number> = { full: 0, deposit: 0, unpaid: 0 };
  let totalCash = 0;

  for (const r of revenueAgg) {
    const ch = r._id?.channel as ChannelVal | null;
    const ps = (r._id?.paymentStatus || 'unpaid') as PaymentVal;

    // cộng theo paymentStatus
    byPaymentStatus[ps] += r.cash || 0;

    // cộng theo channel nếu là 1 trong 7 key FE
    if (ch && (CHANNEL_VALUES as readonly string[]).includes(ch)) {
      byChannel[ch] += r.cash || 0;
    }
    totalCash += r.cash || 0;
  }

  return NextResponse.json(
    {
      date,
      revenue: {
        total: totalCash,
        byChannel, // đúng keys FE: facebookAds, zalo, dayLaDau, airbnb, booking, senstay, congTacVien
        byPaymentStatus, // { full, deposit, unpaid }
        basis,
        policy: 'recognized-cash'
      },
      occupancy: { rate, booked, available, totalRooms }
    },
    { status: 200 }
  );
}
