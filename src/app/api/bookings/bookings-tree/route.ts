// src/app/api/bookings-tree/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import House from 'models/House';
import Room from 'models/Room';
import Booking from 'models/Booking';

export async function GET(req: NextRequest) {
  await dbConnect();

  const url = new URL(req.url);
  const from = url.searchParams.get('from'); // YYYY-MM-DD
  const to = url.searchParams.get('to'); // YYYY-MM-DD
  const status = url.searchParams.get('status'); // optional

  const bookingFilter: any = {};
  if (status) bookingFilter.status = status;
  if (from || to) {
    const range: any = {};
    if (from) range.$gte = new Date(from + 'T00:00:00');
    if (to) range.$lte = new Date(to + 'T23:59:59');
    bookingFilter.checkIn = range;
  }

  // Lấy tất cả house
  const houses = await House.find().lean();

  // Lấy tất cả room theo house
  const rooms = await Room.find().lean();
  const bookings = await Booking.find(bookingFilter).populate({ path: 'roomId', select: 'name code houseId' }).lean();

  // Gom dữ liệu theo house → room → order
  const data = houses.map((house) => {
    const houseRooms = rooms
      .filter((r) => String(r.houseId) === String(house._id))
      .map((room) => {
        const roomOrders = bookings
          .filter((b) => String(b.roomId._id) === String(room._id))
          .map((b) => ({
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
