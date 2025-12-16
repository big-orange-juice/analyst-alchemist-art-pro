import type { Metadata } from 'next';
import LandingPage from './LandingPage';

export const metadata: Metadata = {
  title: 'Analyst Alchemist - Stock Assistant',
  description:
    'A professional stock assistant for research and auto trading: backtests, risk metrics, and activity rankings.'
};

const fallbackPerformers = [
  { rank: 1, name: 'Alpha_Seeker', profit: '+142.5%', badge: 'LEGEND' },
  { rank: 2, name: 'Deep_Value', profit: '+89.2%', badge: 'WHALE' },
  { rank: 3, name: 'Quant_X', profit: '+76.4%', badge: 'BOT' }
];

// Fetch top performers server-side for SSR with revalidation
async function getTopPerformers() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) return fallbackPerformers;

  try {
    const res = await fetch(`${baseUrl}/api/performers`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return fallbackPerformers;
    return res.json();
  } catch {
    return fallbackPerformers;
  }
}

export default async function Home() {
  const topPerformers = await getTopPerformers();

  return <LandingPage initialTopPerformers={topPerformers} />;
}
