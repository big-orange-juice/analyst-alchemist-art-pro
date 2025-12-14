'use client';

import React from 'react';
import {
  Activity,
  Crosshair,
  Search,
  Rewind,
  PenTool,
  Cpu,
  Settings,
  MessageSquare,
  Trash2,
  SignalHigh,
  LogIn,
  Trophy,
  TrendingUp,
  Edit2,
  Brain,
  ChevronRight
} from 'lucide-react';
import { AgentCapability, AgentStats } from '@/types';
import { useLanguage } from '@/lib/useLanguage';

interface AgentPartyFrameProps {
  agentName: string;
  agentClass?: string;
  agentLevel?: number;
  agentStats?: AgentStats;
  isJoined?: boolean;
  rank?: number;
  profit?: string;
  onToggleJoin?: () => void;
  onSelectCapability: (cap: AgentCapability) => void;
  onEditCapability: (cap: AgentCapability) => void;
  onEditAgent?: () => void;
  onOpenChat: () => void;
  onDeleteAgent: () => void;
}

export default function AgentPartyFrame({
  agentName,
  agentClass = '智能型',
  agentLevel = 1,
  isJoined = false,
  rank,
  profit,
  onToggleJoin,
  onSelectCapability,
  onEditCapability,
  onEditAgent,
  onOpenChat,
  onDeleteAgent
}: AgentPartyFrameProps) {
  const { t } = useLanguage();

  const StatusIcon = isJoined ? SignalHigh : LogIn;
  const statusLabel = isJoined ? t('common.online') : t('common.offline');
  const profitColor = profit?.startsWith('+')
    ? 'text-cp-yellow'
    : 'text-cp-text-muted';
  const displayProfit = isJoined ? profit ?? '--' : '--';
  const statsCards = [
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
  ];

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

  const renderMember = (cap: AgentCapability, slotIndex: number) => {
    const label = t(`capabilities.${cap}.label`);
    const role = t(`capabilities.${cap}.role`);
    const slotTag = String(slotIndex + 1).padStart(2, '0');
    const meta = capabilityMeta[cap];

    const Icon = {
      [AgentCapability.AUTO_TRADING]: Activity,
      [AgentCapability.STRATEGY_PICKING]: Crosshair,
      [AgentCapability.STOCK_ANALYSIS]: Search,
      [AgentCapability.BACKTESTING]: Rewind,
      [AgentCapability.ARTICLE_WRITING]: PenTool
    }[cap];

    return (
      <div
        key={cap}
        className='group relative p-3 border-b border-white/[0.02] hover:bg-white/[0.03] transition-all duration-300 cursor-pointer flex flex-col  overflow-hidden'
        onClick={() => {
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

          <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditCapability(cap);
              }}
              className='p-1.5 text-cp-text-muted hover:text-white hover:bg-white/[0.05] rounded transition-colors'
              title={t('agent_party.edit_prompt')}>
              <Settings size={14} />
            </button>
            <button className='p-1.5 text-cp-text-muted hover:text-cp-yellow hover:bg-cp-yellow/10 rounded transition-colors'>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* <div className='relative z-10 grid grid-cols-2 gap-3 text-[11px] text-cp-text-muted leading-relaxed'>
          <p className='col-span-2 text-cp-text-muted/90'>{desc}</p>
          {meta.metrics.map((metric) => (
            <div
              key={metric.label}
              className='bg-white/[0.02] border border-white/[0.03] rounded-sm px-3 py-2 flex flex-col gap-1'>
              <span className='text-[10px] uppercase tracking-[0.3em] text-cp-text-muted/60'>
                {metric.label}
              </span>
              <span className='text-sm font-mono text-white'>
                {metric.value}
              </span>
            </div>
          ))}
          <div className='bg-white/[0.01] border border-white/[0.02] rounded-sm px-3 py-2 flex items-center justify-between col-span-2'>
            <span className='flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-cp-text-muted/70'>
              <SignalHigh size={12} />
              {meta.status}
            </span>
            <span className='text-[10px] font-mono text-cp-text-muted'>
              {meta.latency}
            </span>
          </div>
        </div> */}

        <div className='relative z-10 mt-auto pt-2 flex items-center justify-end text-[10px] font-mono text-cp-text-muted/60 uppercase tracking-[0.2em]'>
          <span>SKILL_{slotTag}</span>
          {/* <span className='group-hover:text-cp-cyan transition-colors'>
            {liveLabel}
          </span> */}
        </div>
      </div>
    );
  };

  return (
    <div className='flex flex-col w-full h-full bg-gradient-to-b from-cp-dim to-cp-black border border-white/[0.02] shadow-2xl backdrop-blur-sm overflow-hidden'>
      {/* Header Section */}
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
                    className={
                      isJoined ? 'text-cp-yellow' : 'text-cp-text-muted'
                    }
                  />
                  {statusLabel}
                </div>
                <div className='px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.05] backdrop-blur-md text-cp-text-muted'>
                  LV.{agentLevel}
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

        {/* Stats Grid */}
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

        {/* Action Bar */}
        <div className='flex flex-wrap justify-end gap-2 mt-5 pt-4 border-t border-white/[0.02]'>
          <button
            onClick={onOpenChat}
            className='text-[10px] flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-white/[0.02] text-cp-text-muted hover:text-cp-yellow transition-all duration-200'>
            <MessageSquare size={12} /> {t('agent_party.chat')}
          </button>
          <button
            onClick={onEditAgent}
            disabled={!onEditAgent}
            className={`text-[10px] flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-white/[0.02] text-cp-text-muted hover:text-white transition-all duration-200 ${
              !onEditAgent ? 'opacity-50 cursor-not-allowed' : ''
            }`}>
            <Edit2 size={12} /> {t('agent_party.edit_agent')}
          </button>
          <button
            onClick={onDeleteAgent}
            className='text-[10px] flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-cp-red/10 text-cp-text-muted hover:text-cp-red transition-all duration-200'>
            <Trash2 size={12} /> {t('agent_party.delete_agent')}
          </button>
        </div>
      </div>

      {/* Capabilities Section */}
      <div className='flex-1 min-h-0 bg-black/40 flex flex-col relative'>
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

        <div className='grid grid-cols-1 flex-1 min-h-0 overflow-y-auto custom-scrollbar divide-y divide-white/[0.02]'>
          {Object.values(AgentCapability).map((cap, idx) =>
            renderMember(cap, idx)
          )}
        </div>

        {/* Bottom Texture */}
        <div className="shrink-0 h-[60px] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
      </div>
    </div>
  );
}
