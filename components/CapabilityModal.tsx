'use client';

import React, { useState } from 'react';
import { AgentCapability, AppNotification, ChartDataPoint } from '@/types';
import CapabilityModalHeader from './capability-modal/CapabilityModalHeader';
import StockAnalysisPanel from './capability-modal/StockAnalysisPanel';
import StockSelectionPanel from './capability-modal/StockSelectionPanel';
import GenericPromptPanel from './capability-modal/GenericPromptPanel';
import CapabilityOutputPanel from './capability-modal/CapabilityOutputPanel';
import BacktestPanel from './capability-modal/BacktestPanel';
import BacktestOutputPanel from './capability-modal/BacktestOutputPanel';

interface CapabilityModalProps {
  capability: AgentCapability;
  customPrompt?: string;
  onClose: () => void;
  onNotify?: (
    title: string,
    message: string,
    type?: AppNotification['type']
  ) => void;
}

export default function CapabilityModal({
  capability,
  customPrompt,
  onClose,
  onNotify
}: CapabilityModalProps) {
  const isStockAnalysis = capability === AgentCapability.STOCK_ANALYSIS;
  const isStockSelection = capability === AgentCapability.STRATEGY_PICKING;
  const isBacktesting = capability === AgentCapability.BACKTESTING;

  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl bg-black/70 p-4 modal-animate'>
      <div className='w-full md:max-w-6xl h-[85vh] glass-panel border-2 border-cp-yellow ring-1 ring-cp-yellow flex flex-col shadow-2xl'>
        <CapabilityModalHeader capability={capability} onClose={onClose} />

        <div className='relative flex-1 flex flex-col md:flex-row overflow-hidden bg-transparent'>
          {isStockAnalysis ? (
            <StockAnalysisPanel
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              setOutput={setOutput}
              onNotify={onNotify}
            />
          ) : isStockSelection ? (
            <StockSelectionPanel
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              setOutput={setOutput}
              onNotify={onNotify}
              customPrompt={customPrompt}
            />
          ) : isBacktesting ? (
            <BacktestPanel
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              setOutput={setOutput}
              setChartData={setChartData}
              onNotify={onNotify}
            />
          ) : (
            <GenericPromptPanel
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              setOutput={setOutput}
              onNotify={onNotify}
              customPrompt={customPrompt}
            />
          )}

          {isBacktesting ? (
            <BacktestOutputPanel
              isLoading={isLoading}
              output={output}
              chartData={chartData}
            />
          ) : (
            <CapabilityOutputPanel isLoading={isLoading} output={output} />
          )}
        </div>
      </div>
    </div>
  );
}
