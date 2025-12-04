import { NextResponse } from 'next/server';
import { SEASON_INFO } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json(SEASON_INFO);
}
