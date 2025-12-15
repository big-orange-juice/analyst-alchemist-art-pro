'use client';

import { useMemo } from 'react';
import { Save } from 'lucide-react';
import MarkdownIt from 'markdown-it';
import { useLanguage } from '@/lib/useLanguage';

type Props = {
  isLoading: boolean;
  output: string;
};

export default function CapabilityOutputPanel({ isLoading, output }: Props) {
  const { t } = useLanguage();

  const md = useMemo(() => new MarkdownIt({ linkify: true, breaks: true }), []);
  const renderedOutput = useMemo(() => md.render(output || ''), [md, output]);

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
          <button className='px-6 py-3 btn-outline text-xs flex items-center gap-2'>
            <Save size={16} /> {t('capability_modal.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
