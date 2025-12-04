'use client';

import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Crown,
  TrendingUp,
  ChevronRight,
  BarChart2,
  Crosshair,
  Rewind,
  FileText,
  Target
} from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';
import { AgentCapability, CapabilityHistoryEntry } from '@/types';

type CapabilityFeedTab = 'ANALYSIS' | 'PICKING' | 'BACKTEST' | 'REPORT';

const CAPABILITY_TAB_CONFIG: Record<
  CapabilityFeedTab,
  { capability: AgentCapability; labelKey: string; descKey: string }
> = {
  ANALYSIS: {
    capability: AgentCapability.STOCK_ANALYSIS,
    labelKey: 'capabilities.STOCK_ANALYSIS.label',
    descKey: 'capabilities.STOCK_ANALYSIS.desc'
  },
  PICKING: {
    capability: AgentCapability.STRATEGY_PICKING,
    labelKey: 'capabilities.STRATEGY_PICKING.label',
    descKey: 'capabilities.STRATEGY_PICKING.desc'
  },
  BACKTEST: {
    capability: AgentCapability.BACKTESTING,
    labelKey: 'capabilities.BACKTESTING.label',
    descKey: 'capabilities.BACKTESTING.desc'
  },
  REPORT: {
    capability: AgentCapability.ARTICLE_WRITING,
    labelKey: 'capabilities.ARTICLE_WRITING.label',
    descKey: 'capabilities.ARTICLE_WRITING.desc'
  }
};

interface SeasonInfoPanelProps {
  agentName: string | null;
  isJoined?: boolean;
  onOpenPass?: () => void;
}

