'use client';

import React from 'react';
import { AgentCapability, AgentStats } from '@/types';
import AgentSummaryHeader from '@/components/agent-party/AgentSummaryHeader';
import AgentStatsGrid from '@/components/agent-party/AgentStatsGrid';
import AgentActionBar from '@/components/agent-party/AgentActionBar';
import AgentCapabilitiesHeader from '@/components/agent-party/AgentCapabilitiesHeader';
import AgentCapabilitiesList from '@/components/agent-party/AgentCapabilitiesList';

interface AgentPartyFrameProps {
  agentName: string;
  agentClass?: string;
  agentLevel?: number;
  agentStats?: AgentStats;
  isJoined?: boolean;
  rank?: number;
  profit?: string;
  onToggleJoin?: () => void;
  onSelectCapability: (cap: AgentCapability) => void;
  onEditAgent?: () => void;
  onOpenChat: () => void;
  onDeleteAgent: () => void;
}

export default function AgentPartyFrame({
  agentName,
  agentClass = '智能型',
  agentLevel: _agentLevel = 1,
  isJoined = false,
  rank,
  profit,
  onToggleJoin,
  onSelectCapability,
  onEditAgent,
  onOpenChat,
  onDeleteAgent
}: AgentPartyFrameProps) {
  return (
    <div className='flex flex-col w-full h-full bg-gradient-to-b from-cp-dim to-cp-black border border-white/[0.02] shadow-2xl backdrop-blur-sm overflow-hidden'>
      {/* Header Section */}
      <div className='shrink-0 p-6 relative overflow-hidden'>
        <AgentSummaryHeader agentName={agentName} agentClass={agentClass} />

        <AgentStatsGrid isJoined={isJoined} rank={rank} profit={profit} />

        <AgentActionBar
          onOpenChat={onOpenChat}
          onEditAgent={onEditAgent}
          onDeleteAgent={onDeleteAgent}
        />
      </div>

      {/* Capabilities Section */}
      <div className='flex-1 min-h-0 bg-black/40 flex flex-col relative'>
        <AgentCapabilitiesHeader
          isJoined={isJoined}
          rank={rank}
          profit={profit}
        />

        <AgentCapabilitiesList
          isJoined={isJoined}
          onRequestJoin={onToggleJoin}
          onSelectCapability={onSelectCapability}
        />

        {/* Bottom Texture */}
        <div className="shrink-0 h-[60px] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
      </div>
    </div>
  );
}
