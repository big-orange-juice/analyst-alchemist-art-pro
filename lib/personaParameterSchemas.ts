export type SceneKey = 'stock_selection' | 'analysis' | 'trading' | 'review';

export type ParameterType = 'string' | 'number' | 'boolean' | 'json' | 'null';

export type SchemaField = {
  key: string;
  type: ParameterType;
  defaultValue: unknown;
  description?: string;
};

export type SchemaScene = {
  sceneKey: SceneKey;
  sceneNameZh: string;
  subAgentZh: string;
  params: SchemaField[];
};

export type PersonaSchema = {
  personaId: string;
  personaNameZh: string;
  scenes: SchemaScene[];
};

const detectFieldType = (v: unknown): ParameterType => {
  if (v === null) return 'null';
  if (typeof v === 'boolean') return 'boolean';
  if (typeof v === 'number') return 'number';
  if (typeof v === 'string') return 'string';
  if (Array.isArray(v)) return 'json';
  if (typeof v === 'object') return 'json';
  return 'string';
};

const fields = (
  defaults: Record<string, unknown>,
  descriptions?: Record<string, string>
): SchemaField[] =>
  Object.keys(defaults).map((key) => ({
    key,
    defaultValue: defaults[key],
    type: detectFieldType(defaults[key]),
    description: descriptions?.[key]
  }));

// 注意：以下内容由《投资风格-场景-子Agent-参数完整映射表.md》手动固化而来。
// 目的：不在运行时从文件/网络加载 MD；直接用静态 schema 渲染表单。

