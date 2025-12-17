'use client';

import React from 'react';
import {
  Activity,
  ChevronRight,
  Crosshair,
  PenTool,
  Rewind,
  Search
} from 'lucide-react';
import { AgentCapability } from '@/types';
import { useLanguage } from '@/lib/useLanguage';

interface AgentCapabilitiesListProps {
  isJoined?: boolean;
  onRequestJoin?: () => void;
  onSelectCapability: (cap: AgentCapability) => void;
}

export default function AgentCapabilitiesList({
  isJoined = false,
  onRequestJoin,
  onSelectCapability
}: AgentCapabilitiesListProps) {
  const { t } = useLanguage();

  const capabilityMeta: Record<
    AgentCapability,
    {
      gradient: string;
      metrics: { label: string; value: string }[];
      status: string;
      latency: string;
    }
  > = {
    [AgentCapability.AUTO_TRADING]: {
      gradient: 'from-[#F9D976]/20 via-[#F39F86]/15 to-transparent',
      metrics: [
        { label: 'PnL', value: '+1.4%' },
        { label: '填单', value: '12/12' },
        { label: '风险', value: '0.62β' }
      ],
      status: t('capability_modal.waiting'),
      latency: '0.8s'
    },
    [AgentCapability.STRATEGY_PICKING]: {
      gradient: 'from-[#4FACFE]/15 via-[#00F2FE]/10 to-transparent',
      metrics: [
        { label: '高分', value: '8/12' },
        { label: '覆盖', value: '32' },
        { label: '动量', value: '+0.87' }
      ],
      status: t('capability_modal.waiting'),
      latency: '1.1s'
    },
    [AgentCapability.STOCK_ANALYSIS]: {
      gradient: 'from-[#F7CE68]/15 via-[#FBAB7E]/10 to-transparent',
      metrics: [
        { label: '诊断', value: '完成' },
        { label: '评级', value: 'A-' },
        { label: '波动', value: '14%' }
      ],
      status: t('capability_modal.waiting'),
      latency: '0.6s'
    },
    [AgentCapability.BACKTESTING]: {
      gradient: 'from-[#A18CD1]/20 via-[#FBC2EB]/15 to-transparent',
      metrics: [
        { label: '夏普', value: '1.48' },
        { label: '胜率', value: '61%' },
        { label: '样本', value: '3Y' }
      ],
      status: t('capability_modal.waiting'),
      latency: '1.4s'
    },
    [AgentCapability.ARTICLE_WRITING]: {
      gradient: 'from-[#F6D365]/20 via-[#FDA085]/15 to-transparent',
      metrics: [
        { label: '段落', value: '6' },
        { label: '引用', value: '12' },
        { label: '信噪', value: '0.78' }
      ],
      status: t('capability_modal.waiting'),
      latency: '0.9s'
    }
  };

  const iconByCap = {
    [AgentCapability.AUTO_TRADING]: Activity,
    [AgentCapability.STRATEGY_PICKING]: Crosshair,
    [AgentCapability.STOCK_ANALYSIS]: Search,
    [AgentCapability.BACKTESTING]: Rewind,
    [AgentCapability.ARTICLE_WRITING]: PenTool
  } as const;

  const renderMember = (cap: AgentCapability) => {
    const label = t(`capabilities.${cap}.label`);
    const role = t(`capabilities.${cap}.role`);
    const meta = capabilityMeta[cap];
    const Icon = iconByCap[cap];

    const isAutoTrading = cap === AgentCapability.AUTO_TRADING;
    const autoTradingStatusText = isJoined
      ? '参赛中 · 自动交易'
      : '未参赛 · 点击参赛';

    return (
      <div
        key={cap}
        className={`group relative border-b border-white/[0.02] hover:bg-white/[0.03] transition-all duration-300 cursor-pointer flex flex-col overflow-hidden ${
          isAutoTrading ? 'p-4 min-h-[120px]' : 'p-3'
        }`}
        onClick={() => {
          if (isAutoTrading) {
            if (!isJoined) onRequestJoin?.();
            return;
          }
          onSelectCapability(cap);
        }}>
        <div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br ${meta.gradient}`}
        />

        <div className='flex items-start justify-between gap-3 relative z-10'>
          <div className='flex items-center gap-3 min-w-0'>
            <div className='p-2.5 rounded-lg bg-white/[0.02] text-cp-text-muted group-hover:text-cp-yellow group-hover:bg-cp-yellow/10 transition-colors'>
              <Icon size={18} strokeWidth={1.5} />
            </div>

            <div className='min-w-0'>
              <h4 className='font-semibold text-white text-sm tracking-wide truncate group-hover:text-cp-yellow transition-colors'>
                {label}
              </h4>
              <p className='text-[10px] text-cp-text-muted uppercase tracking-[0.35em] mt-0.5'>
                {role}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity'>
            <div className='p-1.5 text-cp-text-muted rounded transition-colors'>
              <ChevronRight size={14} />
            </div>
          </div>
        </div>

        {isAutoTrading ? (
          <div className='relative z-10 mt-2 flex items-center justify-between gap-3'>
            <div className='flex items-center gap-2 min-w-0'>
              <div
                className={`w-2 h-2 rounded-full ${
                  isJoined
                    ? 'bg-cp-yellow shadow-[0_0_10px_var(--cp-yellow)] animate-pulse'
                    : 'bg-white/30'
                }`}
              />
              <div className='text-[11px] text-cp-text-muted truncate'>
                {autoTradingStatusText}
              </div>
            </div>

            <div className='flex items-center gap-3 shrink-0'>
              {isJoined ? (
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestJoin?.();
                  }}
                  className='px-3 py-1 rounded-full text-[11px] font-bold tracking-widest border border-white/[0.08] bg-white/[0.02] text-cp-text-muted hover:text-white hover:bg-white/[0.05] transition-colors'>
                  退出参赛
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className='grid grid-cols-1 flex-1 min-h-0 overflow-y-auto custom-scrollbar divide-y divide-white/[0.02]'>
      {Object.values(AgentCapability).map((cap) => renderMember(cap))}
    </div>
  );
}
