'use client';

import { useEffect, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';
import { apiFetch } from '@/lib/http';
import { useAgentStore, useUserStore } from '@/store';
import { AppNotification } from '@/types';
import {
  formatStockSelectionResponse,
  looksLikeJsonText,
  StockSelectionResponse,
  tryParseJsonText
} from './capabilityFormatters';

type Props = {
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  setOutput: (v: string) => void;
  customPrompt?: string;
  onNotify?: (
    title: string,
    message: string,
    type?: AppNotification['type']
  ) => void;
};

const INDUSTRY_OPTIONS = [
  '不限',
  '消费',
  '科技',
  '医药',
  '金融',
  '能源',
  '制造',
  '地产'
];

const THEME_OPTIONS = [
  '不限',
  '价值',
  '成长',
  '红利',
  '低波动',
  '高股息',
  '景气度'
];

export default function StockSelectionPanel({
  isLoading,
  onNotify,
  setIsLoading,
  setOutput,
  customPrompt
}: Props) {
  const { t } = useLanguage();
  const agentId = useAgentStore((s) => s.agentId);
  const currentUser = useUserStore((s) => s.currentUser);

  const [industry, setIndustry] = useState(INDUSTRY_OPTIONS[0]);
  const [theme, setTheme] = useState(THEME_OPTIONS[0]);
  const [userCustomInput, setUserCustomInput] = useState(customPrompt || '');
  const [needLlmAnalysis, setNeedLlmAnalysis] = useState(false);

  useEffect(() => {
    setUserCustomInput(customPrompt || '');
  }, [customPrompt]);

  const handleExecute = async () => {
    setIsLoading(true);

    if (!agentId || !currentUser?.id) {
      onNotify?.(
        t('capability_modal.missing_agent_title') || '缺少 Agent',
        t('capability_modal.missing_agent_desc') || '请先创建或选择 Agent。',
        'error'
      );
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        agent_id: agentId,
        user_id: currentUser.id,
        industry,
        theme,
        user_custom_input: userCustomInput,
        need_llm_analysis: needLlmAnalysis
      };

      const text = await apiFetch<string, typeof payload>(
        '/api/research/stock-selection',
        {
          method: 'POST',
          body: payload,
          parseAs: 'text',
          errorHandling: 'ignore'
        }
      );

      const maybeJson = tryParseJsonText(text);
      if (maybeJson != null) {
        const mdText = formatStockSelectionResponse(
          maybeJson as StockSelectionResponse
        );
        setOutput(mdText || '（无法格式化返回内容）');
      } else if (looksLikeJsonText(text)) {
        const message = '返回内容不是有效 JSON，无法解析。';
        onNotify?.('解析失败', message, 'error');
        setOutput(message);
      } else {
        // 如果后端返回的是自然语言说明，直接以文本（Markdown）展示即可
        setOutput(text || '（空响应）');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '执行出错';
      onNotify?.('执行失败', message, 'error');
      setOutput(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full md:w-1/3 border-b md:border-b-0 md:border-r border-cp-border p-6 flex flex-col bg-white/[0.02] hover-card m-2 gap-4 overflow-y-auto custom-scrollbar min-h-0'>
      <label className='text-cp-text-muted text-xs font-bold uppercase tracking-widest block'>
        {t('capability_modal.input_label')}
      </label>

      <div className='space-y-4'>
        <div className='flex flex-col gap-2'>
          <span className='text-xs text-cp-text-muted tracking-widest uppercase'>
            行业
          </span>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className='bg-black/40 border border-cp-border px-3 py-2 text-sm text-white focus:border-cp-yellow outline-none'>
            {INDUSTRY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className='flex flex-col gap-2'>
          <span className='text-xs text-cp-text-muted tracking-widest uppercase'>
            主题
          </span>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className='bg-black/40 border border-cp-border px-3 py-2 text-sm text-white focus:border-cp-yellow outline-none'>
            {THEME_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className='flex flex-col gap-2'>
          <span className='text-xs text-cp-text-muted tracking-widest uppercase'>
            用户输入内容
          </span>
          <textarea
            value={userCustomInput}
            onChange={(e) => setUserCustomInput(e.target.value)}
            placeholder='例如：偏好价值/成长，持有周期，风险偏好等'
            className='bg-black/40 border border-cp-border px-3 py-2 text-sm text-white focus:border-cp-yellow outline-none placeholder:text-cp-text-muted resize-none min-h-[196px]'
          />
        </div>

        <label className='flex items-center justify-between gap-3 bg-black/20 border border-cp-border px-3 py-2 hover:border-cp-yellow transition-colors select-none cursor-pointer'>
          <span className='text-xs text-cp-text-muted uppercase tracking-widest'>
            是否启用大模型分析
          </span>

          <span className='relative inline-flex items-center'>
            <input
              type='checkbox'
              checked={needLlmAnalysis}
              onChange={(e) => setNeedLlmAnalysis(e.target.checked)}
              className='sr-only'
            />
            <span
              className={`h-6 w-11 border border-cp-border transition-colors ${
                needLlmAnalysis
                  ? 'bg-cp-yellow/20 border-cp-yellow'
                  : 'bg-black/40'
              }`}
            />
            <span
              className={`absolute left-1 top-1 h-4 w-4 transition-transform ${
                needLlmAnalysis
                  ? 'translate-x-5 bg-cp-yellow'
                  : 'translate-x-0 bg-white/60'
              }`}
            />
          </span>
        </label>
      </div>

      <button
        onClick={handleExecute}
        disabled={isLoading}
        className='w-full py-4 btn-gold flex items-center justify-center gap-2 disabled:opacity-50 mt-auto'>
        {isLoading ? (
          <RotateCcw className='animate-spin' size={18} />
        ) : (
          <Play size={18} />
        )}
        {t('capability_modal.execute')}
      </button>
    </div>
  );
}
