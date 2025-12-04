'use client';

import React from 'react';
import { X, FileText, Share2, Printer } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';

interface ArticleModalProps {
  article: { title: string; date: string; tag: string } | null;
  onClose: () => void;
}

export default function ArticleModal({ article, onClose }: ArticleModalProps) {
  if (!article) return null;
  const { dictionary } = useLanguage();
  const copy = dictionary.article_modal;
  const sectorText =
    article.tag === '行业' ? copy.sector_semiconductor : copy.sector_macro;

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md bg-black/80 p-4 modal-animate'>
      <div className='w-full max-w-3xl h-[80vh] glass-panel border border-white/[0.02] flex flex-col shadow-2xl relative'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-white/[0.02] bg-white/[0.02] shrink-0'>
          <div className='flex items-center gap-3'>
            <FileText className='text-cp-yellow' size={20} strokeWidth={1.5} />
            <span className='font-bold font-serif text-white uppercase tracking-wider'>
              {copy.title}
            </span>
          </div>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-white transition-colors'>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className='p-8 md:p-12 overflow-y-auto custom-scrollbar bg-transparent flex-1'>
          <h1 className='text-3xl md:text-4xl font-serif font-bold text-white mb-6 leading-tight hover-card p-2 border border-transparent'>
            {article.title}
          </h1>

          <div className='flex items-center gap-6 text-xs font-sans uppercase tracking-widest text-cp-text-muted mb-10 border-b border-white/[0.02] pb-6 hover-card p-2 border border-transparent'>
            <span>{article.date}</span>
            <span>
              {copy.tag_label} {article.tag}
            </span>
            <span>{copy.author_value}</span>
          </div>

          <div className='prose prose-invert prose-sm max-w-none font-serif text-cp-text-muted leading-loose'>
            <div className='hover-card p-4 border border-transparent'>
              <p className='first-letter:text-4xl first-letter:font-bold first-letter:text-cp-yellow first-letter:float-left first-letter:mr-2'>
                {copy.intro_line_one.replace('{sector}', sectorText)}
                {copy.intro_line_two}
              </p>
            </div>
            <h3 className='text-white font-bold mt-8 mb-4'>
              {copy.core_title}
            </h3>
            <div className='hover-card p-4 border border-transparent'>
              <p>{copy.core_body}</p>
            </div>
            <div className='my-8 p-6 border border-white/[0.02] bg-white/[0.02] text-center font-mono text-xs hover-card'>
              {copy.chart_label}
            </div>
            <h3 className='text-white font-bold mt-8 mb-4'>
              {copy.risk_title}
            </h3>
            <ul className='list-disc pl-4 space-y-2 hover-card p-4 border border-transparent'>
              <li>{copy.risk_one}</li>
              <li>{copy.risk_two}</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className='p-4 border-t border-white/[0.02] bg-white/[0.02] flex justify-end gap-4'>
          <button className='px-6 py-2 btn-outline text-xs flex items-center gap-2'>
            <Printer size={14} /> {copy.print}
          </button>
          <button className='px-6 py-2 btn-gold text-xs flex items-center gap-2'>
            <Share2 size={14} /> {copy.share}
          </button>
        </div>
      </div>
    </div>
  );
}
