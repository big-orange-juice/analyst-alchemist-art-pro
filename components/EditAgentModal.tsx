'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { X, User, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';
import { apiFetch } from '@/lib/http';
import {
  PERSONA_PARAMETER_SCHEMAS,
  type PersonaSchema,
  type SceneKey,
  type ParameterType,
  type SchemaField
} from '@/lib/personaParameterSchemas';

type ParameterRow = {
  id: string;
  key: string;
  type: ParameterType;
  valueText: string;
  valueBool: boolean;
  valueStringArray: string[];
  stringArrayOptions: string[];
  objectSubRows: ObjectSubRow[];
  description?: string;
};

type ObjectSubRowType = 'string' | 'number' | 'boolean' | 'null';

type ObjectSubRow = {
  id: string;
  key: string;
  type: ObjectSubRowType;
  valueText: string;
  valueBool: boolean;
};

type CachedAgentInfo = {
  personaId: string | null;
  personaParameters: Record<string, unknown> | null;
};

// 说明：开发环境 React StrictMode 可能导致组件 mount 两次，从而触发重复请求。
// 这里用模块级 cache/inFlight 做去重（短 TTL），确保不会连续打两次相同接口。
const AGENT_FETCH_TTL_MS = 5000;
const agentFetchCache = new Map<
  string,
  { ts: number; info: CachedAgentInfo }
>();
const agentFetchInFlight = new Map<string, Promise<CachedAgentInfo>>();

const extractAgentFromListResponse = (data: any) => {
  return Array.isArray(data)
    ? data[0]
    : Array.isArray(data?.agents)
    ? data.agents[0]
    : null;
};

const normalizeAgentInfo = (agent: any): CachedAgentInfo => {
  const pid = String(agent?.persona_id ?? agent?.personaId ?? '').trim();
  const pp = (agent?.persona_parameters ?? agent?.personaParameters ?? null) as
    | Record<string, unknown>
    | null
    | undefined;

  return {
    personaId: pid || null,
    personaParameters:
      pp && typeof pp === 'object' && !Array.isArray(pp) ? pp : null
  };
};

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');

const uniqueStrings = (arr: string[]) => Array.from(new Set(arr));

const isPlainObject = (v: unknown): v is Record<string, unknown> => {
  if (!v || typeof v !== 'object') return false;
  if (Array.isArray(v)) return false;
  return true;
};

const detectSubType = (v: unknown): ObjectSubRowType | null => {
  if (v === null) return 'null';
  if (typeof v === 'boolean') return 'boolean';
  if (typeof v === 'number') return 'number';
  if (typeof v === 'string') return 'string';
  return null;
};

const canRenderAsObjectSubForm = (v: unknown): v is Record<string, unknown> => {
  if (!isPlainObject(v)) return false;
  for (const value of Object.values(v)) {
    if (detectSubType(value) === null) return false;
  }
  return true;
};

const getSceneParametersObject = (
  scenarioValue: unknown
): Record<string, unknown> | null => {
  // 期望新结构：{ reason, agent_role, display_name, parameters: {...} }
  if (!isPlainObject(scenarioValue)) return null;

  const maybeParams = (scenarioValue as any)?.parameters;
  if (isPlainObject(maybeParams)) return maybeParams as Record<string, unknown>;

  // 兼容旧结构：scenarios[scene] 直接是参数对象
  return scenarioValue as Record<string, unknown>;
};

const buildScenarioWrapperForSave = (
  existingScenarioValue: unknown,
  parameters: Record<string, unknown>
): Record<string, unknown> => {
  // 如果原来就是 wrapper（含 meta 字段或 parameters），则保留元信息并覆盖 parameters
  if (isPlainObject(existingScenarioValue)) {
    const metaKeys = new Set([
      'reason',
      'agent_role',
      'display_name',
      'agentRole',
      'displayName',
      'parameters'
    ]);

    const hasMetaOrParams = Object.keys(existingScenarioValue).some((k) =>
      metaKeys.has(k)
    );

    if (hasMetaOrParams) {
      return {
        ...(existingScenarioValue as any),
        parameters
      };
    }
  }

  // 否则按新结构最低要求输出：{ parameters: {...} }
  return { parameters };
};

