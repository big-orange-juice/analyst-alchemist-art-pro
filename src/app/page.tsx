import type { Metadata } from 'next';
import LandingPage from './LandingPage';

export const metadata: Metadata = {
  title: 'Analyst Alchemist - Financial Intelligence Matrix',
  description: 'Connect to the financial intelligence matrix. Deploy autonomous AI agents, backtest strategies in real-time, and compete for glory in the global algorithmic ladder.',
};

// Fetch top performers server-side for SSR
async function getTopPerformers() {
  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/performers`, { 
      cache: 'no-store'
    });
    if (!res.ok) {
      return [
        { rank: 1, name: 'Alpha_Seeker', profit: '+142.5%', badge: 'LEGEND' },
        { rank: 2, name: 'Deep_Value', profit: '+89.2%', badge: 'WHALE' },
        { rank: 3, name: 'Quant_X', profit: '+76.4%', badge: 'BOT' }
      ];
    }
    return res.json();
  } catch {
    // Fallback data
    return [
      { rank: 1, name: 'Alpha_Seeker', profit: '+142.5%', badge: 'LEGEND' },
      { rank: 2, name: 'Deep_Value', profit: '+89.2%', badge: 'WHALE' },
      { rank: 3, name: 'Quant_X', profit: '+76.4%', badge: 'BOT' }
    ];
  }
}

export default async function Home() {
  const topPerformers = await getTopPerformers();
  
  return <LandingPage initialTopPerformers={topPerformers} />;
}
