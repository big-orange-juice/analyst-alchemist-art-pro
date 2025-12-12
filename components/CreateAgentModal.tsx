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
  title: string;
  desc: string;
  icon: typeof Shield;
  stats: AgentStats;
  defaultPrompt: string;
}

const WORKFLOW_PRESETS: WorkflowPreset[] = [
  {
    id: 'track_thinking',
    title: '赛道激进型',
    desc: '追求高成长赛道，愿意承担高风险。30-40岁，有一定投资经验。',
    icon: Shield,
    stats: { intelligence: 75, speed: 30, risk: 70 },
    defaultPrompt: `你是一名赛道激进型投资者，追求高成长赛道机会，愿意承担更高波动风险。`
  },
  {
    id: 'quant_thinking',
    title: '稳健价值型',
    desc: '偏好成熟赛道龙头，低估值高分红。45-60岁，投资经验丰富。',
    icon: Activity,
    stats: { intelligence: 65, speed: 70, risk: 50 },
    defaultPrompt: `你是一名稳健价值型投资者，偏好成熟龙头与高分红资产，重视安全边际与现金流。`
  },
  {
    id: 'news_thinking',
    title: '红利收益型',
    desc: '关注高股息赛道，追求稳定现金流。50岁以上，接近退休。',
    icon: Zap,
    stats: { intelligence: 70, speed: 50, risk: 60 },
    defaultPrompt: `你是一名红利收益型投资者，关注高股息资产与稳定现金流，强调长期持有与回撤控制。`
  }
];

const PERSONA_PRESETS: Record<
  WorkflowId,
  Array<{ id: PersonaId; title: string; desc: string }>
> = {
  track_thinking: [
    {
      id: 'aggressive_growth',
      title: 'aggressive_growth',
      desc: '偏进攻：更关注高成长与赛道弹性。'
    },
    {
      id: 'conservative_value',
      title: 'conservative_value',
      desc: '偏防守：更关注稳健价值与风险控制。'
    },
    {
      id: 'dividend_focus',
      title: 'dividend_focus',
      desc: '偏红利：更关注股息率与稳定现金流。'
    }
  ],
  quant_thinking: [
    {
      id: 'quantitative',
      title: 'quantitative',
      desc: '量化策略型：基于数据与模型，严格执行纪律。'
    },
    {
      id: 'momentum_trader',
      title: 'momentum_trader',
      desc: '趋势动量型：追涨强势股，跟随市场热点。'
    }
  ],
  news_thinking: [
    {
      id: 'contrarian',
      title: 'contrarian',
      desc: '逆向投资型：别人恐惧时贪婪，寻找被错杀机会。'
    },
    {
      id: 'balanced',
      title: 'balanced',
      desc: '均衡配置型：综合多个维度，分散配置。'
    }
  ]
};

interface SimResultData {
  duration: string;
  equityCurve: number[];
}

