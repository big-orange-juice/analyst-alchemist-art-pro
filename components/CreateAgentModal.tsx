'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  X,
  Shield,
  Zap,
  Activity,
  Brain,
  Cpu,
  Check,
  ChevronLeft,
  Upload,
  FileText,
  Play,
  RotateCcw,
  Trash2,
  Clock
} from 'lucide-react';
// Removed antd; using native inputs for sliders and selects
import * as echarts from 'echarts';
import type { AgentStats, AgentModule, AppNotification } from '@/types';
import { useUserStore, useAgentStore } from '@/store';
import { ApiError, apiFetch } from '@/lib/http';
import { useLanguage } from '@/lib/useLanguage';

interface CreateAgentModalProps {
  onCreate: (
    agentId: string | null,
    name: string,
    prompt: string,
    archetype: string,
    stats: AgentStats,
    modules: AgentModule[]
  ) => void;
  onClose: () => void;
  onNotify?: (
    title: string,
    message: string,
    type: AppNotification['type']
  ) => void;
}

type WorkflowId = 'track_thinking' | 'quant_thinking' | 'news_thinking';

type PersonaId =
  | 'aggressive_growth'
  | 'conservative_value'
  | 'dividend_focus'
  | 'quantitative'
  | 'momentum_trader'
  | 'contrarian'
  | 'balanced';

interface WorkflowPreset {
  id: WorkflowId;
  titleKey: string;
  descKey: string;
  icon: typeof Shield;
  stats: AgentStats;
  promptKey: string;
}

const WORKFLOW_PRESETS: WorkflowPreset[] = [
  {
    id: 'track_thinking',
    titleKey: 'workflow_track_title',
    descKey: 'workflow_track_desc',
    icon: Shield,
    stats: { intelligence: 75, speed: 30, risk: 70 },
    promptKey: 'workflow_track_prompt'
  },
  {
    id: 'quant_thinking',
    titleKey: 'workflow_quant_title',
    descKey: 'workflow_quant_desc',
    icon: Activity,
    stats: { intelligence: 65, speed: 70, risk: 50 },
    promptKey: 'workflow_quant_prompt'
  },
  {
    id: 'news_thinking',
    titleKey: 'workflow_news_title',
    descKey: 'workflow_news_desc',
    icon: Zap,
    stats: { intelligence: 70, speed: 50, risk: 60 },
    promptKey: 'workflow_news_prompt'
  }
];

const PERSONA_PRESETS: Record<
  WorkflowId,
  Array<{ id: PersonaId; titleKey: string; descKey: string }>
> = {
  track_thinking: [
    {
      id: 'aggressive_growth',
      titleKey: 'persona_aggressive_growth_title',
      descKey: 'persona_aggressive_growth_desc'
    },
    {
      id: 'conservative_value',
      titleKey: 'persona_conservative_value_title',
      descKey: 'persona_conservative_value_desc'
    },
    {
      id: 'dividend_focus',
      titleKey: 'persona_dividend_focus_title',
      descKey: 'persona_dividend_focus_desc'
    }
  ],
  quant_thinking: [
    {
      id: 'quantitative',
      titleKey: 'persona_quantitative_title',
      descKey: 'persona_quantitative_desc'
    },
    {
      id: 'momentum_trader',
      titleKey: 'persona_momentum_trader_title',
      descKey: 'persona_momentum_trader_desc'
    }
  ],
  news_thinking: [
    {
      id: 'contrarian',
      titleKey: 'persona_contrarian_title',
      descKey: 'persona_contrarian_desc'
    },
    {
      id: 'balanced',
      titleKey: 'persona_balanced_title',
      descKey: 'persona_balanced_desc'
    }
  ]
};

interface SimResultData {
  duration: SimDuration;
  equityCurve: number[];
}

type SimDuration = '1w' | '1m' | '3m' | '1y';
type CreationStep =
  | 'naming'
  | 'preset'
  | 'configure'
  | 'knowledge'
  | 'simulation';

