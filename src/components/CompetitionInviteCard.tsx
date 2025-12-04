'use client';

import React from 'react';
import { Plus, Trophy, Lock } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';

interface CompetitionInviteCardProps {
  onJoin: () => void;
  isLoggedIn?: boolean;
}

export default function CompetitionInviteCard({
  onJoin,
  isLoggedIn = false
}: CompetitionInviteCardProps) {
  const { t } = useLanguage();

  if (!isLoggedIn) {
    return (
      <div
        onClick={onJoin}
        className='w-full h-full glass-panel flex flex-col justify-center items-center text-center p-6 group cursor-pointer hover:bg-white/[0.05] transition-colors border border-white/[0.02] hover:border-white/[0.1]'>
        <div className='mb-4 text-cp-yellow animate-pulse'>
          <Trophy size={48} strokeWidth={1} />
        </div>
        <h3 className='text-2xl font-bold font-oxanium text-white mb-2 tracking-widest uppercase'>
          {t('invite.season')}
        </h3>
        <p className='text-cp-text-muted font-mono text-xs max-w-xs mb-6 leading-relaxed'>
          {t('invite.intro')}
        </p>
        <button className='px-8 py-3 bg-cp-yellow text-black font-bold font-oxanium uppercase tracking-wider hover:bg-white transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(197,160,89,0.3)]'>
          <Lock size={14} /> {t('invite.login_create')}
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={onJoin}
      className='w-full h-full glass-panel border border-white/[0.02] hover:border-cp-yellow/30 flex flex-col justify-center items-center text-center p-6 group cursor-pointer transition-colors relative'>
      <div className='w-16 h-16 border border-white/[0.05] group-hover:border-cp-yellow/50 flex items-center justify-center mb-4 transition-colors bg-white/[0.02]'>
        <Plus
          size={24}
          className='text-cp-text-muted group-hover:text-cp-yellow transition-colors'
        />
      </div>

      <h3 className='text-lg font-bold font-oxanium text-cp-text mb-2 uppercase group-hover:text-cp-yellow transition-colors tracking-widest'>
        {t('invite.title')}
      </h3>

      <p className='text-cp-text-muted font-mono text-xs max-w-[200px]'>
        {t('invite.desc')}
      </p>

      {/* Decorative corners */}
      <div className='absolute top-0 left-0 w-2 h-2 border-t border-l border-white/[0.1] group-hover:border-cp-yellow transition-colors'></div>
      <div className='absolute top-0 right-0 w-2 h-2 border-t border-r border-white/[0.1] group-hover:border-cp-yellow transition-colors'></div>
      <div className='absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/[0.1] group-hover:border-cp-yellow transition-colors'></div>
      <div className='absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/[0.1] group-hover:border-cp-yellow transition-colors'></div>
    </div>
  );
}
