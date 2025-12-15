'use client';

import { Cpu, X } from 'lucide-react';
import { AGENT_CAPABILITY_DETAILS, AgentCapability } from '@/types';
import { useLanguage } from '@/lib/useLanguage';

type Props = {
  capability: AgentCapability;
  onClose: () => void;
};

export default function CapabilityModalHeader({ capability, onClose }: Props) {
  const { t } = useLanguage();
  const details = AGENT_CAPABILITY_DETAILS[capability];
  const label = t(details.labelKey);
  const role = t(details.roleKey);

  return (
    <div className='flex items-center justify-between p-6 bg-white/[0.02] border-b border-cp-border shrink-0'>
      <div className='flex items-center gap-4'>
        <div className='w-10 h-10 border border-cp-border flex items-center justify-center text-cp-yellow bg-white/[0.02]'>
          <Cpu size={20} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className='text-xl font-bold font-serif tracking-wide uppercase text-white'>
            {label} {t('capability_modal.module')}
          </h2>
          <p className='text-xs text-cp-text-muted font-sans mt-0.5'>
            {t('capability_modal.role')} {role}
          </p>
        </div>
      </div>

      <button
        onClick={onClose}
        className='text-gray-500 hover:text-white transition-colors'>
        <X size={24} />
      </button>
    </div>
  );
}
