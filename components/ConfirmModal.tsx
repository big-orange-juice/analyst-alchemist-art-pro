'use client';

import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-xl modal-animate'>
      <div className='w-full max-w-md glass-panel border-2 border-cp-yellow ring-2 ring-cp-yellow shadow-[0_0_30px_rgba(212,175,55,0.1)] p-6 relative cp-clip'>
        <div className='flex items-center gap-3 mb-4 text-cp-yellow'>
          <AlertTriangle size={24} />
          <h3 className='text-lg font-bold font-oxanium uppercase tracking-wider'>
            {title}
          </h3>
        </div>

        <p className='text-cp-text font-mono text-sm leading-relaxed mb-8 whitespace-pre-wrap hover-card p-4 border border-cp-border bg-white/[0.02]'>
          {message}
        </p>

        <div className='flex gap-4 justify-end'>
          <button
            onClick={onCancel}
            className='px-6 py-2 border border-cp-border text-cp-text-muted hover:text-cp-text hover:border-cp-yellow font-bold font-oxanium uppercase text-sm transition-colors'>
            <span className='flex items-center gap-2'>
              <X size={16} /> {t('common.cancel')}
            </span>
          </button>
          <button
            onClick={onConfirm}
            className='px-6 py-2 btn-gold font-bold font-oxanium uppercase text-sm transition-colors cp-clip-button'>
            <span className='flex items-center gap-2'>
              <Check size={16} /> {t('confirm_modal.execute')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
