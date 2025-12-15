'use client';

import React from 'react';
import { X, Crown, Lock, Check, Gift, Target } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';

interface SeasonPassModalProps {
  onClose: () => void;
  level?: number;
  onJoin?: () => void;
}

export default function SeasonPassModal({
  onClose,
  level = 0,
  onJoin
}: SeasonPassModalProps) {
  const { t, dictionary } = useLanguage();
  const copy = dictionary.season_pass.season_pass_modal;
  const currentLevel = level;

  return (
    <div className='fixed inset-0 z-[200] bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 modal-animate'>
      <div className='w-full max-w-6xl h-[85vh] glass-panel border-2 border-cp-yellow ring-1 ring-cp-yellow flex flex-col shadow-2xl relative overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-8 border-b border-cp-border bg-white/[0.02] shrink-0 z-10'>
          <div className='flex items-center gap-6'>
            <div className='w-16 h-16 border-2 border-cp-yellow flex items-center justify-center bg-white/[0.02]'>
              <Crown size={32} className='text-cp-yellow' strokeWidth={1} />
            </div>
            <div>
              <h1 className='text-4xl font-serif font-bold text-white uppercase tracking-wide'>
                {t('season_pass.title')}
              </h1>
              <p className='text-cp-text-muted font-sans text-xs mt-1 tracking-[0.2em] uppercase'>
                {t('season_pass.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='w-12 h-12 border border-cp-border flex items-center justify-center text-gray-500 hover:text-white transition-colors'>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-12 relative z-10 flex flex-col items-center'>
          {/* Progress Bar */}
          <div className='w-full max-w-5xl mb-12 hover-card p-6 border border-transparent bg-white/[0.02]'>
            <div className='flex justify-between items-end mb-4'>
              <div className='text-5xl font-serif font-bold text-cp-yellow'>
                {copy.level_prefix}
                {currentLevel}
              </div>
              <div className='text-sm font-mono text-cp-text-muted'>
                {copy.progress}
              </div>
            </div>
            <div className='w-full h-2 bg-white/[0.05] border border-white/[0.02]'>
              <div className='h-full bg-cp-yellow w-1/3'></div>
            </div>
          </div>

          {/* Levels & Tasks Grid */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl'>
            {[1, 2, 3].map((lvl) => (
              <div
                key={lvl}
                className={`border season-pass-card flex flex-col transition-all hover-card h-full ${
                  lvl <= currentLevel
                    ? 'season-pass-card--unlocked bg-white/[0.05]'
                    : 'bg-transparent opacity-60'
                }`}>
                {/* Level Header */}
                <div className='p-4 border-b border-white/[0.02] flex justify-between items-center bg-white/[0.02]'>
                  <span className='text-sm font-bold font-sans uppercase tracking-widest text-cp-text-muted'>
                    {copy.level_label} {lvl}
                  </span>
                  {lvl <= currentLevel ? (
                    <Check size={16} className='text-cp-yellow' />
                  ) : (
                    <Lock size={16} className='text-gray-600' />
                  )}
                </div>

                {/* Tasks */}
                <div className='p-4 flex-1 flex flex-col gap-2'>
                  <div className='text-[10px] text-cp-text-muted uppercase tracking-widest mb-1'>
                    {copy.missions_title}
                  </div>
                  <div className='flex items-center gap-2 text-xs text-cp-text'>
                    <Target size={12} className='text-cp-cyan' />{' '}
                    <span>{copy.mission_trade}</span>
                  </div>
                  <div className='flex items-center gap-2 text-xs text-cp-text'>
                    <Target size={12} className='text-cp-cyan' />{' '}
                    <span>{copy.mission_winrate}</span>
                  </div>
                  <div className='flex items-center gap-2 text-xs text-cp-text'>
                    <Target size={12} className='text-cp-cyan' />{' '}
                    <span>{copy.mission_deploy}</span>
                  </div>
                </div>

                {/* Reward */}
                <div className='p-6 border-t border-cp-border flex flex-col items-center text-center bg-cp-black/50'>
                  <Gift
                    size={24}
                    className={
                      lvl <= currentLevel
                        ? 'text-cp-yellow mb-2'
                        : 'text-gray-600 mb-2'
                    }
                  />
                  <div className='text-sm font-serif font-bold text-white'>
                    {copy.reward}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='mt-16'>
            <button onClick={onJoin} className='px-16 py-5 btn-gold text-lg'>
              {currentLevel === 0 ? copy.activate : copy.view}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
