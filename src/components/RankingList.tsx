'use client';

import React, { useRef, useLayoutEffect } from 'react';
import {
  Trophy,
  Brain,
  Zap,
  Shield,
  Hexagon,
  Activity,
  User
} from 'lucide-react';
import type { RankingItem } from '@/types';
import gsap from 'gsap';
import { useLanguage } from '@/lib/useLanguage';

interface RankingListProps {
  data: RankingItem[];
  onSelectAgent: (agentName: string) => void;
  onInspectAgent: (agentName: string) => void;
  onHoverAgent?: (agentName: string | null) => void;
  activeAgent?: string | null;
}

export default function RankingList({
  data,
  onSelectAgent,
  onInspectAgent,
  onHoverAgent,
  activeAgent
}: RankingListProps) {
  const { t } = useLanguage();
  const listRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<string | number, HTMLDivElement>>(new Map());
  const isInitialized = useRef(false);

  useLayoutEffect(() => {
    const scrollableItems = data.filter((item) => !item.isUser);

    scrollableItems.forEach((agent, index) => {
      const el = rowRefs.current.get(agent.id);
      if (el) {
        const targetY = index * 60;

        if (!isInitialized.current) {
          gsap.set(el, { y: targetY, opacity: 1, x: 0 });
          el.setAttribute('data-revealed', 'true');
        } else {
          gsap.to(el, {
            y: targetY,
            duration: 0.5,
            ease: 'power2.out',
            overwrite: 'auto'
          });

          if (!el.hasAttribute('data-revealed')) {
            gsap.fromTo(
              el,
              { opacity: 0, x: -20 },
              { opacity: 1, x: 0, duration: 0.4, delay: index * 0.05 }
            );
            el.setAttribute('data-revealed', 'true');
          }
        }
      }
    });

    if (scrollableItems.length > 0) {
      isInitialized.current = true;
    }
  }, [data]);

  const getClassIcon = (cls: string) => {
    switch (cls) {
      case 'Quant':
        return <Brain size={16} className='text-cp-cyan' />;
      case 'Scalper':
        return <Zap size={16} className='text-cp-yellow' />;
      case 'Whale':
        return <Shield size={16} className='text-cp-red' />;
      default:
        return <Hexagon size={16} className='text-cp-text-muted' />;
    }
  };

  const ROW_HEIGHT = 60;

  const userAgent = data.find((item) => item.isUser);
  const otherAgents = data.filter((item) => !item.isUser);

  const renderRow = (agent: RankingItem, isPinned: boolean = false) => {
    const isSelected = !isPinned && activeAgent === agent.name;
    const rowClass = [
      'group flex items-center px-6 transition-all duration-300 cursor-pointer overflow-hidden',
      isPinned
        ? 'bg-cp-yellow/10 border-b border-cp-yellow/20'
        : isSelected
        ? 'bg-white/[0.08] border-b border-white/[0.08] backdrop-blur'
        : 'bg-transparent border-b border-white/[0.02] hover:bg-white/[0.05]'
    ].join(' ');
    const rankClass = [
      'w-16 shrink-0 font-bold text-lg flex items-center gap-2 transition-transform type-figure',
      isSelected
        ? 'text-white translate-x-2'
        : 'text-cp-text-muted group-hover:text-cp-text group-hover:translate-x-2'
    ].join(' ');
    const contentClass = [
      'flex-1 min-w-0 flex items-center gap-4 transition-transform',
      isSelected ? 'translate-x-2' : 'group-hover:translate-x-2'
    ].join(' ');
    const nameClass = [
      'font-serif font-bold text-base truncate',
      isPinned
        ? 'text-cp-yellow'
        : isSelected
        ? 'text-white'
        : 'text-cp-text group-hover:text-white'
    ].join(' ');
    const actionClass = [
      'w-12 flex justify-end transition-all duration-300 transform translate-x-4',
      isSelected
        ? 'opacity-100 translate-x-0'
        : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-0'
    ].join(' ');

    const profitClass = (() => {
      if (agent.rawProfit > 100) {
        return 'text-transparent bg-clip-text bg-gradient-to-r from-[#F45C43] via-[#F3A953] to-[#FFE29A]';
      }
      if (agent.rawProfit < 100) {
        return 'text-transparent bg-clip-text bg-gradient-to-r from-[#0BAB64] via-[#3BB78F] to-[#F7FFAE]';
      }
      return 'text-cp-text-muted';
    })();

    return (
      <div
        key={agent.id}
        ref={
          !isPinned
            ? (el) => {
                if (el) rowRefs.current.set(agent.id, el);
              }
            : undefined
        }
        style={
          !isPinned
            ? {
                position: 'absolute',
                top: 0,
                left: 0,
                height: `${ROW_HEIGHT}px`,
                width: '100%'
              }
            : {}
        }
        className={rowClass}
        onClick={() => onSelectAgent(agent.name)}
        onMouseEnter={() => onHoverAgent?.(agent.name)}
        onMouseLeave={() => onHoverAgent?.(null)}>
        <div
          className={`absolute left-0 top-0 bottom-0 w-[4px] bg-cp-yellow transform transition-transform duration-300 ${
            isSelected
              ? 'translate-x-0'
              : '-translate-x-full group-hover:translate-x-0'
          }`}></div>

        <div className={rankClass}>
          {isPinned && <User size={14} className='text-cp-yellow' />}
          <span className={agent.rank <= 3 ? 'text-cp-yellow' : ''}>
            {agent.rank < 10 ? `0${agent.rank}` : agent.rank}
          </span>
        </div>

        <div className={contentClass}>
          <div
            className={`w-8 h-8 flex items-center justify-center shrink-0 border border-white/[0.05] bg-white/[0.02] ${
              isPinned ? 'border-cp-yellow/30' : ''
            }`}>
            {getClassIcon(agent.class)}
          </div>
          <div className='flex flex-col justify-center min-w-0'>
            <span className={nameClass}>{agent.name}</span>
            <div className='flex items-center justify-between gap-3'>
              <span className='type-caption'>
                {agent.class} {t('ranking.model_suffix')}
              </span>
              <span
                className={`type-figure text-xs font-semibold inline-block ${profitClass}`}>
                {agent.profit}
              </span>
            </div>
          </div>
        </div>

        {!isPinned && (
          <div className={actionClass}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInspectAgent(agent.name);
              }}
              className='text-cp-cyan hover:text-white p-2 hover:bg-white/[0.05] transition-colors border border-transparent hover:border-cp-cyan/30 rounded'>
              <Activity size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='w-full h-full flex flex-col min-h-0 bg-transparent'>
      <div className='flex items-center type-eyebrow shrink-0 h-[40px] px-6 font-sans glass-header bg-transparent'>
        <div className='w-16 shrink-0'>{t('ranking.col_rank')}</div>
        <div className='flex-1 pl-12'>{t('ranking.col_name')}</div>
        <div className='w-28 text-right'>{t('ranking.col_profit')}</div>
        <div className='w-12'></div>
      </div>

      {userAgent && (
        <div className='shrink-0 z-20 relative h-[60px] bg-transparent'>
          {renderRow(userAgent, true)}
        </div>
      )}

      <div className='flex-1 overflow-y-auto custom-scrollbar relative z-10 min-h-0'>
        <div
          ref={listRef}
          style={{
            height: `${otherAgents.length * ROW_HEIGHT}px`,
            position: 'relative'
          }}>
          {otherAgents.map((agent) => renderRow(agent, false))}
        </div>
      </div>
    </div>
  );
}
