'use client';

import React, { useState } from 'react';
import { X, User, ChevronRight } from 'lucide-react';
import type { AgentStats, AgentModule } from '@/types';
import { useLanguage } from '@/lib/useLanguage';

interface EditAgentModalProps {
  initialName: string;
  initialClass: string;
  initialStats: AgentStats;
  initialPrompt: string;
  onSave: (
    name: string,
    agentClass: string,
    stats: AgentStats,
    modules: AgentModule[],
    prompt: string
  ) => void;
  onClose: () => void;
}

export default function EditAgentModal({
  initialName,
  initialClass,
  initialStats,
  initialPrompt,
  onSave,
  onClose
}: EditAgentModalProps) {
  const { dictionary } = useLanguage();
  const copy = dictionary.edit_agent;
  const [name, setName] = useState(initialName);

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-xl bg-black/70 p-4 modal-animate'>
      <div className='w-full md:max-w-5xl h-[85vh] glass-panel border-2 border-cp-yellow ring-1 ring-cp-yellow flex flex-col shadow-2xl relative'>
        {/* Header */}
        <div className='flex justify-between items-center p-6 border-b border-cp-border bg-white/[0.02] shrink-0'>
          <div className='flex items-center gap-3'>
            <User className='text-cp-yellow' size={24} strokeWidth={1.5} />
            <div>
              <h2 className='text-xl font-bold font-serif text-white uppercase tracking-wider'>
                {copy.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-white transition-colors'>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 flex flex-col justify-center items-center p-8'>
          <div className='w-full max-w-md space-y-8 text-center hover-card p-8 border border-transparent'>
            <h3 className='text-2xl font-serif font-bold text-white'>
              {copy.subtitle}
            </h3>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full bg-transparent border-b border-cp-border p-4 text-center text-xl font-mono text-cp-yellow focus:border-cp-yellow focus:outline-none hover-card'
              placeholder={copy.placeholder}
            />
            <button
              onClick={() => {
                onSave(name, initialClass, initialStats, [], initialPrompt);
                onClose();
              }}
              className='w-full py-4 btn-gold flex items-center justify-center gap-2'>
              {copy.save} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
