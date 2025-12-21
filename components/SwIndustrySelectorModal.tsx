'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { apiFetch } from '@/lib/http';
import { useLanguage } from '@/lib/useLanguage';

export type SwIndustry = {
  index_code: string;
  industry_name: string;
  level: string;
  industry_code: string;
  is_pub: string;
  parent_code: string;
  src: string;
};

type SwIndustriesResponse = {
  page: number;
  page_size: number;
  total: number;
  items: SwIndustry[];
};

type Props = {
  open: boolean;
  multiple?: boolean;
  value?: SwIndustry[];
  onClose: () => void;
  onConfirm: (selected: SwIndustry[]) => void;
};

const PAGE_SIZE_OPTIONS = [50, 80, 100, 200] as const;

export default function SwIndustrySelectorModal({
  open,
  multiple = false,
  value = [],
  onClose,
  onConfirm
}: Props) {
  const { t } = useLanguage();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<(typeof PAGE_SIZE_OPTIONS)[number]>(50);
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<SwIndustry[]>([]);

  const [selectedMap, setSelectedMap] = useState<Record<string, SwIndustry>>(
    {}
  );

  const wasOpenRef = useRef(false);

  useEffect(() => {
    // Only initialize from `value` when opening.
    // Parent rerenders often create a new array reference for `value`, which
    // would otherwise reset in-progress selections.
    if (open && !wasOpenRef.current) {
      const next: Record<string, SwIndustry> = {};
      for (const it of value) {
        if (it?.industry_code) next[it.industry_code] = it;
      }
      setSelectedMap(next);
      setPage(1);
      setPageSize(50);
      setKeyword('');
      setAppliedKeyword('');
    }

    wasOpenRef.current = open;
  }, [open, value]);

  const totalPages = useMemo(() => {
    const safeSize = pageSize || 50;
    return Math.max(1, Math.ceil(total / safeSize));
  }, [pageSize, total]);

  useEffect(() => {
    if (!open) return;

    let aborted = false;
    setLoading(true);
    setError(null);

    const qs = new URLSearchParams();
    qs.set('page', String(page));
    qs.set('page_size', String(pageSize));
    if (appliedKeyword.trim()) qs.set('name', appliedKeyword.trim());

    apiFetch<SwIndustriesResponse>(`/api/base-data/sw-industries?${qs}`, {
      method: 'GET',
      errorHandling: 'ignore'
    })
      .then((data) => {
        if (aborted) return;
        const list = Array.isArray(data?.items) ? data.items : [];
        setItems(list);
        setTotal(typeof data?.total === 'number' ? data.total : 0);
      })
      .catch((err) => {
        if (aborted) return;
        const message = err instanceof Error ? err.message : '请求失败';
        setError(message);
        setItems([]);
        setTotal(0);
      })
      .finally(() => {
        if (aborted) return;
        setLoading(false);
      });

    return () => {
      aborted = true;
    };
  }, [open, page, pageSize, appliedKeyword]);

  const selectedList = useMemo(() => {
    return Object.values(selectedMap);
  }, [selectedMap]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl bg-black/70 p-4 modal-animate'>
      <div className='w-full md:max-w-3xl h-[80vh] glass-panel border-2 border-cp-yellow ring-1 ring-cp-yellow flex flex-col shadow-2xl'>
        <div className='flex items-center justify-between p-6 bg-white/[0.02] border-b border-cp-border shrink-0'>
          <div>
            <h2 className='text-xl font-bold font-serif tracking-wide uppercase text-white'>
              {t('stock_selection_panel.industry_label')}
            </h2>
            <p className='text-xs text-cp-text-muted font-sans mt-0.5'>
              {multiple ? t('common.multi_select') : t('common.single_select')}
            </p>
          </div>

          <button
            onClick={onClose}
            className='text-gray-500 hover:text-white transition-colors'
            aria-label='close'>
            <X size={24} />
          </button>
        </div>

        <div className='p-4 border-b border-cp-border bg-white/[0.02] shrink-0'>
          <div className='flex flex-col md:flex-row gap-3 md:items-center'>
            <div className='flex-1 flex items-center gap-2 border border-cp-border bg-black/30 px-3 py-2'>
              <Search size={16} className='text-cp-text-muted' />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setAppliedKeyword(keyword);
                    setPage(1);
                  }
                }}
                placeholder={t('common.search')}
                className='w-full bg-transparent outline-none text-sm text-white placeholder:text-cp-text-muted'
              />
            </div>

            <div className='flex items-center gap-2'>
              <span className='text-xs text-cp-text-muted'>
                {t('common.page_size')}
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const next = Number(e.target.value) as any;
                  setPageSize(next);
                  setPage(1);
                }}
                className='bg-black/40 border border-cp-border px-3 py-2 text-sm text-white focus:border-cp-yellow outline-none'>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <button
                type='button'
                onClick={() => {
                  setAppliedKeyword(keyword);
                  setPage(1);
                }}
                className='btn-gold px-4 py-2 text-sm'>
                {t('common.search')}
              </button>
            </div>
          </div>
        </div>

        <div className='flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4'>
          {loading ? (
            <div className='text-sm text-cp-text-muted'>
              {t('common.loading')}
            </div>
          ) : error ? (
            <div className='text-sm text-cp-red'>{error}</div>
          ) : !items.length ? (
            <div className='text-sm text-cp-text-muted'>
              {t('common.empty')}
            </div>
          ) : (
            <div className='space-y-2'>
              {items.map((it) => {
                const checked = Boolean(selectedMap[it.industry_code]);
                return (
                  <button
                    key={it.industry_code}
                    type='button'
                    onClick={() => {
                      setSelectedMap((prev) => {
                        const next = { ...prev };
                        if (multiple) {
                          if (next[it.industry_code]) {
                            delete next[it.industry_code];
                          } else {
                            next[it.industry_code] = it;
                          }
                          return next;
                        }

                        // single
                        if (next[it.industry_code]) {
                          return {};
                        }
                        return { [it.industry_code]: it };
                      });
                    }}
                    className={`w-full text-left border px-4 py-3 transition-colors bg-black/20 hover:border-cp-yellow/50 ${
                      checked ? 'border-cp-yellow' : 'border-cp-border'
                    }`}>
                    <div className='flex items-center justify-between gap-3'>
                      <div className='text-sm text-white'>
                        {it.industry_name}
                      </div>
                      <div className='text-[11px] font-mono text-cp-text-muted'>
                        {it.index_code}
                      </div>
                    </div>
                    <div className='mt-1 text-[11px] text-cp-text-muted flex flex-wrap gap-x-4 gap-y-1'>
                      <span>level:{it.level}</span>
                      <span>code:{it.industry_code}</span>
                      <span>src:{it.src}</span>
                      <span>pub:{it.is_pub}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className='p-4 border-t border-cp-border bg-white/[0.02] shrink-0 flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
          <div className='text-xs text-cp-text-muted'>
            {t('common.total')}: {total} · {t('common.page')}: {page}/
            {totalPages}
          </div>

          <div className='flex items-center gap-2 justify-between md:justify-end'>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className='px-3 py-2 border border-cp-border text-sm text-white disabled:opacity-50'>
                {t('common.prev')}
              </button>
              <button
                type='button'
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className='px-3 py-2 border border-cp-border text-sm text-white disabled:opacity-50'>
                {t('common.next')}
              </button>
            </div>

            <button
              type='button'
              onClick={() => onConfirm(selectedList)}
              className='btn-gold px-4 py-2 text-sm'>
              {t('common.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
