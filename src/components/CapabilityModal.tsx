'use client';

import React, { useState } from 'react';
import { X, Cpu, Play, RotateCcw, Save } from 'lucide-react';
import {
  AgentCapability,
  AGENT_CAPABILITY_DETAILS,
  AppNotification,
  CapabilityHistoryEntry
} from '@/types';
import { useLanguage } from '@/lib/useLanguage';

interface CapabilityModalProps {
  capability: AgentCapability;
  customPrompt?: string;
  onClose: () => void;
  onNotify?: (
    title: string,
    message: string,
    type: AppNotification['type']
  ) => void;
}

export default function CapabilityModal({
  capability,
  onClose
}: CapabilityModalProps) {
  const { t, dictionary } = useLanguage();
  const details = AGENT_CAPABILITY_DETAILS[capability];
  const label = t(details.labelKey);
  const role = t(details.roleKey);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const historyEntries =
    (dictionary.capability_history?.[capability] as CapabilityHistoryEntry[]) ||
    [];

  const handleExecute = () => {
    setIsLoading(true);
    setTimeout(() => {
      setOutput(t('capability_modal.mock_response'));
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/80 p-4 modal-animate'>
      <div className='w-full md:max-w-6xl h-[85vh] glass-panel border border-white/[0.02] flex flex-col shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 bg-white/[0.02] border-b border-white/[0.02] shrink-0'>
          <div className='flex items-center gap-4'>
            <div className='w-10 h-10 border border-white/[0.02] flex items-center justify-center text-cp-yellow bg-white/[0.02]'>
              <Cpu size={20} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className='text-xl font-bold font-serif tracking-wide uppercase text-white'>
                {label} {t('capability_modal.module')}
              </h2>
              <p className='text-xs text-cp-text-muted font-sans mt-0.5'>
                {t('capability_modal.role')} {role}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-white transition-colors'>
            <X size={24} />
          </button>
        </div>

        <div className='flex-1 flex flex-col md:flex-row overflow-hidden bg-transparent'>
          {/* Input */}
          <div className='w-full md:w-1/3 border-b md:border-b-0 md:border-r border-white/[0.02] p-6 flex flex-col bg-white/[0.02] hover-card m-2'>
            <label className='text-cp-text-muted text-xs font-bold uppercase tracking-widest mb-4 block'>
              {t('capability_modal.input_label')}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className='flex-1 bg-black/20 border border-white/[0.02] p-4 text-cp-text font-mono text-sm focus:border-cp-yellow focus:outline-none resize-none mb-6 hover-card'
              placeholder={t('capability_modal.input_placeholder')}
            />
            <button
              onClick={handleExecute}
              disabled={isLoading}
              className='w-full py-4 btn-gold flex items-center justify-center gap-2 disabled:opacity-50'>
              {isLoading ? (
                <RotateCcw className='animate-spin' size={18} />
              ) : (
                <Play size={18} />
              )}
              {t('capability_modal.execute')}
            </button>
          </div>

          {/* Output */}
          <div className='flex-1 p-8 flex flex-col bg-transparent gap-6'>
            <div className='flex-1 flex flex-col'>
              <label className='text-cp-text-muted text-xs font-bold uppercase tracking-widest mb-4 block'>
                {t('capability_modal.output_label')}
              </label>
              <div className='flex-1 border border-cp-border bg-cp-dark/20 p-6 font-mono text-sm text-cp-text overflow-y-auto custom-scrollbar leading-relaxed hover-card'>
                {output ? (
                  output
                ) : (
                  <span className='text-gray-600 italic'>
                    {t('capability_modal.waiting')}
                  </span>
                )}
              </div>
              <div className='mt-6 flex justify-end'>
                <button className='px-6 py-3 btn-outline text-xs flex items-center gap-2'>
                  <Save size={16} /> {t('capability_modal.save')}
                </button>
              </div>
            </div>

            <div className='border border-cp-border/60 bg-cp-dark/20 p-4'>
              <div className='flex items-center justify-between mb-3'>
                <span className='type-eyebrow text-cp-text'>
                  {t('capability_modal.history_title')}
                </span>
                <span className='type-caption text-cp-yellow'>
                  {t('capability_modal.history_latency')}
                </span>
              </div>
              {historyEntries.length ? (
                <div className='space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1'>
                  {historyEntries.map((entry, idx) => (
                    <div
                      key={`${entry.time}-${idx}`}
                      className='border border-cp-border/40 bg-cp-black/40 p-3 transition-colors hover:border-cp-yellow/60'>
                      <div className='flex items-center justify-between text-[11px] type-mono text-cp-text-muted'>
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
                  ))}
                </div>
              ) : (
                <div className='text-cp-text-muted text-sm font-mono'>
                  {t('capability_modal.history_empty')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
