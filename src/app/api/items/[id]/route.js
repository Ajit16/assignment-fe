import dbConnect from '@/lib/mongodb';
import Item from '@/models/items';
import { NextResponse } from 'next/server';


export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const id = params.id;
    const body = await request.json();
    const item = await Item.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({ success: true, data: item }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const id = params.id;
    const deletedItem = await Item.deleteOne({ _id: id });

    return NextResponse.json({ success: true, data: deletedItem }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 400 });
  }
}