'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/http';
import { useLanguage } from '@/lib/useLanguage';

declare global {
  interface Window {
    __aaStockSearchInflight?: Record<string, Promise<StockSearchItem[]>>;
  }
}

export type StockSearchItem = {
  symbol?: string;
  stock_code?: string;
  ts_code?: string;
  code?: string;
  name?: string;
  stock_name?: string;
  full_name?: string;
  [k: string]: unknown;
};

type Props = {
  open: boolean;
  value?: StockSearchItem[];
  onClose: () => void;
  onConfirm: (selected: StockSearchItem[]) => void;
};

const DEFAULT_LIMIT = 50;

const pickSymbol = (it: StockSearchItem) => {
  const v =
    (typeof it.symbol === 'string' && it.symbol) ||
    (typeof it.stock_code === 'string' && it.stock_code) ||
    (typeof it.ts_code === 'string' && it.ts_code) ||
    (typeof it.code === 'string' && it.code) ||
    '';
  return v.trim();
};

const pickName = (it: StockSearchItem) => {
  const v =
    (typeof it.name === 'string' && it.name) ||
    (typeof it.stock_name === 'string' && it.stock_name) ||
    (typeof it.full_name === 'string' && it.full_name) ||
    '';
  return v.trim();
};

const normalizeItems = (res: unknown): StockSearchItem[] => {
  if (Array.isArray(res)) return res as StockSearchItem[];
  if (res && typeof res === 'object') {
    const obj = res as any;
    if (Array.isArray(obj.items)) return obj.items as StockSearchItem[];
    if (Array.isArray(obj.data)) return obj.data as StockSearchItem[];
    if (Array.isArray(obj.list)) return obj.list as StockSearchItem[];
  }
  return [];
};

export default function StockSymbolSelectorModal({
  open,
  value = [],
  onClose,
  onConfirm
}: Props) {
  const { t } = useLanguage();

  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [searchSeq, setSearchSeq] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<StockSearchItem[]>([]);

  const [selectedMap, setSelectedMap] = useState<
    Record<string, StockSearchItem>
  >({});

  const wasOpenRef = useRef(false);

  const doSearch = () => {
    const next = keyword.trim();
    setAppliedKeyword(next);
    setSearchSeq((s) => s + 1);
  };

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      const next: Record<string, StockSearchItem> = {};
      for (const it of value) {
        const key = pickSymbol(it);
        if (key) next[key] = it;
      }
      setSelectedMap(next);
      const first = value[0];
      const prefill = first ? pickSymbol(first) : '';
      setKeyword(prefill);
      setAppliedKeyword(prefill);
      // Open triggers one search even when keyword is empty.
      setSearchSeq((s) => s + 1);
      setItems([]);
      setError(null);
    }
    wasOpenRef.current = open;
  }, [open, value]);

  useEffect(() => {
    if (!open) return;

    const kw = appliedKeyword.trim();
    const requestKey = `${kw}|${DEFAULT_LIMIT}`;

    let aborted = false;
    setLoading(true);
    setError(null);

    const ensureInflight = () => {
      if (typeof window === 'undefined') return null;
      window.__aaStockSearchInflight = window.__aaStockSearchInflight ?? {};
      const existing = window.__aaStockSearchInflight[requestKey];
      if (existing) return existing;

      const promise = (async () => {
        const qs = new URLSearchParams();
        // Always send `keyword` even if empty string.
        qs.set('keyword', kw);
        qs.set('limit', String(DEFAULT_LIMIT));

        try {
          const res = await apiFetch<any>(
            `/api/stock-basic/search?${qs.toString()}`,
            {
              method: 'GET',
              errorHandling: 'ignore'
            }
          );
          const list = normalizeItems(res)
            .map((x) =>
              x && typeof x === 'object' ? (x as StockSearchItem) : null
            )
            .filter((x): x is StockSearchItem => x !== null)
            .filter((x) => Boolean(pickSymbol(x) || pickName(x)));
          return list;
        } catch (err) {
          // When keyword is empty, backend may respond 422 "Field required".
          // Treat it as an empty result so UI doesn't look broken.
          if (err instanceof ApiError && err.status === 422) {
            return [];
          }
          throw err;
        }
      })();

      window.__aaStockSearchInflight[requestKey] = promise;
      void promise.finally(() => {
        try {
          const map = window.__aaStockSearchInflight;
          if (map && map[requestKey] === promise) {
            delete map[requestKey];
          }
        } catch {
          // ignore
        }
      });

      return promise;
    };

    const inflight = ensureInflight();
    (inflight ?? Promise.resolve([] as StockSearchItem[]))
      .then((list) => {
        if (aborted) return;
        setItems(list);
        setError(null);
      })
      .catch((err) => {
        if (aborted) return;
        const message = err instanceof Error ? err.message : '请求失败';
        setError(message);
        setItems([]);
      })
      .finally(() => {
        if (aborted) return;
        setLoading(false);
      });

    return () => {
      aborted = true;
    };
  }, [open, appliedKeyword, searchSeq]);

  const selectedList = useMemo(() => Object.values(selectedMap), [selectedMap]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl bg-black/70 p-4 modal-animate'>
      <div className='w-full md:max-w-3xl h-[80vh] glass-panel border-2 border-cp-yellow ring-1 ring-cp-yellow flex flex-col shadow-2xl'>
        <div className='flex items-center justify-between p-6 bg-white/[0.02] border-b border-cp-border shrink-0'>
          <div>
            <h2 className='text-xl font-bold font-serif tracking-wide uppercase text-white'>
              {t('capability_modal.stock_symbol')}
            </h2>
            <p className='text-xs text-cp-text-muted font-sans mt-0.5'>
              {t('common.single_select')}
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
                    doSearch();
                  }
                }}
                placeholder={t('common.search')}
                className='w-full bg-transparent outline-none text-sm text-white placeholder:text-cp-text-muted'
              />
            </div>

            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={doSearch}
                className='btn-gold px-4 py-2 text-sm'>
                {t('common.search')}
              </button>
            </div>
          </div>

          {!appliedKeyword.trim() ? (
            <div className='mt-2 text-xs text-cp-text-muted'>
              {t('common.search')} {t('capability_modal.stock_symbol')}
            </div>
          ) : null}
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
              {items.map((it, idx) => {
                const symbol = pickSymbol(it);
                const name = pickName(it);
                const key = symbol || `${name}-${idx}`;
                const checked = Boolean(symbol && selectedMap[symbol]);

                return (
                  <button
                    key={key}
                    type='button'
                    onClick={() => {
                      if (!symbol) return;
                      setSelectedMap((prev) => {
                        if (prev[symbol]) return {};
                        return { [symbol]: it };
                      });
                    }}
                    className={`w-full text-left border px-4 py-3 transition-colors bg-black/20 hover:border-cp-yellow/50 ${
                      checked ? 'border-cp-yellow' : 'border-cp-border'
                    }`}>
                    <div className='flex items-center justify-between gap-3'>
                      <div className='text-sm text-white'>{name || symbol}</div>
                      <div className='text-[11px] font-mono text-cp-text-muted'>
                        {symbol}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className='p-4 border-t border-cp-border bg-white/[0.02] shrink-0 flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
          <div className='text-xs text-cp-text-muted'>
            {t('common.total')}: {items.length}
          </div>

          <div className='flex items-center gap-2 justify-between md:justify-end'>
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
