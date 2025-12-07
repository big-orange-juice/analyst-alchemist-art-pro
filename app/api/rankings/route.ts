import { NextResponse } from 'next/server';
import { INITIAL_BOTS } from '@/lib/mockData';
import type { RankingItem, ChartDataPoint } from '@/types';

// Generate chart data based on current bots
function generateChartData(bots: RankingItem[]): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const startTime = new Date().setHours(9, 30, 0, 0);
  const currentValues: Record<string, number> = {};
  
  bots.forEach((bot) => {
    currentValues[bot.name] = 100;
  });

  for (let i = 0; i < 50; i++) {
    const time = new Date(startTime + i * 1000 * 60 * 5);
    const point: ChartDataPoint = {
      time: time.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    Object.keys(currentValues).forEach((key) => {
      const change = (Math.random() - 0.48) * 2;
      currentValues[key] = currentValues[key] + change;
      point[key] = parseFloat(currentValues[key].toFixed(2));
    });
    data.push(point);
  }
  
  return data;
}

export async function GET() {
  const chartData = generateChartData(INITIAL_BOTS);
  return NextResponse.json({
    rankings: INITIAL_BOTS,
    chartData
  });
}
