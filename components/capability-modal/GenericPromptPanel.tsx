'use client';

import { useEffect, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';
import { AppNotification } from '@/types';

type Props = {
  customPrompt?: string;
  isLoading: boolean;
  onNotify?: (
    title: string,
    message: string,
    type?: AppNotification['type']
  ) => void;
  setIsLoading: (v: boolean) => void;
  setOutput: (v: string) => void;
};

export default function GenericPromptPanel({
  customPrompt,
  isLoading,
  onNotify: _onNotify,
  setIsLoading,
  setOutput
}: Props) {
  const { t } = useLanguage();

  const [input, setInput] = useState(customPrompt || '');

  useEffect(() => {
    setInput(customPrompt || '');
  }, [customPrompt]);

  const execute = async () => {
    setIsLoading(true);
    setOutput('');

    setTimeout(() => {
      setOutput(t('capability_modal.mock_response'));
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className='w-full md:w-1/3 border-b md:border-b-0 md:border-r border-cp-border p-6 flex flex-col bg-white/[0.02] hover-card m-2 gap-4 overflow-y-auto custom-scrollbar min-h-0'>
      <label className='text-cp-text-muted text-xs font-bold uppercase tracking-widest block'>
        {t('capability_modal.input_label')}
      </label>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className='flex-1 bg-black/20 border border-white/[0.02] p-4 text-cp-text font-mono text-sm focus:border-cp-yellow focus:outline-none resize-none hover-card'
        placeholder={t('capability_modal.input_placeholder')}
      />

      <button
        onClick={execute}
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
