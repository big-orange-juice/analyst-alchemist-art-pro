import { create } from 'zustand';
import type { ChartDataPoint, RankingItem } from '@/types';

interface MarketDataState {
  chartData: ChartDataPoint[];
  rankingList: RankingItem[];
  setChartData: (data: ChartDataPoint[]) => void;
  setRankingList: (list: RankingItem[]) => void;
}

export const useMarketDataStore = create<MarketDataState>((set) => ({
  chartData: [],
  rankingList: [],
  setChartData: (data) => set({ chartData: data }),
  setRankingList: (list) => set({ rankingList: list })
}));
