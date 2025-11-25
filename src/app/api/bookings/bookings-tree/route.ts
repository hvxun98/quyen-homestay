// src/app/api/bookings-tree/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import House from 'models/House';
import Room from 'models/Room';
import Booking from 'models/Booking';
import { normalizeDateStr } from 'utils/datetime';
import dayjs from 'dayjs';
import { APP_TZ } from 'utils/dayjsTz';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  await dbConnect();

  const url = new URL(req.url);
  const from = url.searchParams.get('from'); // YYYY-MM-DD
  const to = url.searchParams.get('to'); // YYYY-MM-DD
  const status = url.searchParams.get('status'); // optional

  const bookingFilter: any = {};
  if (status) bookingFilter.status = status;
  if (from || to) {
    // Chuẩn hoá ngày về YYYY-MM-DD
    const fromYmd = from ? normalizeDateStr(from) : undefined;
    const toYmd = to ? normalizeDateStr(to) : fromYmd; // nếu không có to, dùng from

    if (!fromYmd && !toYmd) {
      // không làm gì
    } else {
      const startYmd = fromYmd ?? toYmd!;
      const endYmd = toYmd ?? fromYmd!;

      // Tạo Date theo múi giờ VN, rồi convert ra UTC Date để query Mongo
      const start = dayjs.tz(startYmd, 'YYYY-MM-DD', APP_TZ).startOf('day').toDate();
      const end = dayjs.tz(endYmd, 'YYYY-MM-DD', APP_TZ).endOf('day').toDate();

      bookingFilter.$or = [
        // checkIn nằm trong [start, end]
        { checkIn: { $gte: start, $lte: end } },
        // checkOut nằm trong [start, end]
        { checkOut: { $gte: start, $lte: end } },
        // Booking bao trùm cả khoảng [start, end]
        { checkIn: { $lte: start }, checkOut: { $gte: end } }
      ];
    }
  }
  // Lấy tất cả house
  const houses = await House.find().lean();

  // Lấy tất cả room theo house
  const rooms = await Room.find().lean();
  const bookings = (await Booking.find(bookingFilter).populate({ path: 'roomId', select: 'name code houseId' }).lean()).filter(
    (b) => b.roomId
  );

  // Gom dữ liệu theo house → room → order
  const data = houses.map((house) => {
    const houseRooms = rooms
      .filter((r) => String(r.houseId) === String(house._id))
      .map((room) => {
        const roomOrders = bookings
          .filter((b) => b.roomId && String(b.roomId._id) === String(room._id))
          .map((b) => ({
            _id: b._id,
            orderCode: b.orderCode,
            customerName: b.customerName,
            checkIn: b.checkIn,
            checkOut: b.checkOut,
            status: b.status,
            price: b.price
          }));

        return {
          _id: room._id,
          name: room.name,
          code: room.code,
          orders: roomOrders
        };
      });

    return {
      _id: house._id,
      code: house.code,
      name: house.name,
      rooms: houseRooms
    };
  });

  return NextResponse.json({ data, totalHouses: houses.length });
}
