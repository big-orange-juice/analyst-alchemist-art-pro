import { NextResponse } from 'next/server';
import { MOCK_HOLDINGS } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json(MOCK_HOLDINGS);
}