export default function SeasonInfoPanel({
  agentName,
  isJoined = false,
  onOpenPass
}: SeasonInfoPanelProps) {
  const { t, dictionary } = useLanguage();
  const [activeTab, setActiveTab] = useState<
    'SEASON' | 'LOGS' | 'ANALYSIS' | 'PICKING' | 'BACKTEST' | 'REPORT'
  >('SEASON');

  const [logs, setLogs] = useState<
    {
      time: string;
      action: string;
      type: 'info' | 'success' | 'warn' | 'error';
    }[]
  >([]);

  const [holdings, setHoldings] = useState<
    { code: string; name: string; volume: number; price: number; pnl: number }[]
  >([]);

  // Fetch holdings from API
  useEffect(() => {
    fetch('/api/holdings')
      .then((res) => res.json())
      .then((data) => setHoldings(data))
      .catch(console.error);
  }, []);

  // Auto-switch tabs based on status
  useEffect(() => {
    if (isJoined) {
      setActiveTab('LOGS');
    } else {
      setActiveTab('SEASON');
    }
  }, [isJoined]);

  useEffect(() => {
    if (agentName && isJoined) {
      const interval = setInterval(() => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false });
        const newLogs = [
          {
            time: timeStr,
            action: '正在扫描市场波动率...',
            type: 'info' as const
          },
          {
            time: timeStr,
            action: '检测到信号: 600030',
            type: 'success' as const
          },
          { time: timeStr, action: '风控检查通过', type: 'info' as const },
          {
            time: timeStr,
            action: '挂单中: 买入 300750',
            type: 'warn' as const
          },
          { time: timeStr, action: '分析深度数据...', type: 'info' as const },
          { time: timeStr, action: '更新持仓盈亏...', type: 'info' as const }
        ];
        const randomLog = newLogs[Math.floor(Math.random() * newLogs.length)];
        setLogs((prev) => [randomLog, ...prev].slice(0, 20));
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setLogs([]);
    }
  }, [agentName, isJoined]);

  const capabilityFeedTabs = Object.keys(
    CAPABILITY_TAB_CONFIG
  ) as CapabilityFeedTab[];
  const isCapabilityFeedTab = (
    tab: typeof activeTab
  ): tab is CapabilityFeedTab =>
    capabilityFeedTabs.includes(tab as CapabilityFeedTab);
  const capabilityHistory =
    (dictionary.capability_history as
      | Record<AgentCapability, CapabilityHistoryEntry[]>
      | undefined) ?? {};
  const activeFeedConfig = isCapabilityFeedTab(activeTab)
    ? CAPABILITY_TAB_CONFIG[activeTab]
    : null;
  const activeFeedEntries = activeFeedConfig
    ? capabilityHistory[activeFeedConfig.capability] ?? []
    : [];

  return (
    <div className='w-full h-full flex flex-col bg-transparent text-xs'>
      {/* Tab Header - Bottom Border Only */}
      <div className='flex items-center px-4 h-[40px] gap-6 glass-header bg-transparent overflow-x-auto custom-scrollbar shrink-0'>
        <button
          onClick={() => setActiveTab('SEASON')}
          className={`h-full type-eyebrow tab-item shrink-0 flex items-center gap-2 transition-colors ${
            activeTab === 'SEASON' ? 'active' : ''
          }`}>
          <Crown size={12} /> 赛季概览
        </button>

        {agentName && (
          <>
            <button
              onClick={() => setActiveTab('LOGS')}
              className={`h-full type-eyebrow tab-item shrink-0 flex items-center gap-2 transition-colors ${
                activeTab === 'LOGS' ? 'active' : ''
              }`}>
              <Terminal size={12} /> 运行日志
            </button>
            <button
              onClick={() => setActiveTab('ANALYSIS')}
              className={`h-full type-eyebrow tab-item shrink-0 flex items-center gap-2 transition-colors hover:text-white ${
                activeTab === 'ANALYSIS' ? 'active' : ''
              }`}>
              <BarChart2 size={12} /> 个股诊断
            </button>
            <button
              onClick={() => setActiveTab('PICKING')}
              className={`h-full type-eyebrow tab-item shrink-0 flex items-center gap-2 transition-colors hover:text-white ${
                activeTab === 'PICKING' ? 'active' : ''
              }`}>
              <Crosshair size={12} /> 智能选股
            </button>
            <button
              onClick={() => setActiveTab('BACKTEST')}
              className={`h-full type-eyebrow tab-item shrink-0 flex items-center gap-2 transition-colors hover:text-white ${
                activeTab === 'BACKTEST' ? 'active' : ''
              }`}>
              <Rewind size={12} /> 历史回测
            </button>
            <button
              onClick={() => setActiveTab('REPORT')}
              className={`h-full type-eyebrow tab-item shrink-0 flex items-center gap-2 transition-colors hover:text-white ${
                activeTab === 'REPORT' ? 'active' : ''
              }`}>
              <FileText size={12} /> 研报生成
            </button>
          </>
        )}

        <div className='flex-1'></div>

        {/* Status Indicator */}
        <div className='hidden md:block type-caption type-mono'>
          SYSTEM:{' '}
          {isJoined ? <span className='text-cp-yellow'>ACTIVE</span> : 'IDLE'}
        </div>
      </div>

      {/* Content Area */}
      <div className='flex-1 min-h-0 relative overflow-hidden bg-transparent p-0'>
        {activeTab === 'SEASON' && (
          <div className='w-full h-full flex flex-col'>
            <div className='flex flex-1 min-h-0'>
              {/* Stats - No vertical border unless needed */}
              <div className='w-1/3 p-6 flex flex-col justify-center items-center gap-3 text-center bg-transparent'>
                <div className='type-eyebrow'>赛季奖池</div>
                <div className='text-3xl font-bold text-cp-yellow type-figure'>
                  ¥1.0M
                </div>
                <div className='w-12 h-px bg-white/[0.1] my-2'></div>
                <div className='type-eyebrow'>在线选手</div>
                <div className='text-xl font-bold text-white type-figure'>
                  14,204
                </div>
              </div>

              {/* Pass Info - Clean separation */}
              <div className='flex-1 p-6 flex flex-col justify-center bg-transparent border-l border-white/[0.02]'>
                <div className='flex justify-between items-center mb-4'>
                  <span className='font-bold text-lg text-cp-text type-serif-title'>
                    下级奖励
                  </span>
                  <span className='text-cp-yellow type-caption border border-cp-yellow px-2 py-0.5'>
                    LV.5
                  </span>
                </div>
                <div className='flex items-center gap-4 mb-6'>
                  <div className='w-10 h-10 border border-white/[0.1] flex items-center justify-center text-cp-cyan bg-white/[0.02]'>
                    <TrendingUp size={20} />
                  </div>
                  <div className='text-xs text-cp-text-muted font-sans leading-relaxed'>
                    解锁 Agent 策略的高级 Level-2 市场深度数据。
                  </div>
                </div>
                <button
                  onClick={onOpenPass}
                  className='w-full py-3 glass-button flex items-center justify-center gap-2 text-xs font-bold text-cp-text-muted hover:text-white'>
                  查看赛季通行证 <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'LOGS' && (
          <div className='flex h-full min-h-0 bg-transparent'>
            {/* Left Column: Holdings */}
            <div className='w-[35%] border-r border-white/[0.02] flex flex-col bg-white/[0.01]'>
              <div className='h-8 flex items-center px-3 border-b border-white/[0.02] bg-white/[0.02] shrink-0'>
                <span className='type-eyebrow flex items-center gap-2'>
                  <Target size={10} /> 实时持仓
                </span>
              </div>
              <div className='flex-1 overflow-y-auto custom-scrollbar'>
                {holdings.map((h) => (
                  <div
                    key={h.code}
                    className='px-5 py-2 border-white/[0.02] hover:bg-white/[0.05] transition-colors group'>
                    <div className='flex justify-between items-center mb-1'>
                      <span className='text-xs font-bold text-cp-text group-hover:text-white'>
                        {h.name}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold ${
                          h.pnl >= 0 ? 'text-cp-yellow' : 'text-cp-red'
                        }`}>
                        {h.pnl >= 0 ? '+' : ''}
                        {h.pnl}%
                      </span>
                    </div>
                    <div className='flex justify-between items-center text-[10px] text-cp-text-muted type-mono'>
                      <span>{h.code}</span>
                      <span>
                        {h.volume}股 / ¥{h.price}
                      </span>
                    </div>
                  </div>
                ))}
                <div className='p-2 type-caption text-gray-600 text-center italic mt-2'>
                  数据延迟 3s
                </div>
              </div>
            </div>

            {/* Right Column: Logs */}
            <div className='flex-1 flex flex-col min-h-0'>
              <div className='h-8 flex items-center px-3 border-b border-white/[0.02] bg-white/[0.02] shrink-0'>
                <span className='type-eyebrow flex items-center gap-2'>
                  <Terminal size={10} /> 系统日志
                </span>
              </div>
              <div className='flex-1 overflow-y-auto custom-scrollbar p-3 type-mono text-[11px] flex flex-col-reverse bg-transparent leading-relaxed'>
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className='mb-1.5 flex gap-2 opacity-80 hover:opacity-100 transition-opacity'>
                    <span className='text-cp-text-muted select-none shrink-0'>
                      [{log.time}]
                    </span>
                    <span
                      className={
                        log.type === 'success'
                          ? 'text-cp-yellow'
                          : log.type === 'warn'
                          ? 'text-cp-red'
                          : log.type === 'info'
                          ? 'text-cp-cyan'
                          : 'text-cp-text-muted'
                      }>
                      {log.type === 'warn' && '! '}
                      {log.type === 'success' && '> '}
                      {log.action}
                    </span>
                  </div>
                ))}
                <div className='text-cp-text-muted mb-4 opacity-50 select-none type-mono'>
                  --- SYSTEM STREAM START ---
                </div>
              </div>
            </div>
          </div>
        )}

        {activeFeedConfig && (
          <div className='flex flex-col h-full min-h-0 bg-transparent'>
            <div className='flex flex-wrap items-start justify-between gap-3 p-6 border-b border-white/[0.02] bg-white/[0.02]'>
              <div>
                <div className='type-eyebrow text-cp-text'>
                  {t(activeFeedConfig.labelKey)}
                </div>
                <p className='text-sm text-cp-text-muted mt-2 max-w-xl leading-relaxed'>
                  {t(activeFeedConfig.descKey)}
                </p>
              </div>
              <div className='text-right'>
                <span className='type-caption text-cp-yellow block'>
                  {t('capability_modal.history_latency')}
                </span>
                {agentName && (
                  <span className='type-mono text-[11px] text-cp-text-muted'>
                    {agentName}
                  </span>
                )}
              </div>
            </div>
            <div className='flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3 bg-transparent'>
              {activeFeedEntries.length ? (
                activeFeedEntries.map((entry, idx) => (
                  <div
                    key={`${entry.time}-${entry.tag}-${idx}`}
                    className='border border-white/[0.05] bg-white/[0.02] p-4 hover:border-cp-yellow/30 transition-colors'>
                    <div className='flex items-center justify-between type-mono text-[11px] text-cp-text-muted'>
                      <span>{entry.time}</span>
                      <span className='tracking-[0.35em]'>{entry.tag}</span>
                    </div>
                    <p className='text-sm text-white mt-2 leading-relaxed'>
                      {entry.summary}
                    </p>
                    <p className='text-xs text-cp-text-muted mt-1'>
                      {entry.detail}
                    </p>
                  </div>
                ))
              ) : (
                <div className='text-cp-text-muted text-sm font-mono'>
                  {t('capability_modal.history_empty')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
