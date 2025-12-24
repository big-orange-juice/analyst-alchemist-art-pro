'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Copy } from 'lucide-react';
import MarkdownIt from 'markdown-it';
import { useLanguage } from '@/lib/useLanguage';
import { copyToClipboard } from '@/lib/clipboard';

type Props = {
  isLoading: boolean;
  output: string;
};

export default function CapabilityOutputPanel({ isLoading, output }: Props) {
  const { t } = useLanguage();

  const [copyStatus, setCopyStatus] = useState<'idle' | 'ok' | 'fail'>('idle');
  const resetTimerRef = useRef<number | null>(null);

  const md = useMemo(() => new MarkdownIt({ linkify: true, breaks: true }), []);
  const renderedOutput = useMemo(() => md.render(output || ''), [md, output]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current != null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    const value = output || '';
    if (!value.trim()) return;

    const ok = await copyToClipboard(value);
    setCopyStatus(ok ? 'ok' : 'fail');

    if (resetTimerRef.current != null) {
      window.clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = window.setTimeout(
      () => setCopyStatus('idle'),
      1200
    );
  };

  return (
    <div className='flex-1 p-8 flex flex-col bg-transparent gap-6 min-h-0'>
      <div className='flex-1 flex flex-col min-h-0'>
        <div className='flex items-center justify-between mb-4'>
          <label className='text-cp-text-muted text-xs font-bold uppercase tracking-widest block'>
            {t('capability_modal.output_label')}
          </label>
          {isLoading && (
            <span className='text-[11px] text-cp-yellow tracking-widest'>
              {t('capability_modal.loading') || '执行中...'}
            </span>
          )}
        </div>

        <div className='relative flex-1 min-h-0 border border-cp-border bg-cp-dark/20 p-6 font-sans text-sm text-cp-text overflow-y-auto custom-scrollbar leading-relaxed hover-card'>
          {isLoading ? (
            <div className='space-y-3 animate-pulse'>
              <div className='h-4 bg-white/10 rounded w-1/3' />
              <div className='h-4 bg-white/10 rounded w-2/3' />
              <div className='h-4 bg-white/10 rounded w-5/6' />
              <div className='h-4 bg-white/10 rounded w-4/5' />
            </div>
          ) : output ? (
            <div
              className={[
                'max-w-none',
                // Headings
                '[&_h1]:text-lg [&_h1]:font-serif [&_h1]:tracking-widest [&_h1]:text-cp-yellow [&_h1]:uppercase [&_h1]:mb-4',
                '[&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-serif [&_h2]:tracking-wide [&_h2]:text-white [&_h2]:mb-3',
                // Paragraphs
                '[&_p]:text-sm [&_p]:text-cp-text-muted [&_p]:leading-relaxed [&_p]:my-2',
                // Lists
                '[&_ul]:my-3 [&_ul]:pl-5 [&_ul]:list-disc',
                '[&_ol]:my-3 [&_ol]:pl-5 [&_ol]:list-decimal',
                '[&_li]:text-sm [&_li]:text-cp-text [&_li]:my-1',
                // Inline emphasis
                '[&_strong]:text-cp-yellow [&_strong]:font-semibold',
                '[&_em]:text-cp-text-muted',
                // Links
                '[&_a]:text-cp-yellow [&_a]:underline [&_a:hover]:opacity-90',
                // Code blocks
                '[&_code]:text-cp-yellow [&_code]:font-mono',
                '[&_pre]:bg-black/40 [&_pre]:text-white [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-cp-border',
                // Blockquotes
                '[&_blockquote]:border-l-2 [&_blockquote]:border-cp-border [&_blockquote]:pl-4 [&_blockquote]:text-cp-text-muted'
              ].join(' ')}
              dangerouslySetInnerHTML={{ __html: renderedOutput }}
            />
          ) : (
            <span className='text-gray-600 italic'>
              {t('capability_modal.waiting')}
            </span>
          )}
        </div>

        <div className='mt-6 flex justify-end'>
          <div className='flex items-center gap-3'>
            <button
              type='button'
              onClick={handleCopy}
              disabled={isLoading || !output.trim()}
              className='px-6 py-3 btn-outline text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
              aria-label={t('common.copy')}>
              <Copy size={16} />
              {copyStatus === 'ok'
                ? t('common.copied')
                : copyStatus === 'fail'
                ? t('common.copy_failed')
                : t('common.copy')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
