'use client';

import React from 'react';
import { Cpu } from 'lucide-react';

interface AgentSummaryHeaderProps {
  agentName: string;
  agentClass: string;
}

export default function AgentSummaryHeader({
  agentName,
  agentClass
}: AgentSummaryHeaderProps) {
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
              </h3>
              <p className='text-xs text-cp-cyan uppercase tracking-[0.3em] mt-1.5 font-medium'>
                {agentClass}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
