import { NextResponse } from 'next/server';
import { MARKET_EVENTS } from '@/lib/mockData';

export async function GET() {
  // Return a random event
  const randomEvent = MARKET_EVENTS[Math.floor(Math.random() * MARKET_EVENTS.length)];
  return NextResponse.json(randomEvent);
}
