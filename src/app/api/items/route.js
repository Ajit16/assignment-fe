// src/app/api/items/route.js
import dbConnect from '@/lib/mongodb';
import Item from '@/models/items';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await dbConnect();
    const items = await Item.find({});
    return NextResponse.json({ success: true, data: items }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json(); // request.body doesn't work in App Router
    const item = await Item.create(body);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
