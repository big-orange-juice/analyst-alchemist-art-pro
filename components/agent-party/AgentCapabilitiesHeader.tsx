'use client';

import React from 'react';
import { Brain } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';

interface AgentCapabilitiesHeaderProps {
  isJoined: boolean;
  rank?: number;
  profit?: string;
}

export default function AgentCapabilitiesHeader({
  isJoined,
  rank,
  profit
}: AgentCapabilitiesHeaderProps) {
  const { t } = useLanguage();

  const profitColor = profit?.startsWith('+')
    ? 'text-cp-yellow'
    : 'text-cp-text-muted';

  const displayProfit = isJoined ? profit ?? '--' : '--';

  return (
    <div className='px-6 py-3 text-[10px] font-bold text-cp-text-muted/60 uppercase tracking-widest bg-black/60 border-b border-white/[0.02] sticky top-0 backdrop-blur-md z-10 flex items-center justify-between shadow-sm'>
      <span className='flex items-center gap-2'>
        <Brain size={12} />
        {t('agent_party.matrix')}
      </span>
      {isJoined ? (
        <div className='flex items-center gap-2 font-mono tracking-[0.2em]'>
          <span className='px-2 py-0.5 rounded border border-cp-yellow/40 text-cp-yellow bg-cp-yellow/5'>
            #{rank ?? '--'}
          </span>
          <span
            className={`px-2 py-0.5 rounded border border-white/[0.1] ${profitColor} bg-white/[0.02]`}>
            {displayProfit}
          </span>
        </div>
      ) : (
        <span className='text-cp-text-muted tracking-[0.3em]'>
          {t('agent_party.join')}
        </span>
      )}
    </div>
  );
}
