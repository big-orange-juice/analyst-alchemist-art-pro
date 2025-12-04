import { NextResponse } from 'next/server';
import { STRATEGY_PRESETS } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json(STRATEGY_PRESETS);
}
