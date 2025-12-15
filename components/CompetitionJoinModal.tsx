'use client';

import React from 'react';
import { X, Trophy, Zap } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';

type StockActivity = {
  id: number | string;
  activity_name?: string;
  status?: string;
  end_date?: string;
  start_date?: string;
  initial_capital?: string;
  index_sort?: number;
};

interface CompetitionJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: () => void;
  activity?: StockActivity | null;
}

export default function CompetitionJoinModal({
  isOpen,
  onClose,
  onJoin,
  activity
}: CompetitionJoinModalProps) {
  const { dictionary } = useLanguage();
  if (!isOpen) return null;
  const copy = dictionary.competition_join;

  const statusText =
    (activity?.status &&
      (dictionary as any)?.activity_panel?.status?.[activity.status]) ||
    activity?.status ||
    copy.participants_value;

  const activityIndexText =
    typeof activity?.index_sort === 'number'
      ? `#${activity.index_sort}`
      : copy.rank_value;

  const endDateText = activity?.end_date || copy.ends_value;

  return (
    <div className='fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-xl p-4 modal-animate'>
      <div className='w-full max-w-3xl glass-panel border border-cp-yellow/50 ring-1 ring-cp-yellow/20 shadow-2xl flex flex-col relative'>
        <button
          onClick={onClose}
          className='absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-10'>
          <X size={24} />
        </button>

        <div className='p-10 md:p-14 text-center'>
          <div className='mb-6 inline-flex items-center justify-center w-16 h-16 border border-cp-yellow/50 bg-white/[0.02] hover-card'>
            <Trophy size={32} className='text-cp-yellow' strokeWidth={1} />
          </div>

          <h2 className='text-3xl md:text-5xl font-serif font-bold text-white mb-4'>
            {copy.title}
          </h2>
          <p className='text-cp-text-muted font-sans font-light text-lg mb-12 max-w-lg mx-auto'>
            {activity?.activity_name
              ? `${copy.description} (${activity.activity_name})`
              : copy.description}
          </p>

          <div className='grid grid-cols-3 gap-6 mb-12 border-t border-b border-cp-border py-8'>
            <div className='flex flex-col items-center gap-2 hover-card p-2 border border-transparent'>
              <div className='text-xs font-bold uppercase tracking-widest text-gray-500'>
                {copy.rank_label}
              </div>
              <div className='text-2xl font-serif font-bold text-cp-yellow'>
                {activityIndexText}
              </div>
            </div>
            <div className='flex flex-col items-center gap-2 border-l border-r border-cp-border hover-card p-2 border-y-transparent'>
              <div className='text-xs font-bold uppercase tracking-widest text-gray-500'>
                {copy.participants_label}
              </div>
              <div className='text-2xl font-serif font-bold text-white'>
                {statusText}
              </div>
            </div>
            <div className='flex flex-col items-center gap-2 hover-card p-2 border border-transparent'>
              <div className='text-xs font-bold uppercase tracking-widest text-gray-500'>
                {copy.ends_label}
              </div>
              <div className='text-2xl font-serif font-bold text-white'>
                {endDateText}
              </div>
            </div>
          </div>

          <button
            onClick={onJoin}
            className='w-full md:w-auto px-16 py-4 btn-gold flex items-center justify-center gap-3 mx-auto'>
            <Zap size={18} /> {copy.cta}
          </button>

          <button
            onClick={onClose}
            className='mt-6 text-xs text-gray-600 font-sans hover:text-white transition-colors uppercase tracking-widest'>
            {copy.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
