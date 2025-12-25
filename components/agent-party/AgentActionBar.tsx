'use client';

import React from 'react';
import { BookOpen, Edit2, MessageSquare, Trash2 } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';

interface AgentActionBarProps {
  onOpenChat: () => void;
  onOpenKnowledge?: () => void;
  onEditAgent?: () => void;
  onDeleteAgent: () => void;
}

export default function AgentActionBar({
  onOpenChat,
  onOpenKnowledge,
  onEditAgent,
  onDeleteAgent
}: AgentActionBarProps) {
  const { t } = useLanguage();

  return (
    <div className='flex flex-wrap justify-end gap-2 mt-5 pt-4 border-t border-white/[0.02]'>
      <button
        onClick={onOpenKnowledge}
        disabled={!onOpenKnowledge}
        className={`text-[10px] flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-white/[0.02] text-cp-text-muted hover:text-cp-yellow transition-all duration-200 ${
          !onOpenKnowledge ? 'opacity-50 cursor-not-allowed' : ''
        }`}>
        <BookOpen size={12} /> {t('agent_party.knowledge')}
      </button>
      <button
        onClick={onOpenChat}
        className='text-[10px] flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-white/[0.02] text-cp-text-muted hover:text-cp-yellow transition-all duration-200'>
        <MessageSquare size={12} /> {t('agent_party.chat')}
      </button>
      <button
        onClick={onEditAgent}
        disabled={!onEditAgent}
        className={`text-[10px] flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-white/[0.02] text-cp-text-muted hover:text-white transition-all duration-200 ${
          !onEditAgent ? 'opacity-50 cursor-not-allowed' : ''
        }`}>
        <Edit2 size={12} /> {t('agent_party.edit_agent')}
      </button>
      <button
        onClick={onDeleteAgent}
        className='text-[10px] flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-cp-red/10 text-cp-text-muted hover:text-cp-red transition-all duration-200'>
        <Trash2 size={12} /> {t('agent_party.delete_agent')}
      </button>
    </div>
  );
}
