import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import House from 'models/House';

// GET /api/houses/[id] - lấy chi tiết 1 nhà
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const house = await House.findById(params.id).lean();
    if (!house) {
      return NextResponse.json({ error: 'House not found' }, { status: 404 });
    }
    return NextResponse.json(house);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }
}

// PUT /api/houses/[id] - sửa thông tin nhà
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const updated = await House.findByIdAndUpdate(
      params.id,
      {
        code: body.code,
        address: body.address,
        numOfFloors: body.numOfFloors,
        numOfRooms: body.numOfRooms,
        price: body.price
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'House not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (e: any) {
    if (e?.code === 11000) {
      return NextResponse.json({ error: 'House code already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update house' }, { status: 500 });
  }
}

// DELETE /api/houses/[id] - xoá nhà
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const deleted = await House.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'House not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete house' }, { status: 500 });
  }
}
