'use client';

import React, { useRef, useLayoutEffect } from 'react';
import {
  Trophy,
  Brain,
  Zap,
  Shield,
  Hexagon,
  Activity,
  User,
} from 'lucide-react';
import type { RankingItem } from '@/types';
import gsap from 'gsap';
import { useLanguage } from '@/lib/useLanguage';

interface RankingListProps {
  data: RankingItem[];
  onSelectAgent: (agentName: string) => void;
  onInspectAgent: (agentName: string) => void;
}

export default function RankingList({
  data,
  onSelectAgent,
  onInspectAgent
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

  const renderRow = (agent: RankingItem, isPinned: boolean = false) => (
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
      className={`group flex items-center px-6 transition-all duration-300 cursor-pointer hover:bg-cp-dim overflow-hidden
            ${
              isPinned
                ? 'bg-cp-yellow/5 border-b border-cp-yellow/30'
                : 'bg-cp-black'
            }`}
      onClick={() => onSelectAgent(agent.name)}>
      <div className='absolute left-0 top-0 bottom-0 w-[4px] bg-cp-yellow transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300'></div>

      <div className='w-16 shrink-0 font-serif font-bold text-lg text-cp-text-muted group-hover:text-cp-text flex items-center gap-2 group-hover:translate-x-2 transition-transform'>
        {isPinned && <User size={14} className='text-cp-yellow' />}
        <span className={agent.rank <= 3 ? 'text-cp-yellow' : ''}>
          {agent.rank < 10 ? `0${agent.rank}` : agent.rank}
        </span>
      </div>

      <div className='flex-1 min-w-0 flex items-center gap-4 group-hover:translate-x-2 transition-transform'>
        <div
          className={`w-8 h-8 flex items-center justify-center shrink-0 border border-cp-border bg-cp-dark ${
            isPinned ? 'border-cp-yellow/30' : ''
          }`}>
          {getClassIcon(agent.class)}
        </div>
        <div className='flex flex-col justify-center'>
          <span
            className={`font-serif font-bold text-base truncate ${
              isPinned ? 'text-cp-yellow' : 'text-cp-text'
            } group-hover:text-white`}>
            {agent.name}
          </span>
          <span className='text-[10px] uppercase tracking-wider text-cp-text-muted'>
            {agent.class} {t('ranking.model_suffix')}
          </span>
        </div>
      </div>

      <div
        className={`w-28 text-right font-mono font-bold text-base ${
          agent.rawProfit > 0
            ? 'text-cp-yellow'
            : agent.rawProfit < 0
            ? 'text-cp-red'
            : 'text-cp-text-muted'
        } group-hover:scale-105 transition-transform`}>
        {agent.profit}
      </div>

      {!isPinned && (
        <div className='w-12 flex justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInspectAgent(agent.name);
            }}
            className='text-cp-cyan hover:text-white p-2 hover:bg-cp-border transition-colors border border-transparent hover:border-cp-cyan'>
            <Activity size={16} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className='w-full h-full flex flex-col min-h-0 bg-cp-black'>
      <div className='flex items-center text-[10px] text-cp-text-muted font-bold uppercase tracking-widest shrink-0 h-[40px] px-6 font-sans bg-cp-dark'>
        <div className='w-16 shrink-0'>{t('ranking.col_rank')}</div>
        <div className='flex-1 pl-12'>{t('ranking.col_name')}</div>
        <div className='w-28 text-right'>{t('ranking.col_profit')}</div>
        <div className='w-12'></div>
      </div>

      {userAgent && (
        <div className='shrink-0 z-20 relative h-[60px] bg-cp-black'>
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