export default function CreateAgentModal({
  onCreate,
  onClose,
  onNotify
}: CreateAgentModalProps) {
  const { t } = useLanguage();
  const tt = (key: string) => t(`create_agent_modal.${key}`);

  useEffect(() => {
    if (simStatus !== 'idle') return;
    setSimLogs([
      t('create_agent_modal.sim_log_ready'),
      t('create_agent_modal.sim_log_pick')
    ]);
  }, [simStatus, t]);

  const { currentUser } = useUserStore();
  const { agentName, agentClass, agentId } = useAgentStore();
  const [step, setStep] = useState<CreationStep>('naming');
  const [name, setName] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<WorkflowId | ''>('');
  const [selectedPersonaId, setSelectedPersonaId] = useState<PersonaId | ''>(
    ''
  );
  const [customPrompt, setCustomPrompt] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; size: string }[]
  >([]);
  const [simDurationMode, setSimDurationMode] = useState<SimDuration>('1w');
  const [simStatus, setSimStatus] = useState<'idle' | 'running' | 'finished'>(
    'idle'
  );
  const [simLogs, setSimLogs] = useState<string[]>([
    tt('sim_log_ready'),
    tt('sim_log_pick')
  ]);
  const [simResult, setSimResult] = useState<SimResultData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCreated, setHasCreated] = useState(false);
  const [existingAgent, setExistingAgent] = useState<{
    agent_id: string | null;
    agent_name: string;
    workflow_id: string;
  } | null>(null);
  const appliedExistingRef = useRef(false);

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resolvedWorkflowPresets = WORKFLOW_PRESETS.map((p) => ({
    ...p,
    title: tt(p.titleKey),
    desc: tt(p.descKey),
    defaultPrompt: tt(p.promptKey)
  }));

  const selectedPreset = resolvedWorkflowPresets.find(
    (p) => p.id === selectedPresetId
  );

  const availablePersonas =
    selectedPresetId && selectedPresetId in PERSONA_PRESETS
      ? PERSONA_PRESETS[selectedPresetId as WorkflowId]
      : [];

  const resolvedAvailablePersonas = availablePersonas.map((p) => ({
    ...p,
    title: tt(p.titleKey),
    desc: tt(p.descKey)
  }));

  const handlePresetSelect = (presetId: WorkflowId) => {
    setSelectedPresetId(presetId);
    setSelectedPersonaId('');
    const preset = resolvedWorkflowPresets.find((p) => p.id === presetId);
    if (preset) {
      setCustomPrompt(preset.defaultPrompt);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((f: File) => ({
        name: f.name,
        size: (f.size / 1024).toFixed(1) + ' KB'
      }));
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const startSimulation = () => {
    setSimStatus('running');
    setSimLogs([
      tt('sim_log_init'),
      tt('sim_log_load'),
      `${tt('sim_log_set_duration')}: ${tt(`duration_${simDurationMode}`)}`,
      tt('sim_log_run')
    ]);
    setSimResult(null);

    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (Math.random() > 0.6) {
        setSimLogs((prev) => [
          ...prev,
          `${tt('sim_log_day')} ${count}: ${tt('sim_log_scanning')}`
        ]);
      }
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setSimStatus('finished');
      setSimLogs((prev) => [...prev, tt('sim_log_done'), tt('sim_log_report')]);
      setSimResult({
        duration: simDurationMode,
        equityCurve: Array.from(
          { length: 30 },
          (_, i) => 100 + Math.random() * 20 + i * 0.5
        )
      });
    }, 2500);
  };

  useEffect(() => {
    if (!agentId || !agentName || existingAgent) return;
    setExistingAgent({
      agent_id: agentId,
      agent_name: agentName,
      workflow_id: agentClass
    });
  }, [agentId, agentClass, agentName, existingAgent]);

  useEffect(() => {
    if (!existingAgent || appliedExistingRef.current) return;

    const presetId: WorkflowId | '' =
      existingAgent.workflow_id === 'track_thinking' ||
      existingAgent.workflow_id === 'quant_thinking' ||
      existingAgent.workflow_id === 'news_thinking'
        ? (existingAgent.workflow_id as WorkflowId)
        : '';

    if (!presetId) return;

    appliedExistingRef.current = true;
    setName(existingAgent.agent_name);
    setSelectedPresetId(presetId);
    setHasCreated(true);

    const preset = WORKFLOW_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      const presetTitle = tt(preset.titleKey);
      onCreate(
        existingAgent.agent_id ?? null,
        existingAgent.agent_name,
        '',
        presetTitle,
        preset.stats,
        []
      );
    }
  }, [existingAgent, onCreate, setName]);

  useEffect(() => {
    if (step === 'simulation' && simResult && chartRef.current) {
      if (!chartInstance.current)
        chartInstance.current = echarts.init(chartRef.current);
      chartInstance.current.setOption({
        backgroundColor: 'transparent',
        grid: { top: 20, right: 10, bottom: 20, left: 40 },
        xAxis: {
          type: 'category',
          data: simResult.equityCurve.map((_, i) => i),
          axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
          splitLine: { show: false }
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
          axisLabel: { color: '#888' }
        },
        series: [
          {
            type: 'line',
            data: simResult.equityCurve,
            smooth: true,
            itemStyle: { color: '#C5A059' },
            areaStyle: { opacity: 0.1, color: '#C5A059' },
            showSymbol: false,
            lineStyle: { width: 2 }
          }
        ]
      });
    }
    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [simResult, step]);

  const submitAgentCreation = async (goToSimulation: boolean) => {
    if (hasCreated || !selectedPresetId || !selectedPersonaId) {
      if (goToSimulation) setStep('simulation');
      return;
    }
    if (!selectedPreset) {
      onNotify?.(
        tt('notify_create_failed'),
        tt('notify_invalid_workflow'),
        'error'
      );
      return;
    }

    if (!currentUser) {
      onNotify?.(
        tt('notify_missing_user_title'),
        tt('notify_missing_user_desc'),
        'error'
      );
      return;
    }

    const payload = {
      agent_name: name,
      workflow_id: selectedPresetId,
      persona_id: selectedPersonaId
    };

    try {
      setIsSubmitting(true);
      const result = await apiFetch<any, typeof payload>('/api/agents', {
        method: 'POST',
        body: payload,
        errorHandling: 'ignore'
      }).catch((err) => {
        if (err instanceof ApiError) {
          throw new Error(
            err.message || tt('notify_create_agent_failed_fallback')
          );
        }
        throw err;
      });
      const createdId = result?.id != null ? String(result.id) : null;

      onCreate(
        createdId,
        name,
        customPrompt,
        selectedPreset.title,
        selectedPreset.stats,
        []
      );
      setHasCreated(true);
      onNotify?.(
        tt('notify_create_success'),
        tt('notify_create_success_desc'),
        'success'
      );
      if (goToSimulation) setStep('simulation');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : tt('notify_create_agent_failed_fallback');
      onNotify?.(tt('notify_create_failed'), message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalDeploy = async () => {
    if (!hasCreated) return;
    onClose();
  };

  const getStepNumber = () => {
    switch (step) {
      case 'naming':
        return '01';
      case 'preset':
        return '02';
      case 'configure':
        return '03';
      case 'knowledge':
        return '04';
      case 'simulation':
        return '05';
      default:
        return '00';
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'naming':
        return tt('step_naming');
      case 'preset':
        return tt('step_preset');
      case 'configure':
        return tt('step_configure');
      case 'knowledge':
        return tt('step_knowledge');
      case 'simulation':
        return tt('step_simulation');
      default:
        return '';
    }
  };

  const getTotalReturnPct = (duration: SimDuration) => {
    switch (duration) {
      case '1w':
        return '3.2';
      case '1m':
        return '7.4';
      case '3m':
        return '15.4';
      case '1y':
        return '28.9';
      default:
        return '0.0';
    }
  };

  const isConfigValid = () => !!selectedPresetId && !!selectedPersonaId;

  return (
    <div className='fixed inset-0 z-[100] bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 modal-animate'>
      <div className='w-full md:max-w-5xl h-[85vh] glass-panel border-2 border-cp-yellow ring-1 ring-cp-yellow flex flex-col shadow-2xl relative'>
        {/* Header */}
        <div className='flex justify-between items-center p-6 border-b border-cp-border bg-white/[0.02] shrink-0'>
          <div className='flex items-center gap-4'>
            <div className='w-10 h-10 border border-cp-border flex items-center justify-center text-cp-yellow bg-white/[0.02]'>
              <Cpu size={20} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className='text-xl font-bold font-serif text-white tracking-wide'>
                {getStepTitle()}
              </h2>
              <p className='text-xs text-cp-text-muted font-sans uppercase tracking-widest mt-1'>
                {tt('step_label')} {getStepNumber()}
                {tt('step_of')}
              </p>
              {existingAgent && (
                <div className='mt-2 text-xs text-cp-text-muted'>
                  {tt('existing_agent')}:{' '}
                  <span className='text-white'>{existingAgent.agent_name}</span>{' '}
                  · {tt('existing_agent_flow')}{' '}
                  <span className='text-cp-yellow font-mono'>
                    {existingAgent.workflow_id}
                  </span>{' '}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-cp-yellow transition-colors'>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-hidden bg-transparent relative flex flex-col min-h-0'>
          {/* STEP 1: NAMING */}
          {step === 'naming' && (
            <div className='flex-1 flex flex-col justify-center items-center p-8 animate-in fade-in slide-in-from-bottom-4'>
              <div className='w-full max-w-md space-y-12 text-center'>
                <div className='space-y-4'>
                  <div className='w-24 h-24 mx-auto border border-cp-yellow/30 flex items-center justify-center mb-6 bg-cp-dark shadow-[0_0_40px_rgba(197,160,89,0.1)] hover-card'>
                    <Brain
                      size={40}
                      className='text-cp-yellow opacity-80'
                      strokeWidth={1}
                    />
                  </div>
                  <h3 className='text-3xl font-serif font-bold text-white'>
                    {tt('naming_title')}
                  </h3>
                  <p className='text-cp-text-muted font-sans font-light'>
                    {tt('naming_desc')}
                  </p>
                </div>

                <div className='relative group hover-card p-4 border border-transparent'>
                  <input
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={tt('naming_placeholder')}
                    className='w-full bg-transparent border-b border-cp-border py-4 text-center text-2xl font-serif text-cp-yellow focus:border-cp-yellow focus:outline-none placeholder-gray-800 transition-colors uppercase tracking-widest'
                    maxLength={15}
                    autoFocus
                  />
                </div>

                <button
                  onClick={() => setStep('preset')}
                  disabled={!name.trim()}
                  className='w-full py-4 btn-gold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'>
                  {tt('naming_next')} <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PRESET */}
          {step === 'preset' && (
            <div className='flex-1 flex flex-col p-8 animate-in fade-in slide-in-from-right-8 overflow-y-auto'>
              <div className='text-center mb-10'>
                <h3 className='text-2xl font-serif font-bold text-white mb-2'>
                  {tt('preset_title')}
                </h3>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full mb-10'>
                {resolvedWorkflowPresets.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset.id)}
                      className={`border core-module-card hover-card p-8 cursor-pointer transition-all flex flex-col gap-6 group relative min-h-[200px]
                                        ${
                                          isSelected
                                            ? 'core-module-card--active bg-cp-dark/50'
                                            : 'bg-transparent hover:border-gray-600'
                                        }
                                    `}>
                      <div className='flex justify-between items-start'>
                        <preset.icon
                          size={32}
                          className={
                            isSelected ? 'text-cp-yellow' : 'text-gray-500'
                          }
                          strokeWidth={1}
                        />
                        {isSelected && (
                          <div className='text-cp-yellow'>
                            <Check size={24} />
                          </div>
                        )}
                      </div>

                      <div>
                        <h4
                          className={`text-xl font-serif font-bold mb-2 ${
                            isSelected ? 'text-white' : 'text-cp-text-muted'
                          }`}>
                          {preset.title}
                        </h4>
                        <p className='text-sm text-gray-500 font-sans leading-relaxed'>
                          {preset.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className='mt-auto flex justify-center gap-6 pt-6 border-t border-cp-border'>
                <button
                  onClick={() => setStep('naming')}
                  className='px-8 py-3 btn-outline flex items-center gap-2'>
                  <ChevronLeft size={16} /> {tt('back')}
                </button>
                <button
                  onClick={() => setStep('configure')}
                  disabled={!selectedPresetId}
                  className='px-8 py-3 btn-gold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'>
                  {tt('next')} <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIGURE */}
          {step === 'configure' && (
            <div className='flex-1 flex flex-col p-8 animate-in fade-in slide-in-from-right-8 overflow-y-auto'>
              <div className='max-w-4xl mx-auto w-full flex flex-col gap-8 pb-20'>
                {!selectedPresetId && (
                  <div className='p-6 border border-cp-border text-center text-cp-text-muted'>
                    {tt('configure_missing_preset')}
                  </div>
                )}

                {selectedPresetId && (
                  <div className='space-y-6'>
                    <div className='flex flex-col gap-2 text-center'>
                      <h4 className='text-xl font-serif text-white'>
                        {selectedPreset?.title}
                      </h4>
                      <p className='text-sm text-cp-text-muted'>
                        {selectedPreset?.desc}
                      </p>
                    </div>

                    <div className='space-y-3'>
                      <div className='grid grid-cols-1 md:grid-cols-1 gap-4'>
                        {resolvedAvailablePersonas.map((p) => {
                          const isSelected = selectedPersonaId === p.id;
                          return (
                            <div
                              key={p.id}
                              onClick={() => setSelectedPersonaId(p.id)}
                              className={`border core-module-card hover-card p-6 cursor-pointer transition-all flex flex-col gap-3 group relative
                                ${
                                  isSelected
                                    ? 'core-module-card--active bg-cp-dark/50'
                                    : 'bg-transparent hover:border-gray-600'
                                }
                              `}>
                              <div className='flex items-start justify-between gap-4'>
                                <div className='text-left'>
                                  <div
                                    className={`text-base font-serif font-bold ${
                                      isSelected
                                        ? 'text-white'
                                        : 'text-cp-text-muted'
                                    }`}>
                                    {p.title}
                                  </div>
                                  <div className='text-sm text-gray-500 font-sans leading-relaxed'>
                                    {p.desc}
                                  </div>
                                </div>
                                {isSelected && (
                                  <div className='text-cp-yellow shrink-0'>
                                    <Check size={22} />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div className='mt-auto flex justify-center gap-6 pt-6 border-t border-cp-border'>
                  <button
                    onClick={() => setStep('preset')}
                    className='px-8 py-3 btn-outline flex items-center gap-2'>
                    <ChevronLeft size={16} /> {tt('back')}
                  </button>
                  <button
                    onClick={() => setStep('knowledge')}
                    disabled={!isConfigValid()}
                    className='px-8 py-3 btn-gold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'>
                    {tt('next')} <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: KNOWLEDGE */}
          {step === 'knowledge' && (
            <div className='flex-1 flex flex-col p-8 animate-in fade-in slide-in-from-right-8'>
              <div className='text-center mb-8'>
                <h3 className='text-2xl font-serif font-bold text-white mb-2'>
                  {tt('knowledge_title')}
                </h3>
                <p className='text-cp-text-muted font-sans text-sm'>
                  {tt('knowledge_desc')}
                </p>
              </div>

              <div className='max-w-3xl mx-auto w-full flex-1 flex flex-col gap-6'>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className='flex-1 border-2 border-dashed border-cp-border hover:border-cp-yellow bg-cp-dark/10 hover:bg-cp-dark/30 transition-all cursor-pointer flex flex-col items-center justify-center p-12 group'>
                  <input
                    type='file'
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className='hidden'
                    multiple
                  />
                  <div className='w-16 h-16 bg-cp-black border border-cp-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform'>
                    <Upload
                      size={24}
                      className='text-cp-text-muted group-hover:text-cp-yellow'
                    />
                  </div>
                  <h4 className='text-lg font-bold text-cp-text mb-2'>
                    {tt('upload_title')}
                  </h4>
                  <p className='text-sm text-cp-text-muted'>
                    {tt('upload_desc')}
                  </p>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className='border border-cp-border bg-cp-black p-4 max-h-[200px] overflow-y-auto custom-scrollbar'>
                    {uploadedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className='flex items-center justify-between p-3 border-b border-cp-border/50 last:border-0 hover:bg-cp-dim/30'>
                        <div className='flex items-center gap-3'>
                          <FileText size={16} className='text-cp-yellow' />
                          <span className='text-sm text-cp-text'>
                            {file.name}
                          </span>
                          <span className='text-xs text-cp-text-muted'>
                            ({file.size})
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          className='text-cp-text-muted hover:text-cp-red transition-colors'>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className='mt-auto flex justify-center gap-6 pt-6 border-t border-cp-border'>
                <button
                  onClick={() => setStep('configure')}
                  className='px-8 py-3 btn-outline flex items-center gap-2'>
                  <ChevronLeft size={16} /> {tt('back')}
                </button>
                <div className='flex gap-4'>
                  <button
                    onClick={() => submitAgentCreation(true)}
                    disabled={isSubmitting}
                    className='px-8 py-3 btn-outline text-cp-text-muted hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'>
                    {isSubmitting ? tt('creating') : tt('skip')}
                  </button>
                  <button
                    onClick={() => submitAgentCreation(true)}
                    disabled={isSubmitting}
                    className='px-12 py-3 btn-gold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'>
                    {isSubmitting ? tt('creating') : tt('finish_upload')}{' '}
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SIMULATION */}
          {step === 'simulation' && (
            <div className='flex-1 flex flex-col md:flex-row bg-transparent animate-in fade-in slide-in-from-right-8'>
              <div className='w-full md:w-1/3 border-r border-white/[0.02] p-6 flex flex-col bg-white/[0.02]'>
                <div className='mb-6'>
                  <h3 className='text-lg font-serif font-bold text-white mb-4 flex items-center gap-2'>
                    <Clock size={18} className='text-cp-yellow' />{' '}
                    {tt('sim_title')}
                  </h3>
                  <div className='grid grid-cols-2 gap-3'>
                    {(['1w', '1m', '3m', '1y'] as SimDuration[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => setSimDurationMode(d)}
                        disabled={simStatus === 'running'}
                        className={`px-5 py-3 text-sm font-bold transition-all shadow-lg
                                            ${
                                              simDurationMode === d
                                                ? 'bg-cp-yellow text-black scale-105 border-transparent'
                                                : 'bg-black/20 border border-white/[0.02] text-cp-text-muted hover:border-cp-yellow hover:text-white'
                                            }
                                        `}>
                        {tt(`duration_${d}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='flex-1 relative'>
                  <div className='absolute inset-0 border border-white/[0.02] bg-black/50 p-4 font-mono text-xs text-cp-text-muted overflow-y-auto custom-scrollbar'>
                    {simLogs.map((log, i) => (
                      <div key={i} className='mb-1 leading-relaxed opacity-80'>
                        {log}
                      </div>
                    ))}
                    {simStatus === 'running' && (
                      <div className='animate-pulse text-cp-yellow'>
                        {tt('sim_processing')}
                      </div>
                    )}
                  </div>
                </div>

                <div className='mt-6'>
                  {simStatus === 'finished' ? (
                    <button
                      onClick={startSimulation}
                      className='w-full py-4 border border-white/[0.02] text-cp-text-muted hover:text-white hover:border-cp-yellow transition-colors font-bold uppercase tracking-widest flex items-center justify-center gap-2'>
                      <RotateCcw size={18} /> {tt('sim_rerun')}
                    </button>
                  ) : null}
                </div>
              </div>

              <div className='flex-1 relative flex flex-col'>
                <div
                  className='flex-1 relative bg-gradient-to-b from-transparent to-white/[0.02]'
                  ref={chartRef}>
                  {simStatus === 'idle' && (
                    <div className='absolute inset-0 flex items-center justify-center bg-black/40 z-20 backdrop-blur-sm'>
                      <button
                        onClick={startSimulation}
                        className='group relative px-10 py-5 btn-gold text-lg shadow-[0_0_30px_rgba(197,160,89,0.3)] hover:scale-105 transition-transform'>
                        <div className='flex items-center gap-3'>
                          <Play size={24} fill='black' />
                          <span>{tt('sim_start')}</span>
                        </div>
                        <div className='absolute -bottom-8 left-0 w-full text-center text-xs text-white/60 font-mono opacity-0 group-hover:opacity-100 transition-opacity'>
                          {tt('sim_est_time')}
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                <div className='h-24 border-t border-white/[0.02] bg-white/[0.02] flex items-center justify-around px-8'>
                  {[
                    {
                      label: tt('stat_total_return'),
                      val: simResult
                        ? `+${getTotalReturnPct(simResult.duration)}%`
                        : '--',
                      color: 'text-cp-yellow'
                    },
                    {
                      label: tt('stat_max_drawdown'),
                      val: simResult ? '-2.1%' : '--',
                      color: 'text-white'
                    },
                    {
                      label: tt('stat_win_rate'),
                      val: simResult ? '62%' : '--',
                      color: 'text-white'
                    },
                    {
                      label: tt('stat_sharpe'),
                      val: simResult ? '1.85' : '--',
                      color: 'text-white'
                    }
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className={`flex flex-col items-center gap-1 ${
                        !simResult ? 'opacity-50 blur-[2px]' : ''
                      } transition-all`}>
                      <span className='text-[10px] text-cp-text-muted uppercase tracking-widest'>
                        {stat.label}
                      </span>
                      <span
                        className={`text-xl font-bold font-mono ${stat.color}`}>
                        {stat.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'simulation' && (
            <div className='p-4 border-t border-white/[0.02] bg-white/[0.02] flex justify-between items-center shrink-0'>
              <button
                onClick={() => setStep('knowledge')}
                className='px-6 py-2 text-cp-text-muted hover:text-white flex items-center gap-2 text-sm font-bold'>
                <ChevronLeft size={16} /> {tt('adjust_params')}
              </button>
              <button
                onClick={handleFinalDeploy}
                disabled={
                  !hasCreated || simStatus !== 'finished' || isSubmitting
                }
                className='px-10 py-3 btn-gold flex items-center gap-2 disabled:opacity-50 disabled:filter disabled:grayscale'>
                {isSubmitting ? tt('creating') : tt('finish_deploy')}{' '}
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
