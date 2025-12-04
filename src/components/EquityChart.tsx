'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import type { ComposeOption, ECharts } from 'echarts/core';
import { LineChart, type LineSeriesOption } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  DatasetComponent,
  type GridComponentOption,
  type TooltipComponentOption
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ChartDataPoint } from '@/types';

echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  DatasetComponent,
  CanvasRenderer
]);

type ECOption = ComposeOption<
  LineSeriesOption | GridComponentOption | TooltipComponentOption
>;

interface EquityChartProps {
  data: ChartDataPoint[];
  highlightedAgent?: string | null;
  onChartClick?: (agentName: string) => void;
  onChartHover?: (agentName: string | null) => void;
  theme?: 'dark' | 'light';
}

const FALLBACK_AGENT_COLORS = [
  '#C5A059',
  '#E07A5F',
  '#8DA399',
  '#6D7E8C',
  '#D4B483',
  '#BC8034',
  '#8F5D5D',
  '#5F6F65'
];

const GILDED_RED_COLORS = ['#F25C54', '#FF8F70', '#FFC27A', '#F5A55C'];
const GILDED_GREEN_COLORS = ['#3CBF88', '#5ED9A0', '#8BE5B1', '#BFF3C7'];

export default function EquityChart({
  data,
  highlightedAgent,
  onChartClick,
  onChartHover,
  theme = 'dark'
}: EquityChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ECharts | null>(null);
  const [localHighlight, setLocalHighlight] = useState<string | null>(null);
  const [hoverHighlight, setHoverHighlight] = useState<string | null>(null);

  useEffect(() => {
    setLocalHighlight(highlightedAgent ?? null);
  }, [highlightedAgent]);

  const seriesOrder = useMemo(() => {
    if (!data.length) return [] as string[];
    const { time, ...rest } = data[data.length - 1];
    return Object.keys(rest);
  }, [data]);

  const colorMap = useMemo(() => {
    const latestPoint = data[data.length - 1];
    const map: Record<string, string> = {};
    seriesOrder.forEach((agent, index) => {
      const rawValue =
        latestPoint && typeof latestPoint[agent] === 'number'
          ? (latestPoint[agent] as number)
          : 100;
      const delta = rawValue - 100;
      const palette = delta >= 0 ? GILDED_RED_COLORS : GILDED_GREEN_COLORS;
      const fallback =
        FALLBACK_AGENT_COLORS[index % FALLBACK_AGENT_COLORS.length];
      map[agent] = palette[index % palette.length] ?? fallback;
    });
    return map;
  }, [seriesOrder, data]);

  const times = useMemo(() => data.map(({ time }) => time), [data]);

  const maxLabelLength = useMemo(
    () => seriesOrder.reduce((max, name) => Math.max(max, name.length), 0),
    [seriesOrder]
  );

  const rightPadding = useMemo(
    () => Math.min(220, Math.max(110, maxLabelLength * 8 + 48)),
    [maxLabelLength]
  );

  const reducedTicks = useMemo(() => {
    const step = Math.max(1, Math.ceil(times.length / 5));
    return new Set(
      times.filter((_, idx) => idx % step === 0 || idx === times.length - 1)
    );
  }, [times]);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = echarts.init(containerRef.current, undefined, {
      renderer: 'canvas'
    });
    chartInstance.current = chart;

    const resizeObserver = new ResizeObserver(() => {
      if (chart.isDisposed()) return;
      const dom = chart.getDom?.();
      if (!dom) return;
      chart.resize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
      chartInstance.current = null;
    };
  }, []);

  const activeHighlight =
    hoverHighlight ?? highlightedAgent ?? localHighlight ?? null;

  const option = useMemo<ECOption | null>(() => {
    if (!times.length || !seriesOrder.length) return null;

    const isLight = theme === 'light';
    const axisColor = isLight ? '#2C2C2C' : 'rgba(255,255,255,0.45)';
    const gridColor = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
    const tooltipBg = isLight ? 'rgba(248,245,236,0.92)' : 'rgba(7,7,8,0.92)';
    const tooltipText = isLight ? '#1f1e22' : '#f4f1ea';

    const series = seriesOrder.map((agent) => {
      const color = colorMap[agent];
      const values = data.map((point) => {
        const raw = Number(point[agent]);
        if (!Number.isFinite(raw)) return null;
        return Number((raw - 100).toFixed(2));
      });
      const isHighlighted = activeHighlight ? agent === activeHighlight : false;

      return {
        name: agent,
        type: 'line',
        data: values,
        connectNulls: true,
        showSymbol: false,
        smooth: false,
        lineStyle: {
          width: activeHighlight ? (isHighlighted ? 3 : 1) : 2,
          color,
          opacity: activeHighlight ? (isHighlighted ? 1 : 0.25) : 0.85
        },
        itemStyle: {
          color,
          opacity: activeHighlight ? (isHighlighted ? 1 : 0.35) : 0.9
        },
        emphasis: {
          focus: 'series',
          lineStyle: {
            width: 3
          }
        },
        blur: {
          lineStyle: {
            opacity: activeHighlight ? 0.15 : 0.35
          },
          itemStyle: {
            opacity: activeHighlight ? 0.15 : 0.35
          }
        },
        endLabel: {
          show: true,
          formatter: () => agent,
          color,
          fontSize: 11,
          fontWeight: 600,
          fontFamily: 'Space Grotesk, sans-serif',
          offset: [12, 0]
        },
        labelLayout: {
          moveOverlap: 'shiftY'
        }
      } satisfies LineSeriesOption;
    });

    return {
      color: seriesOrder.map((agent) => colorMap[agent]),
      grid: {
        left: 48,
        right: rightPadding,
        top: 24,
        bottom: 36
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: tooltipBg,
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 12,
        textStyle: {
          color: tooltipText,
          fontFamily: 'Space Grotesk, "JetBrains Mono", sans-serif',
          fontSize: 12
        },
        valueFormatter: (value: unknown) => {
          const normalized = Array.isArray(value) ? value[0] : value;
          if (typeof normalized === 'number') {
            return `${normalized >= 0 ? '+' : ''}${normalized.toFixed(2)}%`;
          }
          if (typeof normalized === 'string') {
            return normalized;
          }
          return '';
        },
        axisPointer: {
          lineStyle: {
            color: isLight ? '#1f1e22' : 'rgba(255,255,255,0.35)'
          }
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: times,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: axisColor,
          fontSize: 11,
          formatter: (value: string) => (reducedTicks.has(value) ? value : '')
        }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: {
          show: true,
          lineStyle: {
            color: gridColor,
            type: 'dashed'
          }
        },
        axisTick: { show: false },
        axisLabel: {
          color: axisColor,
          fontSize: 11,
          formatter: (value: number) =>
            `${value >= 0 ? '+' : ''}${value.toFixed(0)}%`
        }
      },
      series
    } satisfies ECOption;
  }, [
    times,
    seriesOrder,
    colorMap,
    activeHighlight,
    theme,
    rightPadding,
    reducedTicks,
    data
  ]);

  useEffect(() => {
    if (!chartInstance.current || !option) return;
    chartInstance.current.setOption(option, true);

    const chart = chartInstance.current;
    const clearHover = () => {
      setHoverHighlight(null);
      if (onChartHover) {
        onChartHover(null);
      }
    };

    chart.off('click');
    chart.off('mouseover');
    chart.off('mouseout');
    chart.off('globalout');

    chart.on('click', (params) => {
      if (params?.seriesName) {
        setLocalHighlight(params.seriesName);
        if (onChartClick) {
          onChartClick(params.seriesName);
        }
      }
    });

    chart.on('mouseover', (params) => {
      if (params?.seriesName) {
        setHoverHighlight(params.seriesName);
        if (onChartHover) {
          onChartHover(params.seriesName);
        }
      }
    });

    chart.on('mouseout', () => {
      clearHover();
    });

    chart.on('globalout', clearHover);
  }, [option, onChartClick, onChartHover]);

  return <div ref={containerRef} className='w-full h-full min-h-[300px]' />;
}