type SimDuration = '1周' | '1月' | '3月' | '1年';
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
  const { currentUser } = useUserStore();
  const {
    agentName,
    agentClass,
    agentId,
    setAgentId,
    setAgentName,
    setAgentClass
  } = useAgentStore();
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
  const [simDurationMode, setSimDurationMode] = useState<SimDuration>('1周');
  const [simStatus, setSimStatus] = useState<'idle' | 'running' | 'finished'>(
    'idle'
  );
  const [simLogs, setSimLogs] = useState<string[]>([
    '> 系统就绪...',
    '> 请选择回测周期并启动。'
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

  const selectedPreset = WORKFLOW_PRESETS.find(
    (p) => p.id === selectedPresetId
  );

  const availablePersonas =
    selectedPresetId && selectedPresetId in PERSONA_PRESETS
      ? PERSONA_PRESETS[selectedPresetId as WorkflowId]
      : [];

  const handlePresetSelect = (presetId: WorkflowId) => {
    setSelectedPresetId(presetId);
    setSelectedPersonaId('');
    const preset = WORKFLOW_PRESETS.find((p) => p.id === presetId);
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
      '> 初始化回测环境...',
      '> 加载历史数据...',
      `> 设置回测周期: ${simDurationMode}`,
      '> 开始执行策略模拟...'
    ]);
    setSimResult(null);

    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (Math.random() > 0.6) {
        setSimLogs((prev) => [
          ...prev,
          `> 模拟交易日 Day ${count}: 信号检测中...`
        ]);
      }
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setSimStatus('finished');
      setSimLogs((prev) => [...prev, '> 回测完成。', '> 生成分析报告...']);
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
      onCreate(
        existingAgent.agent_id ?? null,
        existingAgent.agent_name,
        '',
        preset.title,
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

    if (!currentUser) {
      onNotify?.('缺少用户信息', '请先登录以创建 Agent。', 'error');
      return;
    }

    const payload = {
      agent_name: name,
      workflow_id: selectedPresetId,
      persona_id: selectedPersonaId
    };

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/v2/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || '创建 Agent 失败');
      }

      const result = await response.json().catch(() => ({ id: null }));
      const createdId = result?.id != null ? String(result.id) : null;

      onCreate(
        createdId,
        name,
        customPrompt,
        selectedPreset?.title ?? selectedPresetId,
        selectedPreset.stats,
        []
      );
      setHasCreated(true);
      onNotify?.('创建成功', 'Agent 已成功创建并部署。', 'success');
      if (goToSimulation) setStep('simulation');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '创建 Agent 时出现错误';
      onNotify?.('创建失败', message, 'error');
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
        return '初始化身份';
      case 'preset':
        return '工作流选择';
      case 'configure':
        return '人格选择';
      case 'knowledge':
        return '知识库接入';
      case 'simulation':
        return '回测模拟';
      default:
        return '';
    }
  };

  const isConfigValid = () => !!selectedPresetId && !!selectedPersonaId;

  return (
    <div className='fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 modal-animate'>
      <div className='w-full md:max-w-5xl h-[85vh] glass-panel border border-white/[0.02] flex flex-col shadow-2xl relative'>
        {/* Header */}
        <div className='flex justify-between items-center p-6 border-b border-white/[0.02] bg-white/[0.02] shrink-0'>
          <div className='flex items-center gap-4'>
            <div className='w-10 h-10 border border-white/[0.02] flex items-center justify-center text-cp-yellow bg-white/[0.02]'>
              <Cpu size={20} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className='text-xl font-bold font-serif text-white tracking-wide'>
                {getStepTitle()}
              </h2>
              <p className='text-xs text-cp-text-muted font-sans uppercase tracking-widest mt-1'>
                Step {getStepNumber()} / 05
              </p>
              {existingAgent && (
                <div className='mt-2 text-xs text-cp-text-muted'>
                  已有 Agent:{' '}
                  <span className='text-white'>{existingAgent.agent_name}</span>{' '}
                  · 流程{' '}
                  <span className='text-cp-yellow font-mono'>
                    {existingAgent.workflow_id}
                  </span>{' '}
                  · 风险
                  <span className='text-cp-yellow font-mono'>
                    {' '}
                    {existingAgent.risk_profile}
                  </span>
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
                    初始化唯一 ID
                  </h3>
                  <p className='text-cp-text-muted font-sans font-light'>
                    此名称将作为该智能体在 Matrix 网络中的唯一标识。
                  </p>
                </div>

                <div className='relative group hover-card p-4 border border-transparent'>
                  <input
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='输入代号'
                    className='w-full bg-transparent border-b border-cp-border py-4 text-center text-2xl font-serif text-cp-yellow focus:border-cp-yellow focus:outline-none placeholder-gray-800 transition-colors uppercase tracking-widest'
                    maxLength={15}
                    autoFocus
                  />
                </div>

                <button
                  onClick={() => setStep('preset')}
                  disabled={!name.trim()}
                  className='w-full py-4 btn-gold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'>
                  下一步: 选择工作流 <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PRESET */}
          {step === 'preset' && (
            <div className='flex-1 flex flex-col p-8 animate-in fade-in slide-in-from-right-8 overflow-y-auto'>
              <div className='text-center mb-10'>
                <h3 className='text-2xl font-serif font-bold text-white mb-2'>
                  选择工作流（workflow_id）
                </h3>
                <p className='text-cp-text-muted font-sans text-sm'>
                  Step2 选择 workflow_id，Step3 将根据 workflow_id 提供
                  persona_id。
                </p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full mb-10'>
                {WORKFLOW_PRESETS.map((preset) => {
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
                  <ChevronLeft size={16} /> 返回
                </button>
                <button
                  onClick={() => setStep('configure')}
                  disabled={!selectedPresetId}
                  className='px-8 py-3 btn-gold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'>
                  下一步 <ChevronRight size={16} />
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
                    请先在上一步选择 workflow_id。
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
                      <div className='text-xs font-bold text-cp-text-muted uppercase tracking-widest'>
                        选择 persona_id
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {availablePersonas.map((p) => {
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
                    <ChevronLeft size={16} /> 返回
                  </button>
                  <button
                    onClick={() => setStep('knowledge')}
                    disabled={!isConfigValid()}
                    className='px-8 py-3 btn-gold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'>
                    下一步 <ChevronRight size={16} />
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
                  知识库接入 (可选)
                </h3>
                <p className='text-cp-text-muted font-sans text-sm'>
                  上传私有文档以增强 Agent 的分析能力。
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
                    点击或拖拽上传文件
                  </h4>
                  <p className='text-sm text-cp-text-muted'>
                    支持 PDF, TXT, MD, CSV 格式 (最大 20MB)
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
                  <ChevronLeft size={16} /> 返回
                </button>
                <div className='flex gap-4'>
                  <button
                    onClick={() => submitAgentCreation(true)}
                    disabled={isSubmitting}
                    className='px-8 py-3 btn-outline text-cp-text-muted hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'>
                    {isSubmitting ? '创建中...' : '跳过'}
                  </button>
                  <button
                    onClick={() => submitAgentCreation(true)}
                    disabled={isSubmitting}
                    className='px-12 py-3 btn-gold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'>
                    {isSubmitting ? '创建中...' : '完成上传'}{' '}
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
                    <Clock size={18} className='text-cp-yellow' /> 回测周期
                  </h3>
                  <div className='grid grid-cols-2 gap-3'>
                    {(['1周', '1月', '3月', '1年'] as SimDuration[]).map(
                      (d) => (
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
                          {d}
                        </button>
                      )
                    )}
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
                        {' '}
                        处理中...
                      </div>
                    )}
                  </div>
                </div>

                <div className='mt-6'>
                  {simStatus === 'finished' ? (
                    <button
                      onClick={startSimulation}
                      className='w-full py-4 border border-white/[0.02] text-cp-text-muted hover:text-white hover:border-cp-yellow transition-colors font-bold uppercase tracking-widest flex items-center justify-center gap-2'>
                      <RotateCcw size={18} /> 重新回测
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
                          <span>开始模拟回测</span>
                        </div>
                        <div className='absolute -bottom-8 left-0 w-full text-center text-xs text-white/60 font-mono opacity-0 group-hover:opacity-100 transition-opacity'>
                          EST. TIME: 3s
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                <div className='h-24 border-t border-white/[0.02] bg-white/[0.02] flex items-center justify-around px-8'>
                  {[
                    {
                      label: '总收益',
                      val: simResult
                        ? `+${simResult.duration === '1周' ? '3.2' : '15.4'}%`
                        : '--',
                      color: 'text-cp-yellow'
                    },
                    {
                      label: '最大回撤',
                      val: simResult ? '-2.1%' : '--',
                      color: 'text-white'
                    },
                    {
                      label: '胜率',
                      val: simResult ? '62%' : '--',
                      color: 'text-white'
                    },
                    {
                      label: '夏普比率',
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
                <ChevronLeft size={16} /> 调整参数
              </button>
              <button
                onClick={handleFinalDeploy}
                disabled={
                  !hasCreated || simStatus !== 'finished' || isSubmitting
                }
                className='px-10 py-3 btn-gold flex items-center gap-2 disabled:opacity-50 disabled:filter disabled:grayscale'>
                {isSubmitting ? '创建中...' : '完成部署'}{' '}
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
