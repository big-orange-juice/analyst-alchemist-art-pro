'use client';

import React, { useState } from 'react';
import { X, Hexagon } from 'lucide-react';
import { AgentCapability, AGENT_CAPABILITY_DETAILS } from '@/types';
import { useLanguage } from '@/lib/useLanguage';

interface ExternalAgentModalProps {
  agentName: string;
  onClose: () => void;
}

export default function ExternalAgentModal({
  agentName,
  onClose
}: ExternalAgentModalProps) {
  const [activeTab, setActiveTab] = useState<AgentCapability>(
    AgentCapability.AUTO_TRADING
  );
  const { t } = useLanguage();

  return (
    <div className='fixed inset-0 z-[80] flex items-center justify-center backdrop-blur-md bg-black/80 p-4 modal-animate'>
      <div className='w-full max-w-4xl h-[80vh] glass-panel border border-white/[0.02] flex flex-col shadow-2xl relative'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-white/[0.02] bg-white/[0.02] shrink-0'>
          <div className='flex items-center gap-6'>
            <div className='w-12 h-12 border border-white/[0.02] flex items-center justify-center text-cp-yellow bg-white/[0.02]'>
              <Hexagon size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className='text-3xl font-bold font-serif text-white tracking-wide uppercase'>
                {agentName}
              </h2>
              <div className='flex items-center gap-4 text-xs font-mono mt-2 text-cp-text-muted'>
                <span>{t('external_agent.rank')} #3</span>
                <span className='text-gray-600'>|</span>
                <span>
                  {t('external_agent.status')}{' '}
                  <span className='text-cp-yellow'>
                    {t('external_agent.online')}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-white transition-colors'>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className='flex flex-1 overflow-hidden'>
          {/* Sidebar Tabs - Clean List */}
          <div className='w-64 bg-white/[0.02] border-r border-white/[0.02] flex flex-col py-4 shrink-0'>
            {Object.values(AgentCapability).map((cap) => {
              const details = AGENT_CAPABILITY_DETAILS[cap];
              const label = t(details.labelKey);
              const isActive = activeTab === cap;
              return (
                <button
                  key={cap}
                  onClick={() => setActiveTab(cap)}
                  className={`px-6 py-4 text-left flex items-center gap-3 transition-all relative hover-card m-2 border-transparent
                                ${
                                  isActive
                                    ? 'text-cp-yellow border border-cp-yellow/30 bg-white/[0.05]'
                                    : 'text-gray-500 hover:text-gray-300'
                                }
                            `}>
                  <span className='font-bold font-sans text-xs uppercase tracking-widest'>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Content - Gallery Text */}
          <div className='flex-1 p-8 bg-transparent overflow-y-auto custom-scrollbar'>
            <div className='mb-6 pb-4 border-b border-white/[0.02]'>
              <h3 className='text-xl font-serif font-bold text-white mb-2'>
                {t(AGENT_CAPABILITY_DETAILS[activeTab].labelKey)}
              </h3>
              <p className='text-sm text-gray-500 font-sans'>
                {t(AGENT_CAPABILITY_DETAILS[activeTab].descKey)}
              </p>
            </div>

            <div className='font-mono text-sm text-cp-text-muted leading-loose'>
              {/* Placeholder Content for Aesthetic */}
              <div className='p-4 border border-white/[0.02] bg-white/[0.02] mb-4 hover-card'>
                <div className='flex justify-between mb-2 text-xs uppercase tracking-widest text-gray-500'>
                  <span>{t('external_agent.latest_signal')}</span>
                  <span>{t('external_agent.latest_signal_time')}</span>
                </div>
                <div className='text-white font-bold'>
                  BUY 600519.SH @ 1680.00
                </div>
              </div>
              <p className='hover-card p-4 border border-transparent'>
                {t('external_agent.analysis_line_one')}
                <br />
                {t('external_agent.analysis_line_two')}
                <br />
                <span className='text-cp-yellow'>
                  {t('external_agent.analysis_highlight')}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
