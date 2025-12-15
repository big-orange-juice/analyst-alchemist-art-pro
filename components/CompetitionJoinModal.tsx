'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  onJoin: (payload: {
    activity_id: string;
    cycle: number;
  }) => Promise<void> | void;
  activity?: StockActivity | null;
}

export default function CompetitionJoinModal({
  isOpen,
  onClose,
  onJoin,
  activity
}: CompetitionJoinModalProps) {
  const { t } = useLanguage();
  const tt = (key: string) => t(`competition_join.${key}`);
  const tp = (key: string) => t(`stock_activity_task_params.${key}`);

  const [activityId, setActivityId] = useState(
    activity?.id != null ? String(activity.id) : ''
  );
  const [cycle, setCycle] = useState<number>(5);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen) return;
    setActivityId(activity?.id != null ? String(activity.id) : '');
    setCycle(5);
    setTouched({});
    setIsSubmitting(false);
  }, [activity?.id, isOpen]);

  const errors = useMemo(() => {
    const next: Record<string, string> = {};
    if (!activityId.trim()) next.activity_id = tp('error_required');
    if (!Number.isFinite(cycle)) next.cycle = tp('error_required');
    if (Number.isFinite(cycle) && cycle < 5) next.cycle = tp('error_cycle_min');
    return next;
  }, [activityId, cycle, tp]);

  const canSubmit = Object.keys(errors).length === 0 && !isSubmitting;

  const statusText = activity?.status || tt('participants_value');

  const activityIndexText =
    typeof activity?.index_sort === 'number'
      ? `#${activity.index_sort}`
      : tt('rank_value');

  const endDateText = activity?.end_date || tt('ends_value');

  if (!isOpen) return null;

  const requiredMark = (
    <span className='text-cp-red text-xs align-middle ml-1'>*</span>
  );

  const markTouched = (key: string) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const fieldError = (key: string) =>
    touched[key] && errors[key] ? (
      <div className='text-cp-red text-xs mt-1'>{errors[key]}</div>
    ) : null;

  const handleSubmit = async () => {
    setTouched({ cycle: true });
    if (!canSubmit) return;

    const payload = {
      activity_id: activityId.trim(),
      cycle: Number(cycle)
    };

    setIsSubmitting(true);
    try {
      await onJoin(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-xl p-4 modal-animate'>
      <div className='w-full max-w-3xl max-h-[85vh] glass-panel border-2 border-cp-yellow ring-1 ring-cp-yellow shadow-2xl flex flex-col relative overflow-hidden'>
        <button
          onClick={onClose}
          className='absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-10'>
          <X size={24} />
        </button>

        <div className='flex-1 overflow-y-auto custom-scrollbar p-10 md:p-14'>
          <div className='text-center'>
            <div className='mb-6 inline-flex items-center justify-center w-16 h-16 border border-cp-yellow/50 bg-white/[0.02] hover-card'>
              <Trophy size={32} className='text-cp-yellow' strokeWidth={1} />
            </div>

            <h2 className='text-3xl md:text-5xl font-serif font-bold text-white mb-4'>
              {tt('title')}
            </h2>
            <p className='text-cp-text-muted font-sans font-light text-lg mb-12 max-w-lg mx-auto'>
              {activity?.activity_name
                ? `${tt('description')} (${activity.activity_name})`
                : tt('description')}
            </p>

            <div className='grid grid-cols-3 gap-6 mb-12 border-t border-b border-cp-border py-8'>
              <div className='flex flex-col items-center gap-2 hover-card p-2 border border-transparent'>
                <div className='text-xs font-bold uppercase tracking-widest text-gray-500'>
                  {tt('rank_label')}
                </div>
                <div className='text-2xl font-serif font-bold text-cp-yellow'>
                  {activityIndexText}
                </div>
              </div>
              <div className='flex flex-col items-center gap-2 border-l border-r border-cp-border hover-card p-2 border-y-transparent'>
                <div className='text-xs font-bold uppercase tracking-widest text-gray-500'>
                  {tt('participants_label')}
                </div>
                <div className='text-2xl font-serif font-bold text-white'>
                  {statusText}
                </div>
              </div>
              <div className='flex flex-col items-center gap-2 hover-card p-2 border border-transparent'>
                <div className='text-xs font-bold uppercase tracking-widest text-gray-500'>
                  {tt('ends_label')}
                </div>
                <div className='text-2xl font-serif font-bold text-white'>
                  {endDateText}
                </div>
              </div>
            </div>

            <div className='text-left'>
              <div className='flex items-center justify-between mb-4'>
                <label className='text-cp-text-muted text-xs font-bold uppercase tracking-widest block'>
                  {tp('title')}
                </label>
                <span className='text-[11px] text-cp-text-muted tracking-widest'>
                  {tp('required_hint')}
                </span>
              </div>

              {!activityId.trim() ? (
                <div className='mb-4 text-cp-red text-xs'>
                  {tp('missing_ids')}
                </div>
              ) : null}

              <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <div>
                  <label className='block text-cp-text-muted text-[11px] font-bold uppercase tracking-widest'>
                    {tp('cycle_label')}
                    {requiredMark}
                  </label>
                  <input
                    type='number'
                    value={Number.isFinite(cycle) ? cycle : 0}
                    onChange={(e) => setCycle(Number(e.target.value))}
                    onBlur={() => markTouched('cycle')}
                    min={5}
                    className='w-full mt-2 px-4 py-3 bg-transparent border border-cp-border text-cp-text outline-none font-mono text-sm'
                    placeholder={tp('cycle_ph')}
                  />
                  {fieldError('cycle')}
                </div>
              </div>

              <div className='mt-10 flex items-center justify-center gap-4'>
                <button
                  type='button'
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className='px-16 py-4 btn-gold text-xs flex items-center justify-center gap-3 disabled:opacity-50'>
                  <Zap size={18} />{' '}
                  {isSubmitting ? t('capability_modal.loading') : tt('cta')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
