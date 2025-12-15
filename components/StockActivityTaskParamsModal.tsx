'use client';

import React, { useMemo, useState } from 'react';
import { X, Send } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';

export type StockActivityTaskPayload = {
  activity_id: string;
  cycle: number;
  agent_id?: string;
  stock_pool?: string[];
  industry?: string;
  theme?: string;
  user_custom_input?: string;
  need_llm_analysis?: boolean;
  stock_pool_limit?: number;
  initial_cash?: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialValue: Partial<StockActivityTaskPayload>;
  onSubmit: (payload: StockActivityTaskPayload) => Promise<void> | void;
};

const parseStockPool = (raw: string) => {
  return raw
    .split(/\r?\n|,|，|;|；/g)
    .map((s) => s.trim())
    .filter(Boolean);
};

export default function StockActivityTaskParamsModal({
  isOpen,
  onClose,
  initialValue,
  onSubmit
}: Props) {
  const { t } = useLanguage();
  const tt = (key: string) => t(`stock_activity_task_params.${key}`);

  const [activityId, setActivityId] = useState(initialValue.activity_id || '');
  const [agentId, setAgentId] = useState(initialValue.agent_id || '');
  const [cycle, setCycle] = useState<number>(
    typeof initialValue.cycle === 'number' ? initialValue.cycle : 0
  );

  const [stockPoolRaw, setStockPoolRaw] = useState(
    Array.isArray(initialValue.stock_pool)
      ? initialValue.stock_pool.join('\n')
      : ''
  );
  const [industry, setIndustry] = useState(initialValue.industry || '');
  const [theme, setTheme] = useState(initialValue.theme || '');
  const [userCustomInput, setUserCustomInput] = useState(
    initialValue.user_custom_input || ''
  );
  const [needLlmAnalysis, setNeedLlmAnalysis] = useState(
    Boolean(initialValue.need_llm_analysis)
  );
  const [stockPoolLimit, setStockPoolLimit] = useState<number>(
    typeof initialValue.stock_pool_limit === 'number'
      ? initialValue.stock_pool_limit
      : 10
  );
  const [initialCash, setInitialCash] = useState<number>(
    typeof initialValue.initial_cash === 'number'
      ? initialValue.initial_cash
      : 0
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = useMemo(() => {
    const next: Record<string, string> = {};
    if (!activityId.trim()) next.activity_id = tt('error_required');
    if (!agentId.trim()) next.agent_id = tt('error_required');
    if (!Number.isFinite(cycle)) next.cycle = tt('error_required');
    return next;
  }, [activityId, agentId, cycle, tt]);

  const canSubmit = Object.keys(errors).length === 0 && !isSubmitting;

  if (!isOpen) return null;

  const markTouched = (key: string) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const handleSubmit = async () => {
    setTouched({ activity_id: true, agent_id: true, cycle: true });
    if (!canSubmit) return;

    const payload: StockActivityTaskPayload = {
      activity_id: activityId.trim(),
      agent_id: agentId.trim(),
      cycle: Number(cycle),
      stock_pool: parseStockPool(stockPoolRaw),
      industry: industry.trim(),
      theme: theme.trim(),
      user_custom_input: userCustomInput.trim(),
      need_llm_analysis: Boolean(needLlmAnalysis),
      stock_pool_limit: Number(stockPoolLimit) || 0,
      initial_cash: Number(initialCash) || 0
    };

    setIsSubmitting(true);
    try {
      await onSubmit(payload);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const requiredMark = (
    <span className='text-cp-red text-xs align-middle ml-1'>*</span>
  );

  const fieldError = (key: string) =>
    touched[key] && errors[key] ? (
      <div className='text-cp-red text-xs mt-1'>{errors[key]}</div>
    ) : null;

  return (
    <div className='fixed inset-0 z-[160] flex items-center justify-center bg-black/70 backdrop-blur-xl p-4 modal-animate'>
      <div className='w-full max-w-3xl glass-panel border-2 border-cp-yellow ring-1 ring-cp-yellow shadow-2xl flex flex-col relative'>
        <button
          type='button'
          onClick={onClose}
          className='absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-10'
          aria-label={t('common.close')}>
          <X size={24} />
        </button>

        <div className='p-10 md:p-12'>
          <div className='flex items-start justify-between gap-6 mb-8'>
            <div>
              <h2 className='text-2xl md:text-3xl font-serif font-bold text-white mb-2'>
                {tt('title')}
              </h2>
              <div className='text-xs text-cp-text-muted font-mono tracking-widest'>
                {tt('subtitle')}
              </div>
              <div className='text-xs text-cp-text-muted mt-2'>
                {tt('required_hint')}
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
            <div>
              <label className='block text-cp-text-muted text-[11px] font-bold uppercase tracking-widest'>
                {tt('activity_id_label')}
                {requiredMark}
              </label>
              <input
                value={activityId}
                onChange={(e) => setActivityId(e.target.value)}
                onBlur={() => markTouched('activity_id')}
                className='w-full mt-2 px-4 py-3 bg-transparent border border-cp-border text-cp-text outline-none font-mono text-sm'
                placeholder={tt('activity_id_ph')}
              />
              {fieldError('activity_id')}
            </div>

            <div>
              <label className='block text-cp-text-muted text-[11px] font-bold uppercase tracking-widest'>
                {tt('agent_id_label')}
                {requiredMark}
              </label>
              <input
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                onBlur={() => markTouched('agent_id')}
                className='w-full mt-2 px-4 py-3 bg-transparent border border-cp-border text-cp-text outline-none font-mono text-sm'
                placeholder={tt('agent_id_ph')}
              />
              {fieldError('agent_id')}
            </div>

            <div>
              <label className='block text-cp-text-muted text-[11px] font-bold uppercase tracking-widest'>
                {tt('cycle_label')}
                {requiredMark}
              </label>
              <input
                type='number'
                value={Number.isFinite(cycle) ? cycle : 0}
                onChange={(e) => setCycle(Number(e.target.value))}
                onBlur={() => markTouched('cycle')}
                className='w-full mt-2 px-4 py-3 bg-transparent border border-cp-border text-cp-text outline-none font-mono text-sm'
                placeholder={tt('cycle_ph')}
              />
              {fieldError('cycle')}
            </div>

            <div>
              <label className='block text-cp-text-muted text-[11px] font-bold uppercase tracking-widest'>
                {tt('stock_pool_limit_label')}
              </label>
              <input
                type='number'
                value={stockPoolLimit}
                onChange={(e) => setStockPoolLimit(Number(e.target.value))}
                className='w-full mt-2 px-4 py-3 bg-transparent border border-cp-border text-cp-text outline-none font-mono text-sm'
                placeholder={tt('stock_pool_limit_ph')}
              />
            </div>

            <div className='md:col-span-2'>
              <label className='block text-cp-text-muted text-[11px] font-bold uppercase tracking-widest'>
                {tt('stock_pool_label')}
              </label>
              <textarea
                value={stockPoolRaw}
                onChange={(e) => setStockPoolRaw(e.target.value)}
                className='w-full mt-2 min-h-[90px] px-4 py-3 bg-transparent border border-cp-border text-cp-text outline-none font-mono text-sm resize-y custom-scrollbar'
                placeholder={tt('stock_pool_ph')}
              />
            </div>

            <div>
              <label className='block text-cp-text-muted text-[11px] font-bold uppercase tracking-widest'>
                {tt('industry_label')}
              </label>
              <input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className='w-full mt-2 px-4 py-3 bg-transparent border border-cp-border text-cp-text outline-none font-mono text-sm'
                placeholder={tt('industry_ph')}
              />
            </div>

            <div>
              <label className='block text-cp-text-muted text-[11px] font-bold uppercase tracking-widest'>
                {tt('theme_label')}
              </label>
              <input
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className='w-full mt-2 px-4 py-3 bg-transparent border border-cp-border text-cp-text outline-none font-mono text-sm'
                placeholder={tt('theme_ph')}
              />
            </div>

            <div className='md:col-span-2'>
              <label className='block text-cp-text-muted text-[11px] font-bold uppercase tracking-widest'>
                {tt('user_custom_input_label')}
              </label>
              <textarea
                value={userCustomInput}
                onChange={(e) => setUserCustomInput(e.target.value)}
                className='w-full mt-2 min-h-[90px] px-4 py-3 bg-transparent border border-cp-border text-cp-text outline-none font-mono text-sm resize-y custom-scrollbar'
                placeholder={tt('user_custom_input_ph')}
              />
            </div>

            <div className='flex items-center gap-3 md:col-span-2'>
              <input
                id='need-llm'
                type='checkbox'
                checked={needLlmAnalysis}
                onChange={(e) => setNeedLlmAnalysis(e.target.checked)}
                className='accent-cp-yellow'
              />
              <label
                htmlFor='need-llm'
                className='text-cp-text-muted text-xs font-bold uppercase tracking-widest'>
                {tt('need_llm_analysis_label')}
              </label>
            </div>

            <div>
              <label className='block text-cp-text-muted text-[11px] font-bold uppercase tracking-widest'>
                {tt('initial_cash_label')}
              </label>
              <input
                type='number'
                value={initialCash}
                onChange={(e) => setInitialCash(Number(e.target.value))}
                className='w-full mt-2 px-4 py-3 bg-transparent border border-cp-border text-cp-text outline-none font-mono text-sm'
                placeholder={tt('initial_cash_ph')}
              />
            </div>
          </div>

          <div className='mt-10 flex items-center justify-end gap-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-6 py-3 btn-outline text-xs'>
              {t('common.cancel')}
            </button>
            <button
              type='button'
              onClick={handleSubmit}
              disabled={!canSubmit}
              className='px-8 py-3 btn-gold text-xs flex items-center gap-2 disabled:opacity-50'>
              <Send size={14} />
              {isSubmitting ? t('capability_modal.loading') : tt('submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
