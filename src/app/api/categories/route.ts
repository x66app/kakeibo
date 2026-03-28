import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/sheets';

export async function GET() {
  try {
    const data = await getCategories();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
