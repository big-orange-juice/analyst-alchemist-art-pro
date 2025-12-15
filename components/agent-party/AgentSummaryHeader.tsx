'use client';

import React from 'react';
import { Cpu, LogIn, SignalHigh } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';

interface AgentSummaryHeaderProps {
  agentName: string;
  agentClass: string;
  isJoined: boolean;
  onToggleJoin?: () => void;
}

export default function AgentSummaryHeader({
  agentName,
  agentClass,
  isJoined,
  onToggleJoin
}: AgentSummaryHeaderProps) {
  const { t } = useLanguage();

  const StatusIcon = isJoined ? SignalHigh : LogIn;
  const statusLabel = isJoined ? t('common.online') : t('common.offline');

  return (
    <div className='shrink-0 p-6 relative overflow-hidden'>
      {/* Background Glow */}
      <div className='absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none' />

      <div className='relative z-10 flex flex-wrap items-start gap-5'>
        {/* Avatar Box */}
        <div className='w-16 h-16 relative group shrink-0'>
          <div className='absolute inset-0 bg-cp-yellow/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
          <div className='relative w-full h-full border border-cp-yellow/30 bg-gradient-to-br from-cp-border/10 to-transparent flex items-center justify-center shadow-[0_0_15px_rgba(197,160,89,0.15)] backdrop-blur-md transition-transform group-hover:scale-105 duration-300'>
            <Cpu
              size={24}
              className='text-cp-yellow drop-shadow-[0_0_8px_rgba(197,160,89,0.5)]'
              strokeWidth={1.5}
            />

            {/* Corner Accents */}
            <div className='absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-cp-yellow/60' />
            <div className='absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-cp-yellow/60' />
          </div>
        </div>

        <div className='min-w-0 flex-1 pt-1'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div className='min-w-0'>
              <h3 className='text-white font-bold text-xl tracking-wide truncate flex items-center gap-2'>
                {agentName}
                {isJoined && (
                  <div className='w-1.5 h-1.5 rounded-full bg-cp-yellow shadow-[0_0_10px_var(--cp-yellow)] animate-pulse' />
                )}
              </h3>
              <p className='text-xs text-cp-cyan uppercase tracking-[0.3em] mt-1.5 font-medium'>
                {agentClass}
              </p>
            </div>

            <div className='flex flex-wrap items-center gap-2 text-[10px] font-mono font-medium'>
              <div className='px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.05] backdrop-blur-md flex items-center gap-1.5 uppercase tracking-wider text-cp-text-muted'>
                <StatusIcon
                  size={12}
                  className={isJoined ? 'text-cp-yellow' : 'text-cp-text-muted'}
                />
                {statusLabel}
              </div>
              <button
                onClick={onToggleJoin}
                disabled={!onToggleJoin}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                  isJoined
                    ? 'bg-white/[0.02] text-cp-text-muted hover:text-white hover:bg-white/[0.05] border border-white/[0.05]'
                    : 'bg-cp-yellow text-black hover:bg-cp-yellow/90 shadow-[0_0_15px_rgba(197,160,89,0.3)] hover:shadow-[0_0_25px_rgba(197,160,89,0.5)]'
                } ${!onToggleJoin ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {isJoined ? t('agent_party.leave') : t('agent_party.join')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
