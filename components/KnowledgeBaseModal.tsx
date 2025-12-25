'use client';

import React, { useMemo, useRef, useState } from 'react';
import { X, Upload, FileText, Trash2 } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';
import { apiFetch, ApiError } from '@/lib/http';

type Props = {
  scenario: string;
  userId?: string | null;
  onClose: () => void;
  onNotify?: (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info'
  ) => void;
};

export default function KnowledgeBaseModal({
  scenario,
  userId,
  onClose,
  onNotify
}: Props) {
  const { t } = useLanguage();
  const tt = (key: string) => t(`agent_party.${key}`);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const resolvedScenario = useMemo(
    () => String(scenario || '').trim(),
    [scenario]
  );

  const handlePickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const handleUpload = async () => {
    if (!userId) {
      onNotify?.(
        tt('knowledge_title'),
        t('create_agent_modal.notify_missing_user_desc') || '请先登录',
        'warning'
      );
      return;
    }
    if (!resolvedScenario) {
      onNotify?.(
        tt('knowledge_title'),
        tt('knowledge_missing_scenario'),
        'warning'
      );
      return;
    }
    if (!file) {
      onNotify?.(
        tt('knowledge_title'),
        tt('knowledge_missing_file'),
        'warning'
      );
      return;
    }

    const fd = new FormData();
    fd.append('file', file);
    fd.append('scenario', resolvedScenario);

    setIsUploading(true);
    try {
      const res = await apiFetch<string>('/api/knowledge-graph/upload', {
        method: 'POST',
        body: fd,
        errorHandling: 'ignore'
      });

      // contract: API returns a string; we don't cache it locally
      void res;
      onNotify?.(
        tt('knowledge_upload_ok_title'),
        tt('knowledge_upload_ok_desc'),
        'success'
      );
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : tt('knowledge_upload_failed_desc');
      onNotify?.(tt('knowledge_upload_failed_title'), message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='fixed inset-0 z-[120] bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 modal-animate'>
      <div className='w-full md:max-w-4xl h-[80vh] glass-panel border-2 border-cp-yellow ring-1 ring-cp-yellow flex flex-col shadow-2xl relative'>
        <div className='flex justify-between items-center p-6 border-b border-cp-border bg-white/[0.02] shrink-0'>
          <div>
            <h2 className='text-xl font-bold font-serif text-white tracking-wide'>
              {tt('knowledge_title')}
            </h2>
            <p className='text-xs text-cp-text-muted mt-1'>
              {tt('knowledge_desc')}
            </p>
            <p className='text-[11px] text-cp-text-muted mt-2'>
              {tt('knowledge_scenario')}:{' '}
              <span className='text-white font-mono'>
                {resolvedScenario || '-'}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-cp-yellow transition-colors'>
            <X size={24} />
          </button>
        </div>

        <div className='flex-1 min-h-0 p-6 overflow-y-auto custom-scrollbar space-y-6'>
          <div className='border border-cp-border bg-cp-black/40 p-4'>
            <div className='text-xs text-cp-text-muted font-bold uppercase tracking-widest mb-3'>
              {tt('knowledge_current')}
            </div>
            <div className='text-sm text-cp-text-muted'>
              {tt('knowledge_empty')}
            </div>
          </div>

          <div className='border border-cp-border bg-cp-black/40 p-4'>
            <div className='text-xs text-cp-text-muted font-bold uppercase tracking-widest mb-3'>
              {tt('knowledge_upload')}
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className='border-2 border-dashed border-cp-border hover:border-cp-yellow bg-cp-dark/10 hover:bg-cp-dark/30 transition-all cursor-pointer flex flex-col items-center justify-center p-10 group'>
              <input
                type='file'
                ref={fileInputRef}
                onChange={handlePickFile}
                className='hidden'
              />
              <div className='w-14 h-14 bg-cp-black border border-cp-border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform'>
                <Upload
                  size={22}
                  className='text-cp-text-muted group-hover:text-cp-yellow'
                />
              </div>
              <div className='text-sm font-bold text-cp-text mb-1'>
                {tt('knowledge_upload_title')}
              </div>
              <div className='text-xs text-cp-text-muted'>
                {tt('knowledge_upload_desc')}
              </div>
              <div className='text-xs text-cp-text-muted mt-3'>
                {tt('knowledge_overwrite_tip')}
              </div>
            </div>

            {file && (
              <div className='mt-4 border border-cp-border bg-cp-black p-3 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <FileText size={16} className='text-cp-yellow' />
                  <span className='text-sm text-cp-text'>{file.name}</span>
                  <span className='text-xs text-cp-text-muted'>
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  type='button'
                  onClick={() => setFile(null)}
                  className='text-cp-text-muted hover:text-cp-red transition-colors'>
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className='shrink-0 border-t border-cp-border bg-white/[0.02] p-6 flex justify-end gap-4'>
          <button onClick={onClose} className='px-8 py-3 btn-outline'>
            {t('common.close') || '关闭'}
          </button>
          <button
            onClick={() => void handleUpload()}
            disabled={isUploading || !file || !resolvedScenario}
            className='px-10 py-3 btn-gold disabled:opacity-50 disabled:cursor-not-allowed'>
            {isUploading
              ? t('common.loading') || '上传中...'
              : tt('knowledge_upload_action')}
          </button>
        </div>
      </div>
    </div>
  );
}