const translateKeyToZh = (key: string): string => {
  const k = String(key || '').trim();
  if (!k) return '参数';

  const direct: Record<string, string> = {
    roe_min: 'ROE 最小值',
    roa_min: 'ROA 最小值',
    revenue_growth_min: '营收增速最小值',
    net_profit_growth_min: '净利润增速最小值',
    gross_margin_min: '毛利率最小值',
    net_margin_min: '净利率最小值',
    pe_max: 'PE 最大值',
    pb_max: 'PB 最大值',
    peg_max: 'PEG 最大值',
    dividend_yield_min: '股息率最小值',
    dividend_growth_rate_min: '分红增长率最小值',
    payout_ratio_min: '分红支付率最小值',
    payout_ratio_max: '分红支付率最大值',
    consecutive_dividend_years_min: '连续分红年数最小值',
    debt_ratio_max: '资产负债率最大值',
    current_ratio_min: '流动比率最小值',
    quick_ratio_min: '速动比率最小值',
    interest_coverage_min: '利息保障倍数最小值',
    market_cap_min: '市值最小值',
    liquidity_min: '日成交额最小值',
    turnover_rate_min: '换手率最小值',
    volatility_30d_max: '30日波动率最大值',
    volatility_30d_min: '30日波动率最小值',
    max_drawdown_3m_max: '近3月最大回撤上限',
    max_drawdown_1y_max: '近1年最大回撤上限',
    max_drawdown_tolerance: '最大回撤容忍度',
    beta_max: 'Beta 最大值',
    beta_min: 'Beta 最小值',
    industries: '行业偏好',
    max_industry_concentration: '单行业集中度上限',
    rsi_min: 'RSI 最小值',
    rsi_max: 'RSI 最大值',
    macd_histogram_positive: 'MACD 柱为正',
    ma5_above_ma20: '5日均线高于20日均线',
    ma20_above_ma60: '20日均线高于60日均线',
    ma60_above_ma120: '60日均线高于120日均线',
    price_above_ma60: '价格高于60日均线',
    price_below_ma250: '价格低于250日均线',
    new_high_20d: '创20日新高',
    kdj_k_min: 'KDJ-K 最小值',
    kdj_k_max: 'KDJ-K 最大值',
    kdj_j_min: 'KDJ-J 最小值',
    volume_ratio_min: '量比最小值',
    volume_ma5_ratio_min: '成交量/5日均量最小比值',
    fundamental_weight: '基本面权重',
    technical_weight: '技术面权重',
    macro_weight: '宏观权重',
    growth_vs_value: '成长/价值偏好',
    valuation_sensitivity: '估值敏感度',
    dividend_importance: '分红重要性',
    focus_metrics: '关注指标',
    analysis_depth: '分析深度',
    include_industry_comparison: '包含行业对比',
    analysis_focus: '分析重点',
    technical_indicators: '技术指标',
    chart_patterns: '形态识别',
    quantitative_signals: '量化信号',
    review_metrics: '复盘指标',
    review_focus: '复盘关注点',
    attribution_analysis: '业绩归因分析',
    sector_contribution: '行业贡献分析',
    rebalance_threshold: '再平衡阈值',
    rebalance_frequency: '再平衡频率',
    rebalance_strategy: '再平衡策略',
    rebalance_trigger: '再平衡触发条件',
    max_turnover: '最大换手率',
    return_target: '收益目标',
    max_position_pct: '单只最大仓位',
    position_sizing_method: '仓位管理方法',
    max_sector_exposure: '单行业最大暴露',
    stop_loss_pct: '止损比例',
    stop_loss_strategy: '止损策略',
    take_profit_pct: '止盈比例',
    trailing_stop_pct: '移动止损/止盈比例',
    trade_urgency: '交易紧急程度',
    execution_strategy: '执行策略',
    slippage_tolerance: '滑点容忍度',
    split_orders: '分单次数',
    correlation_control: '相关性控制',
    max_correlation: '最大相关系数',
    risk_metrics: '风险指标',
    dividend_reinvest: '分红再投资',
    trade_frequency: '交易频率',
    dividend_tracking: '分红跟踪',
    actual_dividend_yield: '实际股息率',
    expected_dividend_yield: '预期股息率',
    dividend_growth: '分红增长',
    price_change_1w_min: '近1周涨幅最小值',
    price_change_1m_min: '近1月涨幅最小值',
    price_change_3m_min: '近3月涨幅最小值',
    price_change_3m_max: '近3月涨幅最大值',
    price_change_6m_min: '近6月涨幅最小值',
    price_change_1m_max: '近1月跌幅阈值',
    price_change_3m_max__down: '近3月跌幅阈值',
    price_change_6m_max__down: '近6月跌幅阈值',
    amplitude_min: '振幅最小值',
    sentiment_score_min: '情绪分数最小值',
    sentiment_score_max: '情绪分数最大值',
    news_sentiment_positive: '新闻情绪为正',
    news_sentiment: '新闻情绪',
    analyst_rating_avg_max: '分析师评级均值上限',
    macd_signal: 'MACD 信号',
    quality_factor_weight: '质量因子权重',
    momentum_factor_weight: '动量因子权重',
    value_factor_weight: '价值因子权重',
    low_volatility_weight: '低波因子权重',
    asset_turnover_min: '资产周转率最小值',
    pe_percentile_max: 'PE 分位数上限',
    pb_percentile_max: 'PB 分位数上限',
    pb_percentile_max__low: 'PB 分位数上限',
    pb_below_historical_avg: 'PB 低于历史均值',
    quality_score_min: '质量评分最小值',
    momentum_score_min: '动量评分最小值',
    value_score_min: '价值评分最小值',
    quality_score_min__alt: '质量评分最小值',
    model_optimization: '模型优化',
    parameter_tuning: '参数调优',
    backtest_validation: '回测验证',
    factor_performance: '因子表现',
    risk_management: '风险管理',
    quality_factor_return: '质量因子收益',
    momentum_factor_return: '动量因子收益',
    value_factor_return: '价值因子收益',
    low_vol_factor_return: '低波因子收益',
    max_leverage: '最大杠杆',
    var_limit: 'VaR 限制',
    stress_test: '压力测试',
    trade_signals: '交易信号',
    add_position_on_profit: '盈利加仓',
    trade_timing: '交易时机',
    exit_signals: '退出信号',
    add_position_on_decline: '下跌加仓',
    entry_strategy: '入场策略',
    patience_required: '需要耐心',
    risk_control: '风险控制',
    max_single_loss: '单笔最大亏损',
    max_portfolio_loss: '组合最大亏损',
    contrarian_signals: '逆向信号',
    contrarian_performance: '逆向表现',
    successful_reversals: '成功反转次数',
    failed_reversals: '失败反转次数',
    average_holding_period: '平均持有期',
    lessons_learned: '经验总结',
    technical_review: '技术复盘',
    entry_point_accuracy: '入场点准确性',
    exit_point_accuracy: '出场点准确性',
    false_breakout_rate: '假突破率',
    strategy_optimization: '策略优化',
    asset_allocation: '资产配置',
    growth_stocks: '成长股占比',
    value_stocks: '价值股占比',
    dividend_stocks: '红利股占比',
    cash: '现金占比',
    balanced_analysis: '均衡分析维度',
    trade_strategy: '交易策略',
    risk_balance: '风险平衡',
    max_style_exposure: '最大风格暴露',
    correlation_limit: '相关性上限',
    asset_performance: '资产表现',
    growth_return: '成长收益',
    value_return: '价值收益',
    dividend_return: '红利收益',
    rebalance_review: '再平衡复盘',
    rebalance_times: '再平衡次数',
    rebalance_benefit: '再平衡收益贡献'
  };

  if (direct[k]) return direct[k];

  // 兜底：保证 label 始终为中文
  return '参数设置';
};

