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
import { AgentCapability } from '@/types';

interface SeasonInfoPanelProps {
  agentName: string | null;
  isJoined?: boolean;
  onOpenPass?: () => void;
  onOpenReport?: (report: { title: string; date: string; tag: string }) => void;
  onSelectCapability?: (cap: AgentCapability) => void;
}

export default function SeasonInfoPanel({
  agentName,
  isJoined = false,
  onOpenPass,
  onSelectCapability
}: SeasonInfoPanelProps) {
  const { t } = useLanguage();
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
          { time: timeStr, action: '正在扫描市场波动率...', type: 'info' as const },
          { time: timeStr, action: '检测到信号: 600030', type: 'success' as const },
          { time: timeStr, action: '风控检查通过', type: 'info' as const },
          { time: timeStr, action: '挂单中: 买入 300750', type: 'warn' as const },
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

  return (
    <div className='w-full h-full flex flex-col bg-cp-black text-xs'>
      {/* Tab Header - Bottom Border Only */}
      <div className='flex items-center px-4 h-[40px] gap-6 bg-cp-black border-b border-cp-border overflow-x-auto custom-scrollbar shrink-0'>
        <button
          onClick={() => setActiveTab('SEASON')}
          className={`h-full font-bold font-sans uppercase transition-colors flex items-center gap-2 tracking-widest tab-item shrink-0 ${
            activeTab === 'SEASON' ? 'active' : ''
          }`}>
          <Crown size={12} /> 赛季概览
        </button>

        {agentName && (
          <>
            <button
              onClick={() => setActiveTab('LOGS')}
              className={`h-full font-bold font-sans uppercase transition-colors flex items-center gap-2 tracking-widest tab-item shrink-0 ${
                activeTab === 'LOGS' ? 'active' : ''
              }`}>
              <Terminal size={12} /> 运行日志
            </button>
            <button
              onClick={() =>
                onSelectCapability?.(AgentCapability.STOCK_ANALYSIS)
              }
              className={`h-full font-bold font-sans uppercase transition-colors flex items-center gap-2 tracking-widest tab-item shrink-0 text-cp-text-muted hover:text-white`}>
              <BarChart2 size={12} /> 个股诊断
            </button>
            <button
              onClick={() =>
                onSelectCapability?.(AgentCapability.STRATEGY_PICKING)
              }
              className={`h-full font-bold font-sans uppercase transition-colors flex items-center gap-2 tracking-widest tab-item shrink-0 text-cp-text-muted hover:text-white`}>
              <Crosshair size={12} /> 智能选股
            </button>
            <button
              onClick={() => onSelectCapability?.(AgentCapability.BACKTESTING)}
              className={`h-full font-bold font-sans uppercase transition-colors flex items-center gap-2 tracking-widest tab-item shrink-0 text-cp-text-muted hover:text-white`}>
              <Rewind size={12} /> 历史回测
            </button>
            <button
              onClick={() =>
                onSelectCapability?.(AgentCapability.ARTICLE_WRITING)
              }
              className={`h-full font-bold font-sans uppercase transition-colors flex items-center gap-2 tracking-widest tab-item shrink-0 text-cp-text-muted hover:text-white`}>
              <FileText size={12} /> 研报生成
            </button>
          </>
        )}

        <div className='flex-1'></div>

        {/* Status Indicator */}
        <div className='text-[10px] text-cp-text-muted font-mono tracking-widest hidden md:block'>
          SYSTEM:{' '}
          {isJoined ? <span className='text-cp-yellow'>ACTIVE</span> : 'IDLE'}
        </div>
      </div>

      {/* Content Area */}
      <div className='flex-1 min-h-0 relative overflow-hidden bg-cp-black p-0'>
        {activeTab === 'SEASON' && (
          <div className='w-full h-full flex flex-col'>
            <div className='flex flex-1 min-h-0'>
              {/* Stats - No vertical border unless needed */}
              <div className='w-1/3 p-6 flex flex-col justify-center items-center gap-3 text-center bg-cp-black'>
                <div className='text-cp-text-muted text-[10px] uppercase tracking-widest'>
                  赛季奖池
                </div>
                <div className='text-3xl font-serif font-bold text-cp-yellow'>
                  ¥1.0M
                </div>
                <div className='w-12 h-px bg-cp-border my-2'></div>
                <div className='text-cp-text-muted text-[10px] uppercase tracking-widest'>
                  在线选手
                </div>
                <div className='text-xl font-sans font-bold text-white'>
                  14,204
                </div>
              </div>

              {/* Pass Info - Clean separation */}
              <div className='flex-1 p-6 flex flex-col justify-center bg-cp-black border-l border-cp-border'>
                <div className='flex justify-between items-center mb-4'>
                  <span className='font-bold font-serif text-lg text-cp-text uppercase'>
                    下级奖励
                  </span>
                  <span className='text-cp-yellow text-[10px] border border-cp-yellow px-2 py-0.5 font-sans font-bold tracking-widest'>
                    LV.5
                  </span>
                </div>
                <div className='flex items-center gap-4 mb-6'>
                  <div className='w-10 h-10 border border-cp-border flex items-center justify-center text-cp-cyan bg-cp-dark'>
                    <TrendingUp size={20} />
                  </div>
                  <div className='text-xs text-cp-text-muted font-sans leading-relaxed'>
                    解锁 Agent 策略的高级 Level-2 市场深度数据。
                  </div>
                </div>
                <button
                  onClick={onOpenPass}
                  className='w-full py-3 btn-outline flex items-center justify-center gap-2 text-xs font-bold'>
                  查看赛季通行证 <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'LOGS' && (
          <div className='flex h-full min-h-0 bg-cp-black'>
            {/* Left Column: Holdings */}
            <div className='w-[35%] border-r border-cp-border flex flex-col bg-cp-dark/10'>
              <div className='h-8 flex items-center px-3 border-b border-cp-border bg-cp-dark/30 shrink-0'>
                <span className='text-[10px] font-bold text-cp-text-muted uppercase tracking-widest flex items-center gap-2'>
                  <Target size={10} /> 实时持仓
                </span>
              </div>
              <div className='flex-1 overflow-y-auto custom-scrollbar'>
                {holdings.map((h) => (
                  <div
                    key={h.code}
                    className='px-5 py-2 border-cp-border/30 hover:bg-cp-dim/30 transition-colors group'>
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
                    <div className='flex justify-between items-center text-[10px] text-cp-text-muted font-mono'>
                      <span>{h.code}</span>
                      <span>
                        {h.volume}股 / ¥{h.price}
                      </span>
                    </div>
                  </div>
                ))}
                <div className='p-2 text-[10px] text-gray-600 text-center italic mt-2'>
                  数据延迟 3s
                </div>
              </div>
            </div>

            {/* Right Column: Logs */}
            <div className='flex-1 flex flex-col min-h-0'>
              <div className='h-8 flex items-center px-3 border-b border-cp-border bg-cp-dark/30 shrink-0'>
                <span className='text-[10px] font-bold text-cp-text-muted uppercase tracking-widest flex items-center gap-2'>
                  <Terminal size={10} /> 系统日志
                </span>
              </div>
              <div className='flex-1 overflow-y-auto custom-scrollbar p-3 font-mono text-[11px] flex flex-col-reverse bg-cp-black leading-relaxed'>
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
                <div className='text-cp-text-muted mb-4 opacity-50 select-none'>
                  --- SYSTEM STREAM START ---
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
