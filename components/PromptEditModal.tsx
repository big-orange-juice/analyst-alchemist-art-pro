'use client';

import React, { useState } from 'react';
import { Save, X, Settings, RotateCcw } from 'lucide-react';
import { AgentCapability, AGENT_CAPABILITY_DETAILS } from '@/types';
import { useLanguage } from '@/lib/useLanguage';

interface PromptEditModalProps {
  capability: AgentCapability;
  initialPrompt: string;
  onSave: (newPrompt: string) => void;
  onClose: () => void;
}

export default function PromptEditModal({
  capability,
  initialPrompt,
  onSave,
  onClose
}: PromptEditModalProps) {
  const { t } = useLanguage();
  const details = AGENT_CAPABILITY_DETAILS[capability];
  const role = t(details.roleKey);
  const [prompt, setPrompt] = useState(initialPrompt);

  return (
    <div className='fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-md bg-black/80 p-4 modal-animate'>
      <div className='w-full max-w-4xl glass-panel border border-white/[0.02] flex flex-col shadow-2xl h-[70vh]'>
        <div className='flex items-center justify-between p-6 bg-white/[0.02] border-b border-white/[0.02] shrink-0'>
          <div className='flex items-center gap-3 text-cp-yellow'>
            <Settings size={20} strokeWidth={1.5} />
            <span className='font-bold font-serif tracking-wide uppercase text-lg'>
              {t('prompt_modal.title')} / {role}
            </span>
          </div>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-white transition-colors'>
            <X size={24} />
          </button>
        </div>

        <div className='flex-1 p-8 flex flex-col bg-transparent overflow-hidden'>
          <div className='flex-1 flex flex-col relative border border-white/[0.02] bg-white/[0.02] p-6 hover-card'>
            <label className='block text-cp-text-muted text-xs font-bold mb-4 uppercase tracking-widest'>
              {t('prompt_modal.label')}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className='flex-1 bg-transparent border-none outline-none text-cp-text font-mono text-sm leading-relaxed resize-none custom-scrollbar'
              placeholder={t('prompt_modal.placeholder')}
            />
          </div>

          <div className='flex justify-between items-center pt-6 mt-6 border-t border-white/[0.02] shrink-0'>
            <button
              onClick={() => setPrompt('')}
              className='flex items-center gap-2 text-xs text-gray-500 hover:text-cp-yellow transition-colors uppercase font-bold tracking-widest'>
              <RotateCcw size={14} /> {t('prompt_modal.reset')}
            </button>

            <div className='flex gap-4'>
              <button
                onClick={onClose}
                className='px-6 py-3 btn-outline text-xs'>
                {t('common.cancel')}
              </button>
              <button
                onClick={() => onSave(prompt)}
                className='px-8 py-3 btn-gold text-xs flex items-center gap-2'>
                <Save size={16} /> {t('prompt_modal.save')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
