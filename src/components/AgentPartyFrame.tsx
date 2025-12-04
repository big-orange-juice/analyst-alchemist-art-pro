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
import { AgentCapability, AgentStats, AgentModule } from '@/types';
import { useLanguage } from '@/lib/useLanguage';

interface AgentPartyFrameProps {
  agentName: string;
  agentClass?: string;
  agentLevel?: number;
  agentStats?: AgentStats;
  agentModules?: AgentModule[];
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
  agentModules,
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

  const capabilityCount = Object.values(AgentCapability).length;
  const moduleCount = agentModules?.length ?? capabilityCount;
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
    },
    {
      label: t('agent_party.module_count'),
      value: `${moduleCount}`,
      icon: Brain,
      accent: 'text-cp-cyan'
    }
  ];

  const renderMember = (cap: AgentCapability) => {
    const label = t(`capabilities.${cap}.label`);
    const desc = t(`capabilities.${cap}.desc`);
    const role = t(`capabilities.${cap}.role`);

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
        className='group relative rounded-xl border border-cp-border bg-gradient-to-br from-cp-dark/60 via-cp-black to-cp-dark/80 p-4 hover:border-cp-yellow/60 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer'
        onClick={() => {
          onSelectCapability(cap);
        }}>
        <div className='flex items-center justify-between gap-3'>
          <div className='flex items-center gap-3 min-w-0'>
            <div className='w-11 h-11 flex shrink-0 items-center justify-center rounded-full text-cp-text-muted group-hover:text-cp-yellow transition-colors border border-cp-border bg-cp-black/60 shadow-inner'>
              <Icon size={18} strokeWidth={1.5} />
            </div>

            <div className='min-w-0'>
              <h4 className='font-semibold text-white text-sm tracking-wide truncate'>
                {label}
              </h4>
              <p className='text-[10px] text-cp-text-muted uppercase tracking-[0.25em] mt-0.5'>
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
              className='p-2 rounded-full text-cp-text-muted hover:text-white border border-transparent hover:border-cp-border transition-colors'
              title={t('agent_party.edit_prompt')}>
              <Settings size={14} />
            </button>
            <button className='p-2 rounded-full text-cp-text-muted hover:text-cp-yellow border border-transparent hover:border-cp-border transition-colors'>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <p className='text-xs text-cp-text-muted/90 mt-3 leading-relaxed'>
          {desc}
        </p>
      </div>
    );
  };

  return (
    <div className='flex flex-col w-full h-full bg-cp-black/80 border border-cp-border rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(0,0,0,0.45)]'>
      <div className='shrink-0 bg-gradient-to-br from-cp-dark via-black to-cp-dark border-b border-cp-border p-5'>
        <div className='flex flex-wrap items-start gap-4'>
          <div className='w-14 h-14 transition-all hover:rotate-6 border border-cp-yellow/40 bg-cp-black flex items-center justify-center shadow-[0_0_20px_rgba(197,160,89,0.2)] rounded-2xl shrink-0'>
            <Cpu size={20} className='text-cp-yellow' strokeWidth={1.5} />
          </div>

          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div className='min-w-0'>
                <h3 className='text-white font-bold text-lg tracking-wide truncate pr-2'>
                  {agentName}
                </h3>
                <p className='text-[11px] text-cp-cyan uppercase tracking-[0.4em] mt-1'>
                  {agentClass}
                </p>
              </div>

              <div className='flex flex-wrap items-center gap-2 text-[10px] font-mono text-cp-text-muted'>
                <span className='px-3 py-1 rounded-full border border-cp-border flex items-center gap-1 uppercase tracking-[0.3em]'>
                  <StatusIcon
                    size={11}
                    className={
                      isJoined ? 'text-cp-yellow' : 'text-cp-text-muted'
                    }
                  />
                  {statusLabel}
                </span>
                <span className='px-3 py-1 rounded-full border border-cp-border'>
                  LV.{agentLevel}
                </span>
                <button
                  onClick={onToggleJoin}
                  disabled={!onToggleJoin}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                    isJoined
                      ? 'border-cp-border text-cp-text-muted hover:text-white hover:border-cp-yellow'
                      : 'border-cp-yellow/80 bg-cp-yellow text-black hover:bg-transparent hover:text-cp-yellow'
                  } ${!onToggleJoin ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {isJoined ? t('agent_party.leave') : t('agent_party.join')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5'>
          {statsCards.map(({ label, value, icon: StatIcon, accent }) => (
            <div
              key={label}
              className='border border-cp-border rounded-xl bg-cp-black/40 p-3 shadow-inner'>
              <div className='flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-cp-text-muted'>
                <span>{label}</span>
                <StatIcon size={12} className={accent} />
              </div>
              <p className={`text-lg font-mono font-semibold mt-2 ${accent}`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className='flex flex-wrap justify-end gap-2 mt-4 pt-3 border-t border-cp-border'>
          <button
            onClick={onOpenChat}
            className='text-[10px] flex items-center gap-1 px-3 py-1 rounded-full border border-cp-border text-cp-text-muted hover:text-cp-yellow hover:border-cp-yellow transition-colors'>
            <MessageSquare size={12} /> {t('agent_party.chat')}
          </button>
          <button
            onClick={onEditAgent}
            disabled={!onEditAgent}
            className={`text-[10px] flex items-center gap-1 px-3 py-1 rounded-full border border-cp-border text-cp-text-muted hover:text-white transition-colors ${
              !onEditAgent
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:border-cp-border'
            }`}>
            <Edit2 size={12} /> {t('agent_party.edit_agent')}
          </button>
          <button
            onClick={onDeleteAgent}
            className='text-[10px] flex items-center gap-1 px-3 py-1 rounded-full border border-cp-border text-cp-text-muted hover:text-cp-red hover:border-cp-red transition-colors'>
            <Trash2 size={12} /> {t('agent_party.delete_agent')}
          </button>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto custom-scrollbar bg-cp-black flex flex-col'>
        <div className='px-5 py-3 text-[10px] font-bold text-cp-text-muted uppercase tracking-widest bg-cp-black/40 border-b border-cp-border sticky top-0 backdrop-blur-sm z-10 flex items-center justify-between'>
          <span>{t('agent_party.matrix')}</span>
          <span>
            {moduleCount} {t('agent_party.module_count')}
          </span>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 px-5 pb-5 pt-4'>
          {Object.values(AgentCapability).map(renderMember)}
        </div>

        <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 min-h-[40px]"></div>
      </div>
    </div>
  );
}
