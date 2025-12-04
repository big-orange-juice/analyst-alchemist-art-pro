import { NextResponse } from 'next/server';
import { TOP_PERFORMERS } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json(TOP_PERFORMERS);
}