const safeJsonStringify = (v: unknown) => {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return '';
  }
};

interface EditAgentModalProps {
  agentId?: string;
  userId?: string;
  agentName: string;
  personaId: string;
  initialPersonaParameters?: Record<string, unknown> | null;
  onSave: (personaParameters: Record<string, unknown>) => void | Promise<void>;
  onClose: () => void;
}

export default function EditAgentModal({
  agentId,
  userId,
  agentName,
  personaId,
  initialPersonaParameters,
  onSave,
  onClose
}: EditAgentModalProps) {
  const { t } = useLanguage();
  const tt = useCallback((key: string) => t(`edit_agent.${key}`), [t]);

  const [loadingAgent, setLoadingAgent] = useState(false);
  const [remotePersonaId, setRemotePersonaId] = useState<string | null>(null);
  const [remotePersonaParameters, setRemotePersonaParameters] = useState<Record<
    string,
    unknown
  > | null>(null);

  const [schema, setSchema] = useState<PersonaSchema | null>(null);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSceneKey, setActiveSceneKey] = useState<SceneKey | null>(null);

  const [sceneRows, setSceneRows] = useState<Record<SceneKey, ParameterRow[]>>({
    stock_selection: [],
    analysis: [],
    trading: [],
    review: []
  });

  useEffect(() => {
    const resolvedUserId = String(userId ?? '').trim();
    const id = String(agentId ?? '').trim();

    // 如果外部显式传了 userId（Dashboard 场景），但此时还没准备好，先不要请求。
    // 否则会先用 agentId 请求一次，随后 userId 出现又请求一次。
    const hasUserIdProp = userId !== undefined;
    if (hasUserIdProp && !resolvedUserId) {
      setLoadingAgent(false);
      return;
    }

    if (!resolvedUserId && !id) {
      setRemotePersonaId(null);
      setRemotePersonaParameters(null);
      setLoadingAgent(false);
      return;
    }

    const fetchKey = resolvedUserId ? `user:${resolvedUserId}` : `id:${id}`;
    const now = Date.now();
    const cached = agentFetchCache.get(fetchKey);
    if (cached && now - cached.ts < AGENT_FETCH_TTL_MS) {
      setRemotePersonaId(cached.info.personaId);
      setRemotePersonaParameters(cached.info.personaParameters);
      setLoadingAgent(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoadingAgent(true);
      try {
        const existingInFlight = agentFetchInFlight.get(fetchKey);
        const promise =
          existingInFlight ??
          (async () => {
            const data = resolvedUserId
              ? await apiFetch<any>(
                  `/api/agents?user_id=${encodeURIComponent(
                    resolvedUserId
                  )}&skip=0&limit=1`,
                  {
                    method: 'GET',
                    errorHandling: 'ignore'
                  }
                )
              : await apiFetch<any>(`/api/agents/${encodeURIComponent(id)}`, {
                  method: 'GET',
                  errorHandling: 'ignore'
                });

            const agent = resolvedUserId
              ? extractAgentFromListResponse(data)
              : data;
            const info = normalizeAgentInfo(agent);

            agentFetchCache.set(fetchKey, { ts: Date.now(), info });
            return info;
          })();

        if (!existingInFlight) agentFetchInFlight.set(fetchKey, promise);
        const info = await promise;

        if (cancelled) return;

        setRemotePersonaId(info.personaId);
        setRemotePersonaParameters(info.personaParameters);
      } catch {
        if (cancelled) return;
        setRemotePersonaId(null);
        setRemotePersonaParameters(null);
      } finally {
        agentFetchInFlight.delete(fetchKey);
        if (cancelled) return;
        setLoadingAgent(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [agentId, userId]);

  const effectivePersonaId = useMemo(() => {
    const pid = String(remotePersonaId || personaId || '').trim();
    return pid;
  }, [remotePersonaId, personaId]);

  const initialParams = useMemo(() => {
    return remotePersonaParameters ?? initialPersonaParameters ?? {};
  }, [remotePersonaParameters, initialPersonaParameters]);

  useEffect(() => {
    setLoadingSchema(true);
    setError(null);

    const pid = String(effectivePersonaId || '').trim();
    if (!pid) {
      setSchema(null);
      setSceneRows({
        stock_selection: [],
        analysis: [],
        trading: [],
        review: []
      });
      setLoadingSchema(false);
      setError(tt('persona_missing'));
      return;
    }

    const nextSchema = PERSONA_PARAMETER_SCHEMAS[pid] ?? null;
    if (!nextSchema) {
      setSchema(null);
      setSceneRows({
        stock_selection: [],
        analysis: [],
        trading: [],
        review: []
      });
      setLoadingSchema(false);
      setError(tt('schema_load_failed'));
      return;
    }

    setSchema(nextSchema);
    setActiveSceneKey(nextSchema.scenes?.[0]?.sceneKey ?? null);

    const pickExistingSceneObj = (
      key: SceneKey
    ): Record<string, unknown> | null => {
      const scenarios = (initialParams as any)?.scenarios;
      const fromScenarios = isPlainObject(scenarios)
        ? (scenarios as any)[key]
        : null;
      const maybeParamsFromScenarios = getSceneParametersObject(fromScenarios);
      if (maybeParamsFromScenarios) return maybeParamsFromScenarios;

      // 兼容旧结构：scene 直接挂在根上
      const v = (initialParams as any)?.[key];
      if (v && typeof v === 'object' && !Array.isArray(v)) return v as any;
      return null;
    };

    const buildRow = (
      field: SchemaField,
      existingValue: unknown,
      idx: number
    ): ParameterRow => {
      const type = field.type;
      const id = `${field.key}-${idx}-${Date.now()}`;

      const emptyArrayMeta = {
        valueStringArray: [] as string[],
        stringArrayOptions: [] as string[]
      };

      const emptyObjectMeta = {
        objectSubRows: [] as ObjectSubRow[]
      };

      if (type === 'boolean') {
        return {
          id,
          key: field.key,
          type,
          valueText: '',
          valueBool: Boolean(existingValue ?? field.defaultValue),
          ...emptyArrayMeta,
          ...emptyObjectMeta,
          description: field.description
        };
      }

      if (type === 'null') {
        return {
          id,
          key: field.key,
          type,
          valueText: '',
          valueBool: false,
          ...emptyArrayMeta,
          ...emptyObjectMeta,
          description: field.description
        };
      }

      if (type === 'number') {
        const v = existingValue ?? field.defaultValue;
        return {
          id,
          key: field.key,
          type,
          valueText:
            typeof v === 'number' && Number.isFinite(v)
              ? String(v)
              : typeof v === 'string'
              ? v
              : '',
          valueBool: false,
          ...emptyArrayMeta,
          ...emptyObjectMeta,
          description: field.description
        };
      }

      if (type === 'json') {
        const v = existingValue ?? field.defaultValue;

        // 数组字段：checkbox 展示，保存为 string[]
        if (isStringArray(v)) {
          const defaults = isStringArray(field.defaultValue)
            ? field.defaultValue
            : [];
          const options = uniqueStrings([...(defaults || []), ...v]);
          return {
            id,
            key: field.key,
            type,
            valueText: '',
            valueBool: false,
            valueStringArray: uniqueStrings(v),
            stringArrayOptions: options,
            ...emptyObjectMeta,
            description: field.description
          };
        }

        // 对象字段：做成子表单（仅支持 value 为 string/number/boolean/null 的扁平对象）
        if (canRenderAsObjectSubForm(v)) {
          const subRows: ObjectSubRow[] = Object.keys(v).map(
            (subKey, subIdx) => {
              const subVal = (v as any)[subKey];
              const subType = detectSubType(subVal) ?? 'string';
              return {
                id: `${field.key}.${subKey}-${subIdx}-${Date.now()}`,
                key: subKey,
                type: subType,
                valueText:
                  subType === 'number'
                    ? String(subVal)
                    : subType === 'string'
                    ? String(subVal)
                    : '',
                valueBool: subType === 'boolean' ? Boolean(subVal) : false
              };
            }
          );

          return {
            id,
            key: field.key,
            type,
            valueText: '',
            valueBool: false,
            ...emptyArrayMeta,
            objectSubRows: subRows,
            description: field.description
          };
        }

        return {
          id,
          key: field.key,
          type,
          valueText: safeJsonStringify(v) || '{}',
          valueBool: false,
          ...emptyArrayMeta,
          ...emptyObjectMeta,
          description: field.description
        };
      }

      const v = existingValue ?? field.defaultValue;
      return {
        id,
        key: field.key,
        type,
        valueText: typeof v === 'string' ? v : v == null ? '' : String(v),
        valueBool: false,
        valueStringArray: [],
        stringArrayOptions: [],
        objectSubRows: [],
        description: field.description
      };
    };

    const next: Record<SceneKey, ParameterRow[]> = {
      stock_selection: [],
      analysis: [],
      trading: [],
      review: []
    };

    for (const s of nextSchema.scenes || []) {
      const existingSceneObj = pickExistingSceneObj(s.sceneKey);
      next[s.sceneKey] = (s.params || []).map((f, idx) => {
        const existingVal = existingSceneObj
          ? (existingSceneObj as any)[f.key]
          : (initialParams as any)?.[f.key];
        return buildRow(f, existingVal, idx);
      });
    }

    setSceneRows(next);
    setLoadingSchema(false);
  }, [effectivePersonaId, initialParams, tt]);

  const isSaveDisabled =
    loadingAgent || loadingSchema || !schema || Boolean(error);

  const buildSceneObject = (
    rows: ParameterRow[]
  ): Record<string, unknown> | null => {
    const next: Record<string, unknown> = {};
    const seen = new Set<string>();

    for (const r of rows) {
      const key = r.key.trim();
      if (!key) {
        setError(tt('error_key_required'));
        return null;
      }
      if (seen.has(key)) {
        setError(tt('error_key_duplicate'));
        return null;
      }
      seen.add(key);

      if (r.type === 'boolean') {
        next[key] = r.valueBool;
        continue;
      }
      if (r.type === 'null') {
        next[key] = null;
        continue;
      }
      if (r.type === 'number') {
        const n = Number(r.valueText);
        if (!Number.isFinite(n)) {
          setError(tt('error_number_invalid').replace('{key}', key));
          return null;
        }
        next[key] = n;
        continue;
      }
      if (r.type === 'json') {
        if (r.stringArrayOptions && r.stringArrayOptions.length > 0) {
          next[key] = r.valueStringArray;
          continue;
        }
        if (r.objectSubRows && r.objectSubRows.length > 0) {
          const obj: Record<string, unknown> = {};
          const seenSub = new Set<string>();

          for (const sr of r.objectSubRows) {
            const subKey = String(sr.key || '').trim();
            if (!subKey) {
              setError(tt('error_key_required'));
              return null;
            }
            if (seenSub.has(subKey)) {
              setError(tt('error_key_duplicate'));
              return null;
            }
            seenSub.add(subKey);

            if (sr.type === 'boolean') {
              obj[subKey] = sr.valueBool;
              continue;
            }
            if (sr.type === 'null') {
              obj[subKey] = null;
              continue;
            }
            if (sr.type === 'number') {
              const n = Number(sr.valueText);
              if (!Number.isFinite(n)) {
                setError(
                  tt('error_number_invalid').replace(
                    '{key}',
                    `${key}.${subKey}`
                  )
                );
                return null;
              }
              obj[subKey] = n;
              continue;
            }
            obj[subKey] = sr.valueText;
          }

          next[key] = obj;
          continue;
        }

        const raw = r.valueText.trim();
        if (!raw) {
          setError(tt('error_json_required').replace('{key}', key));
          return null;
        }
        try {
          next[key] = JSON.parse(raw);
        } catch {
          setError(tt('error_json_invalid').replace('{key}', key));
          return null;
        }
        continue;
      }

      next[key] = r.valueText;
    }

    return next;
  };

  const buildPayload = (): Record<string, unknown> | null => {
    setError(null);

    const stock = buildSceneObject(sceneRows.stock_selection);
    if (!stock) return null;
    const analysis = buildSceneObject(sceneRows.analysis);
    if (!analysis) return null;
    const trading = buildSceneObject(sceneRows.trading);
    if (!trading) return null;
    const review = buildSceneObject(sceneRows.review);
    if (!review) return null;

    const base =
      initialParams && typeof initialParams === 'object'
        ? { ...(initialParams as any) }
        : {};

    // 新结构：四个场景统一放入 scenarios 对象
    // payload: { seed: ..., scenarios: { stock_selection, analysis, trading, review } }
    const {
      stock_selection: _legacyStock,
      analysis: _legacyAnalysis,
      trading: _legacyTrading,
      review: _legacyReview,
      scenarios: _legacyScenarios,
      ...rest
    } = base as any;

    const nextScenarios =
      _legacyScenarios &&
      typeof _legacyScenarios === 'object' &&
      !Array.isArray(_legacyScenarios)
        ? { ..._legacyScenarios }
        : {};

    // 对齐获取 agent 的数据结构：scenarios[scene] 是 wrapper，参数放在 parameters 字段
    (nextScenarios as any).stock_selection = buildScenarioWrapperForSave(
      (nextScenarios as any).stock_selection,
      stock
    );
    (nextScenarios as any).analysis = buildScenarioWrapperForSave(
      (nextScenarios as any).analysis,
      analysis
    );
    (nextScenarios as any).trading = buildScenarioWrapperForSave(
      (nextScenarios as any).trading,
      trading
    );
    (nextScenarios as any).review = buildScenarioWrapperForSave(
      (nextScenarios as any).review,
      review
    );

    return {
      ...(rest as any),
      scenarios: nextScenarios
    };
  };

  const updateRow = (
    sceneKey: SceneKey,
    rowId: string,
    patch: Partial<ParameterRow>
  ) => {
    setSceneRows((prev) => ({
      ...prev,
      [sceneKey]: prev[sceneKey].map((r) =>
        r.id === rowId
          ? {
              ...r,
              ...patch
            }
          : r
      )
    }));
    setError(null);
  };

  const updateSubRow = (
    sceneKey: SceneKey,
    rowId: string,
    subRowId: string,
    patch: Partial<ObjectSubRow>
  ) => {
    setSceneRows((prev) => ({
      ...prev,
      [sceneKey]: prev[sceneKey].map((r) => {
        if (r.id !== rowId) return r;
        return {
          ...r,
          objectSubRows: (r.objectSubRows || []).map((sr) =>
            sr.id === subRowId
              ? {
                  ...sr,
                  ...patch
                }
              : sr
          )
        };
      })
    }));
    setError(null);
  };

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-xl bg-black/70 p-4 modal-animate'>
      <div className='w-full md:max-w-4xl h-[90vh] glass-panel border-2 border-cp-yellow ring-1 ring-cp-yellow flex flex-col shadow-2xl relative'>
        <div className='flex justify-between items-center p-6 border-b border-cp-border bg-white/[0.02] shrink-0'>
          <div className='flex items-center gap-3'>
            <User className='text-cp-yellow' size={24} strokeWidth={1.5} />
            <div>
              <h2 className='text-xl font-bold font-serif text-white uppercase tracking-wider'>
                {tt('title')}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-white transition-colors'>
            <X size={24} />
          </button>
        </div>

        <div className='flex-1 overflow-auto px-8 py-6'>
          <div className='w-full max-w-2xl mx-auto space-y-4'>
            <div className='text-xs text-cp-text-muted tracking-widest uppercase'>
              {agentName}
            </div>

            {loadingSchema && (
              <div className='text-sm text-cp-text-muted'>
                {tt('schema_loading')}
              </div>
            )}
            {loadingAgent && (
              <div className='text-sm text-cp-text-muted'>
                {tt('agent_loading')}
              </div>
            )}
            {!loadingSchema && schema && activeSceneKey && (
              <div className='space-y-4'>
                {/* 步骤导航 */}
                <div className='flex flex-wrap gap-2'>
                  {(schema.scenes || []).map((s, idx) => {
                    const isActive = s.sceneKey === activeSceneKey;
                    return (
                      <button
                        key={s.sceneKey}
                        onClick={() => setActiveSceneKey(s.sceneKey)}
                        className={`flex-1 min-w-[100px] px-3 py-2 rounded-lg border text-sm transition-colors ${
                          isActive
                            ? 'border-cp-yellow text-white bg-cp-yellow/20'
                            : 'border-cp-border text-cp-text-muted hover:border-cp-yellow/60'
                        }`}>
                        <div className='font-semibold'>第{idx + 1}步</div>
                        <div className='text-xs'>{s.sceneNameZh}</div>
                      </button>
                    );
                  })}
                </div>

                {/* 当前场景标题 */}
                {schema.scenes
                  .filter((s) => s.sceneKey === activeSceneKey)
                  .map((s) => (
                    <div key={s.sceneKey} className='space-y-4'>
                      <div className='border-b border-cp-border pb-3'>
                        <div className='text-lg font-serif font-bold text-white'>
                          {s.sceneNameZh}
                        </div>
                        <div className='text-xs text-cp-text-muted'>
                          {tt('sub_agent')}: {s.subAgentZh}
                        </div>
                      </div>

                      {/* 表单字段 - label:input 形式 */}
                      <div className='space-y-2'>
                        {(sceneRows[s.sceneKey] || []).map((r) => {
                          const labelZh =
                            r.description || translateKeyToZh(r.key);
                          return (
                            <div key={r.id} className='flex gap-4 items-start'>
                              {/* Left: label */}
                              <div className='w-[220px] shrink-0'>
                                <div className='text-sm text-white leading-5'>
                                  {labelZh}
                                </div>
                                <div className='text-[11px] font-mono text-cp-yellow/60'>
                                  {r.key}
                                </div>
                              </div>

                              {/* Right: input */}
                              <div className='flex-1'>
                                {r.type === 'boolean' ? (
                                  <div className='flex items-center gap-6 border border-cp-border rounded-lg px-3 py-2'>
                                    <label className='flex items-center gap-2 text-sm text-cp-text select-none'>
                                      <input
                                        type='radio'
                                        name={`bool-${r.id}`}
                                        checked={r.valueBool === true}
                                        onChange={() =>
                                          updateRow(s.sceneKey, r.id, {
                                            valueBool: true
                                          })
                                        }
                                        className='accent-cp-yellow'
                                      />
                                      <span>是</span>
                                    </label>
                                    <label className='flex items-center gap-2 text-sm text-cp-text select-none'>
                                      <input
                                        type='radio'
                                        name={`bool-${r.id}`}
                                        checked={r.valueBool === false}
                                        onChange={() =>
                                          updateRow(s.sceneKey, r.id, {
                                            valueBool: false
                                          })
                                        }
                                        className='accent-cp-yellow'
                                      />
                                      <span>否</span>
                                    </label>
                                  </div>
                                ) : r.type === 'json' &&
                                  r.objectSubRows &&
                                  r.objectSubRows.length > 0 ? (
                                  <div className='border border-cp-border rounded-lg p-3 space-y-2'>
                                    {r.objectSubRows.map((sr) => {
                                      const subLabel = translateKeyToZh(sr.key);
                                      return (
                                        <div
                                          key={sr.id}
                                          className='flex gap-3 items-start'>
                                          <div className='w-[180px] shrink-0'>
                                            <div className='text-sm text-white leading-5'>
                                              {subLabel}
                                            </div>
                                            <div className='text-[11px] font-mono text-cp-yellow/60'>
                                              {sr.key}
                                            </div>
                                          </div>
                                          <div className='flex-1'>
                                            {sr.type === 'boolean' ? (
                                              <div className='flex items-center gap-6 border border-cp-border rounded-lg px-3 py-2'>
                                                <label className='flex items-center gap-2 text-sm text-cp-text select-none'>
                                                  <input
                                                    type='radio'
                                                    name={`sub-bool-${sr.id}`}
                                                    checked={
                                                      sr.valueBool === true
                                                    }
                                                    onChange={() =>
                                                      updateSubRow(
                                                        s.sceneKey,
                                                        r.id,
                                                        sr.id,
                                                        { valueBool: true }
                                                      )
                                                    }
                                                    className='accent-cp-yellow'
                                                  />
                                                  <span>是</span>
                                                </label>
                                                <label className='flex items-center gap-2 text-sm text-cp-text select-none'>
                                                  <input
                                                    type='radio'
                                                    name={`sub-bool-${sr.id}`}
                                                    checked={
                                                      sr.valueBool === false
                                                    }
                                                    onChange={() =>
                                                      updateSubRow(
                                                        s.sceneKey,
                                                        r.id,
                                                        sr.id,
                                                        { valueBool: false }
                                                      )
                                                    }
                                                    className='accent-cp-yellow'
                                                  />
                                                  <span>否</span>
                                                </label>
                                              </div>
                                            ) : sr.type === 'null' ? (
                                              <input
                                                value='null'
                                                readOnly
                                                className='w-full bg-transparent border border-cp-border rounded-lg px-3 py-2 text-sm text-cp-text-muted focus:outline-none'
                                              />
                                            ) : (
                                              <input
                                                value={sr.valueText}
                                                onChange={(e) =>
                                                  updateSubRow(
                                                    s.sceneKey,
                                                    r.id,
                                                    sr.id,
                                                    {
                                                      valueText: e.target.value
                                                    }
                                                  )
                                                }
                                                className='w-full bg-transparent border border-cp-border rounded-lg px-3 py-2 text-sm text-cp-text focus:border-cp-yellow focus:outline-none transition-colors'
                                                placeholder={
                                                  sr.type === 'number'
                                                    ? '输入数字'
                                                    : '输入内容'
                                                }
                                                inputMode={
                                                  sr.type === 'number'
                                                    ? 'decimal'
                                                    : undefined
                                                }
                                              />
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : r.type === 'json' &&
                                  r.stringArrayOptions &&
                                  r.stringArrayOptions.length > 0 ? (
                                  <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                                    {r.stringArrayOptions.map((opt) => {
                                      const checked =
                                        r.valueStringArray.includes(opt);
                                      return (
                                        <label
                                          key={opt}
                                          className='flex items-center gap-2 text-sm text-cp-text select-none'>
                                          <input
                                            type='checkbox'
                                            checked={checked}
                                            onChange={(e) => {
                                              const next = e.target.checked
                                                ? [...r.valueStringArray, opt]
                                                : r.valueStringArray.filter(
                                                    (x) => x !== opt
                                                  );
                                              updateRow(s.sceneKey, r.id, {
                                                valueStringArray: next
                                              });
                                            }}
                                            className='accent-cp-yellow'
                                          />
                                          <span className='truncate'>
                                            {opt}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                ) : r.type === 'json' ? (
                                  <textarea
                                    value={r.valueText}
                                    onChange={(e) =>
                                      updateRow(s.sceneKey, r.id, {
                                        valueText: e.target.value
                                      })
                                    }
                                    className='w-full bg-transparent border border-cp-border rounded-lg px-3 py-2 text-sm font-mono text-cp-text focus:border-cp-yellow focus:outline-none min-h-[80px] transition-colors'
                                    spellCheck={false}
                                    placeholder='{}'
                                  />
                                ) : r.type === 'null' ? (
                                  <input
                                    value='null'
                                    readOnly
                                    className='w-full bg-transparent border border-cp-border rounded-lg px-3 py-2 text-sm text-cp-text-muted focus:outline-none'
                                  />
                                ) : (
                                  <input
                                    value={r.valueText}
                                    onChange={(e) =>
                                      updateRow(s.sceneKey, r.id, {
                                        valueText: e.target.value
                                      })
                                    }
                                    className='w-full bg-transparent border border-cp-border rounded-lg px-3 py-2 text-sm text-cp-text focus:border-cp-yellow focus:outline-none transition-colors'
                                    placeholder={
                                      r.type === 'number'
                                        ? '输入数字'
                                        : '输入内容'
                                    }
                                    inputMode={
                                      r.type === 'number'
                                        ? 'decimal'
                                        : undefined
                                    }
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* 固定底部按钮区域 */}
        <div className='shrink-0 border-t border-cp-border bg-white/[0.02] p-6 space-y-3'>
          {error && (
            <div className='text-center text-sm text-cp-red'>{error}</div>
          )}

          {/* 步骤导航按钮 */}
          <div className='flex justify-between items-center'>
            <button
              disabled={
                !schema?.scenes || schema.scenes[0]?.sceneKey === activeSceneKey
              }
              onClick={() => {
                if (!schema?.scenes) return;
                const idx = schema.scenes.findIndex(
                  (s) => s.sceneKey === activeSceneKey
                );
                if (idx > 0) setActiveSceneKey(schema.scenes[idx - 1].sceneKey);
              }}
              className='px-6 py-2 rounded-lg border border-cp-border text-sm text-cp-text-muted disabled:opacity-30 hover:border-cp-yellow/60 transition-colors'>
              上一步
            </button>
            <div className='text-xs text-cp-text-muted'>
              {schema?.scenes
                ? schema.scenes.findIndex(
                    (s) => s.sceneKey === activeSceneKey
                  ) + 1
                : 0}
              /{schema?.scenes?.length || 0}
            </div>
            <button
              disabled={
                !schema?.scenes ||
                schema.scenes[schema.scenes.length - 1]?.sceneKey ===
                  activeSceneKey
              }
              onClick={() => {
                if (!schema?.scenes) return;
                const idx = schema.scenes.findIndex(
                  (s) => s.sceneKey === activeSceneKey
                );
                if (idx >= 0 && idx + 1 < schema.scenes.length) {
                  setActiveSceneKey(schema.scenes[idx + 1].sceneKey);
                }
              }}
              className='px-6 py-2 rounded-lg border border-cp-yellow text-sm text-white bg-cp-yellow/20 disabled:opacity-30 transition-colors'>
              下一步
            </button>
          </div>

          {/* 保存按钮 */}
          <button
            onClick={async () => {
              if (isSaveDisabled) return;
              const payload = buildPayload();
              if (!payload) return;

              await onSave(payload);
              onClose();
            }}
            disabled={
              isSaveDisabled ||
              !schema ||
              activeSceneKey !==
                schema.scenes?.[schema.scenes.length - 1]?.sceneKey
            }
            className={`w-full py-4 btn-gold flex items-center justify-center gap-2 text-base font-semibold ${
              isSaveDisabled ||
              !schema ||
              activeSceneKey !==
                schema.scenes?.[schema.scenes.length - 1]?.sceneKey
                ? 'opacity-60 cursor-not-allowed'
                : ''
            }`}>
            {tt('save')} <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
