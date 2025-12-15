'use client';

import React, { useMemo } from 'react';
import { TrendingUp, Trophy } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';

interface AgentStatsGridProps {
  isJoined: boolean;
  rank?: number;
  profit?: string;
}

export default function AgentStatsGrid({
  isJoined,
  rank,
  profit
}: AgentStatsGridProps) {
  const { t } = useLanguage();

  const profitColor = profit?.startsWith('+')
    ? 'text-cp-yellow'
    : 'text-cp-text-muted';

  const displayProfit = isJoined ? profit ?? '--' : '--';

  const statsCards = useMemo(
    () => [
      {
        label: t('agent_party.rank'),
        value: isJoined ? `#${rank ?? '--'}` : '--',
        icon: Trophy,
        accent: 'text-cp-yellow'
      },
      {
        label: t('agent_party.profit'),
        value: displayProfit,
        icon: TrendingUp,
        accent: profitColor
      }
    ],
    [displayProfit, isJoined, profitColor, rank, t]
  );

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6'>
      {statsCards.map(({ label, value, icon: StatIcon, accent }) => (
        <div
          key={label}
          className='relative group overflow-hidden rounded-sm border border-white/[0.02] bg-black/20 p-3 transition-colors hover:bg-white/[0.02]'>
          <div className='flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-cp-text-muted/70 mb-2'>
            <span>{label}</span>
            <StatIcon
              size={12}
              className={`${accent} opacity-70 group-hover:opacity-100 transition-opacity`}
            />
          </div>
          <p
            className={`text-lg font-mono font-semibold ${accent} drop-shadow-sm`}>
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