export const PERSONA_PARAMETER_SCHEMAS: Record<string, PersonaSchema> = {
  aggressive_growth: {
    personaId: 'aggressive_growth',
    personaNameZh: '赛道激进型',
    scenes: [
      {
        sceneKey: 'stock_selection',
        sceneNameZh: '选股场景',
        subAgentZh: '基本面分析师',
        params: fields(
          {
            roe_min: 15.0,
            revenue_growth_min: 20.0,
            net_profit_growth_min: 15.0,
            gross_margin_min: 30.0,
            pe_max: 50.0,
            pb_max: 8.0,
            peg_max: 2.0,
            price_change_3m_min: 10.0,
            rsi_min: 50.0,
            ma5_above_ma20: true,
            liquidity_min: 500000000,
            turnover_rate_min: 2.0,
            industries: ['科技', '消费', '医药'],
            volatility_30d_max: 40.0,
            max_drawdown_3m_max: -25.0
          },
          {
            roe_min: 'ROE ≥ 15%',
            revenue_growth_min: '营收增速 ≥ 20%',
            net_profit_growth_min: '净利润增速 ≥ 15%',
            gross_margin_min: '毛利率 ≥ 30%',
            pe_max: 'PE ≤ 50 (可接受高估值)',
            pb_max: 'PB ≤ 8',
            peg_max: 'PEG ≤ 2',
            price_change_3m_min: '近3月涨幅 ≥ 10% (动量因子)',
            rsi_min: 'RSI ≥ 50 (强势)',
            ma5_above_ma20: '5日线 > 20日线',
            liquidity_min: '日成交额 ≥ 5亿',
            turnover_rate_min: '换手率 ≥ 2%',
            volatility_30d_max: '30日波动率 ≤ 40%',
            max_drawdown_3m_max: '3月最大回撤 ≤ 25%'
          }
        )
      },
      {
        sceneKey: 'analysis',
        sceneNameZh: '分析场景',
        subAgentZh: '基本面分析师',
        params: fields(
          {
            fundamental_weight: 0.6,
            technical_weight: 0.3,
            growth_vs_value: 90,
            valuation_sensitivity: 30,
            focus_metrics: [
              'roe_trend',
              'revenue_growth_trend',
              'market_share',
              'competitive_advantage'
            ],
            analysis_depth: '标准',
            include_industry_comparison: true
          },
          {
            fundamental_weight: '基本面权重 60%',
            technical_weight: '技术面权重 30%',
            growth_vs_value: '极度偏好成长 (0-100)',
            valuation_sensitivity: '对估值不敏感',
            analysis_depth: '标准/深度',
            include_industry_comparison: '包含行业对比'
          }
        )
      },
      {
        sceneKey: 'trading',
        sceneNameZh: '交易场景',
        subAgentZh: '交易员',
        params: fields(
          {
            max_position_pct: 20.0,
            position_sizing_method: '凯利公式',
            max_sector_exposure: 50.0,
            stop_loss_pct: -15.0,
            stop_loss_strategy: '跟踪止损',
            take_profit_pct: 30.0,
            trailing_stop_pct: 10.0,
            trade_urgency: '较急',
            execution_strategy: 'TWAP',
            slippage_tolerance: 2.0,
            split_orders: 3
          },
          {
            max_position_pct: '单只最大仓位 20%',
            max_sector_exposure: '单行业最大暴露 50%',
            stop_loss_pct: '止损 -15%',
            stop_loss_strategy: '跟踪止损',
            take_profit_pct: '止盈 +30%',
            trailing_stop_pct: '移动止损 10%',
            trade_urgency: '较急',
            execution_strategy: '时间加权平均',
            slippage_tolerance: '滑点容忍 2%',
            split_orders: '分3批执行'
          }
        )
      },
      {
        sceneKey: 'review',
        sceneNameZh: '复盘场景',
        subAgentZh: '投资经理',
        params: fields(
          {
            review_metrics: [
              'total_return',
              'benchmark_return',
              'alpha',
              'sharpe_ratio',
              'max_drawdown',
              'win_rate'
            ],
            attribution_analysis: true,
            sector_contribution: true,
            rebalance_threshold: 0.1,
            max_turnover: 0.5,
            return_target: 40.0,
            max_drawdown_tolerance: -30.0
          },
          {
            attribution_analysis: '业绩归因',
            sector_contribution: '行业贡献分析',
            rebalance_threshold: '偏离10%时再平衡',
            max_turnover: '最大换手率 50%',
            return_target: '年化收益目标 40%',
            max_drawdown_tolerance: '最大回撤容忍 -30%'
          }
        )
      }
    ]
  },

  conservative_value: {
    personaId: 'conservative_value',
    personaNameZh: '稳健价值型',
    scenes: [
      {
        sceneKey: 'stock_selection',
        sceneNameZh: '选股场景',
        subAgentZh: '基本面分析师',
        params: fields({
          roe_min: 12.0,
          roa_min: 8.0,
          revenue_growth_min: 5.0,
          gross_margin_min: 25.0,
          pb_max: 0.8,
          pe_max: 10.0,
          peg_max: 1.0,
          dividend_yield_min: 5.0,
          payout_ratio_min: 30.0,
          payout_ratio_max: 70.0,
          consecutive_dividend_years_min: 10,
          debt_ratio_max: 50.0,
          current_ratio_min: 1.5,
          quick_ratio_min: 1.0,
          interest_coverage_min: 5.0,
          market_cap_min: 100000000000,
          price_change_3m_max: 5.0,
          volatility_30d_max: 25.0,
          industries: ['金融', '消费', '公用']
        })
      },
      {
        sceneKey: 'analysis',
        sceneNameZh: '分析场景',
        subAgentZh: '基本面分析师',
        params: fields({
          fundamental_weight: 0.8,
          technical_weight: 0.1,
          growth_vs_value: 20,
          valuation_sensitivity: 90,
          dividend_importance: 80,
          focus_metrics: [
            'dividend_sustainability',
            'valuation_percentile',
            'financial_stability',
            'debt_level'
          ]
        })
      },
      {
        sceneKey: 'trading',
        sceneNameZh: '交易场景',
        subAgentZh: '风险经理',
        params: fields({
          max_position_pct: 10.0,
          position_sizing_method: '等权重',
          max_sector_exposure: 30.0,
          stop_loss_pct: -20.0,
          stop_loss_strategy: '固定比例',
          take_profit_pct: null,
          trade_urgency: '不急',
          slippage_tolerance: 0.5,
          correlation_control: true,
          max_correlation: 0.7,
          rebalance_threshold: 0.15,
          rebalance_frequency: '季度'
        })
      },
      {
        sceneKey: 'review',
        sceneNameZh: '复盘场景',
        subAgentZh: '投资经理',
        params: fields({
          review_metrics: [
            'total_return',
            'dividend_income',
            'benchmark_return',
            'volatility',
            'max_drawdown'
          ],
          return_target: 15.0,
          max_drawdown_tolerance: -15.0,
          rebalance_strategy: '价值回归',
          dividend_reinvest: true
        })
      }
    ]
  },

  quantitative: {
    personaId: 'quantitative',
    personaNameZh: '量化策略型',
    scenes: [
      {
        sceneKey: 'stock_selection',
        sceneNameZh: '选股场景',
        subAgentZh: '技术分析师',
        params: fields(
          {
            quality_factor_weight: 0.3,
            momentum_factor_weight: 0.3,
            value_factor_weight: 0.2,
            low_volatility_weight: 0.2,
            roe_min: 10.0,
            roa_min: 6.0,
            gross_margin_min: 20.0,
            asset_turnover_min: 0.5,
            price_change_1m_min: 0.0,
            price_change_3m_min: 5.0,
            price_change_6m_min: 10.0,
            rsi_min: 40.0,
            rsi_max: 70.0,
            macd_histogram_positive: true,
            ma5_above_ma20: true,
            ma20_above_ma60: true,
            kdj_k_min: 20.0,
            kdj_k_max: 80.0,
            volume_ma5_ratio_min: 1.2,
            turnover_rate_min: 1.5,
            liquidity_min: 1000000000,
            pe_percentile_max: 70.0,
            pb_percentile_max: 70.0,
            quality_score_min: 70.0,
            momentum_score_min: 60.0,
            value_score_min: 50.0,
            industries: ['科技', '金融', '消费', '周期'],
            max_industry_concentration: 0.3
          },
          {
            liquidity_min: '≥ 10亿',
            max_industry_concentration: '单行业 < 30%'
          }
        )
      },
      {
        sceneKey: 'analysis',
        sceneNameZh: '分析场景',
        subAgentZh: '技术分析师',
        params: fields({
          fundamental_weight: 0.3,
          technical_weight: 0.7,
          technical_indicators: [
            'MACD',
            'RSI',
            'KDJ',
            '均线系统',
            '布林带',
            'ATR'
          ],
          chart_patterns: ['突破形态', '金叉死叉', '支撑阻力'],
          quantitative_signals: ['多因子评分', '动量信号', '反转信号']
        })
      },
      {
        sceneKey: 'trading',
        sceneNameZh: '交易场景',
        subAgentZh: '交易员',
        params: fields({
          max_position_pct: 15.0,
          position_sizing_method: '风险平价',
          stop_loss_pct: -10.0,
          take_profit_pct: 20.0,
          execution_strategy: '算法交易',
          trade_signals: ['模型信号', '技术信号', '量价信号'],
          risk_management: {
            max_leverage: 1.0,
            var_limit: 0.05,
            stress_test: true
          }
        })
      },
      {
        sceneKey: 'review',
        sceneNameZh: '复盘场景',
        subAgentZh: '首席投资官',
        params: fields({
          review_metrics: [
            '策略收益率',
            '信息比率',
            '最大回撤',
            '夏普比率',
            '卡尔玛比率'
          ],
          factor_performance: {
            quality_factor_return: 0.0,
            momentum_factor_return: 0.0,
            value_factor_return: 0.0,
            low_vol_factor_return: 0.0
          },
          model_optimization: true,
          parameter_tuning: true,
          backtest_validation: true,
          rebalance_frequency: '月度'
        })
      }
    ]
  },

  dividend_focus: {
    personaId: 'dividend_focus',
    personaNameZh: '红利收益型',
    scenes: [
      {
        sceneKey: 'stock_selection',
        sceneNameZh: '选股场景',
        subAgentZh: '基本面分析师',
        params: fields({
          dividend_yield_min: 4.0,
          payout_ratio_min: 30.0,
          payout_ratio_max: 70.0,
          consecutive_dividend_years_min: 10,
          dividend_growth_rate_min: 0.0,
          roe_min: 12.0,
          roa_min: 7.0,
          net_margin_min: 12.0,
          debt_ratio_max: 40.0,
          current_ratio_min: 1.5,
          interest_coverage_min: 6.0,
          operating_cash_flow_positive: true,
          free_cash_flow_positive: true,
          cash_flow_per_share_min: 1.0,
          pe_max: 15.0,
          pb_max: 1.5,
          quality_score_min: 85.0,
          market_cap_min: 50000000000,
          volatility_30d_max: 20.0,
          max_drawdown_1y_max: -20.0,
          beta_max: 0.7,
          industries: ['金融', '公用', '消费']
        })
      },
      {
        sceneKey: 'analysis',
        sceneNameZh: '分析场景',
        subAgentZh: '基本面分析师',
        params: fields({
          fundamental_weight: 0.9,
          dividend_importance: 90,
          focus_metrics: [
            'dividend_yield',
            'dividend_payout_ratio',
            'dividend_sustainability',
            'free_cash_flow',
            'debt_level'
          ],
          analysis_focus: '分红可持续性分析'
        })
      },
      {
        sceneKey: 'trading',
        sceneNameZh: '交易场景',
        subAgentZh: '风险经理',
        params: fields({
          max_position_pct: 8.0,
          stop_loss_pct: -25.0,
          take_profit_pct: null,
          dividend_reinvest: true,
          trade_frequency: '极低',
          risk_metrics: ['分红覆盖率', '财务安全边际', '现金流稳定性']
        })
      },
      {
        sceneKey: 'review',
        sceneNameZh: '复盘场景',
        subAgentZh: '投资经理',
        params: fields({
          review_metrics: ['分红收益率', '资本利得', '总回报率', '波动率'],
          dividend_tracking: {
            actual_dividend_yield: 0.0,
            expected_dividend_yield: 4.0,
            dividend_growth: 0.0
          },
          return_target: 12.0,
          dividend_target: 4.0
        })
      }
    ]
  },

  momentum_trader: {
    personaId: 'momentum_trader',
    personaNameZh: '趋势动量型',
    scenes: [
      {
        sceneKey: 'stock_selection',
        sceneNameZh: '选股场景',
        subAgentZh: '技术分析师',
        params: fields({
          price_change_1w_min: 5.0,
          price_change_1m_min: 20.0,
          price_change_3m_min: 30.0,
          new_high_20d: true,
          price_above_ma60: true,
          rsi_min: 50.0,
          rsi_max: 85.0,
          macd_signal: 'strong_golden_cross',
          macd_histogram_growing: true,
          ma5_above_ma20: true,
          ma20_above_ma60: true,
          ma60_above_ma120: true,
          kdj_j_min: 80.0,
          volume_ratio_min: 1.5,
          volume_ma5_ratio_min: 1.8,
          turnover_rate_min: 3.0,
          liquidity_min: 1000000000,
          amplitude_min: 3.0,
          volatility_30d_min: 20.0,
          sentiment_score_min: 0.7,
          news_sentiment_positive: true,
          industries: ['科技', '新能源', '消费', '医药'],
          industry_momentum_min: 0.6
        })
      },
      {
        sceneKey: 'analysis',
        sceneNameZh: '分析场景',
        subAgentZh: '技术分析师',
        params: fields({
          fundamental_weight: 0.2,
          technical_weight: 0.8,
          technical_focus: ['趋势强度', '支撑阻力位', '买卖信号', '形态识别'],
          momentum_indicators: ['价格动量', '量能动量', '行业动量']
        })
      },
      {
        sceneKey: 'trading',
        sceneNameZh: '交易场景',
        subAgentZh: '交易员',
        params: fields({
          max_position_pct: 25.0,
          stop_loss_pct: -8.0,
          take_profit_pct: 50.0,
          trailing_stop_pct: 15.0,
          add_position_on_profit: true,
          execution_strategy: '快速执行',
          trade_timing: '追涨或回调买入',
          exit_signals: ['技术破位', '量能萎缩', '趋势反转']
        })
      },
      {
        sceneKey: 'review',
        sceneNameZh: '复盘场景',
        subAgentZh: '技术分析师',
        params: fields({
          review_focus: ['买入时机准确性', '卖出时机准确性', '止损执行情况'],
          technical_review: {
            entry_point_accuracy: 0.0,
            exit_point_accuracy: 0.0,
            false_breakout_rate: 0.0
          },
          strategy_optimization: [
            '优化入场信号',
            '优化止损位置',
            '优化仓位管理'
          ]
        })
      }
    ]
  },

  contrarian: {
    personaId: 'contrarian',
    personaNameZh: '逆向投资型',
    scenes: [
      {
        sceneKey: 'stock_selection',
        sceneNameZh: '选股场景',
        subAgentZh: '基本面分析师',
        params: fields({
          price_change_1m_max: -10.0,
          price_change_3m_max: -20.0,
          price_change_6m_max: -30.0,
          pb_percentile_max: 30.0,
          pe_percentile_max: 30.0,
          pb_below_historical_avg: true,
          roe_min: 12.0,
          roa_min: 6.0,
          gross_margin_min: 20.0,
          debt_ratio_max: 60.0,
          current_ratio_min: 1.2,
          revenue_growth_min: -5.0,
          net_profit_growth_min: -10.0,
          sentiment_score_max: 0.3,
          news_sentiment: 'negative',
          analyst_rating_avg_max: 3.0,
          rsi_max: 30.0,
          price_below_ma250: true,
          macd_signal: 'death_cross',
          industries: ['金融', '消费', '医药', '周期'],
          quality_score_min: 70.0
        })
      },
      {
        sceneKey: 'analysis',
        sceneNameZh: '分析场景',
        subAgentZh: '基本面分析师',
        params: fields({
          fundamental_weight: 0.8,
          growth_vs_value: 30,
          analysis_focus: [
            '公司真实价值',
            '下跌原因分析',
            '反转可能性',
            '安全边际'
          ],
          contrarian_signals: ['市场过度悲观', '基本面未恶化', '估值极度低估']
        })
      },
      {
        sceneKey: 'trading',
        sceneNameZh: '交易场景',
        subAgentZh: '风险经理',
        params: fields({
          max_position_pct: 15.0,
          stop_loss_pct: -25.0,
          take_profit_pct: 100.0,
          add_position_on_decline: true,
          entry_strategy: '分批建仓',
          patience_required: true,
          risk_control: {
            max_single_loss: -5.0,
            max_portfolio_loss: -15.0
          }
        })
      },
      {
        sceneKey: 'review',
        sceneNameZh: '复盘场景',
        subAgentZh: '投资经理',
        params: fields({
          review_focus: ['逆向判断准确性', '反转是否到来', '持仓耐心'],
          contrarian_performance: {
            successful_reversals: 0,
            failed_reversals: 0,
            average_holding_period: 0
          },
          lessons_learned: ['抄底时机', '基本面恶化识别', '止损纪律']
        })
      }
    ]
  },

  balanced: {
    personaId: 'balanced',
    personaNameZh: '均衡配置型',
    scenes: [
      {
        sceneKey: 'stock_selection',
        sceneNameZh: '选股场景',
        subAgentZh: '投资经理',
        params: fields({
          roe_min: 10.0,
          roa_min: 5.0,
          revenue_growth_min: 10.0,
          net_profit_growth_min: 8.0,
          gross_margin_min: 25.0,
          pe_max: 30.0,
          pb_max: 3.0,
          peg_max: 1.5,
          dividend_yield_min: 2.0,
          debt_ratio_max: 55.0,
          current_ratio_min: 1.3,
          price_change_3m_min: -5.0,
          price_change_3m_max: 30.0,
          rsi_min: 40.0,
          rsi_max: 70.0,
          liquidity_min: 300000000,
          volatility_30d_max: 30.0,
          max_drawdown_3m_max: -20.0,
          beta_min: 0.8,
          beta_max: 1.2,
          industries: ['科技', '消费', '医药', '金融'],
          max_industry_concentration: 0.35,
          asset_allocation: {
            growth_stocks: 0.3,
            value_stocks: 0.3,
            dividend_stocks: 0.2,
            cash: 0.2
          }
        })
      },
      {
        sceneKey: 'analysis',
        sceneNameZh: '分析场景',
        subAgentZh: '基本面分析师',
        params: fields({
          fundamental_weight: 0.5,
          technical_weight: 0.3,
          macro_weight: 0.2,
          balanced_analysis: [
            '基本面评估',
            '技术面验证',
            '估值合理性',
            '风险收益比'
          ]
        })
      },
      {
        sceneKey: 'trading',
        sceneNameZh: '交易场景',
        subAgentZh: '投资经理',
        params: fields({
          max_position_pct: 12.0,
          stop_loss_pct: -12.0,
          take_profit_pct: 25.0,
          rebalance_frequency: '季度',
          rebalance_trigger: '偏离目标配置15%',
          trade_strategy: '价值回归 + 趋势跟随',
          risk_balance: {
            max_sector_exposure: 35.0,
            max_style_exposure: 40.0,
            correlation_limit: 0.6
          }
        })
      },
      {
        sceneKey: 'review',
        sceneNameZh: '复盘场景',
        subAgentZh: '投资经理',
        params: fields({
          review_metrics: [
            '总收益率',
            '各类资产贡献',
            '再平衡效果',
            '风险调整后收益'
          ],
          asset_performance: {
            growth_return: 0.0,
            value_return: 0.0,
            dividend_return: 0.0
          },
          rebalance_review: {
            rebalance_times: 0,
            rebalance_benefit: 0.0
          },
          return_target: 18.0,
          max_drawdown_tolerance: -20.0
        })
      }
    ]
  }
};
