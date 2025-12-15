export const stock_analysis_panel = {
  zh: {
    symbol_options: [
      { value: '000859.SZ', label: '中信国安（000859.SZ）' },
      { value: '600519.SH', label: '贵州茅台（600519.SH）' },
      { value: '300750.SZ', label: '宁德时代（300750.SZ）' }
    ],
    news_source_ph: 'Bloomberg / 同花顺 / 自定义'
  },
  en: {
    symbol_options: [
      { value: '000859.SZ', label: 'CITIC Guoan (000859.SZ)' },
      { value: '600519.SH', label: 'Kweichow Moutai (600519.SH)' },
      { value: '300750.SZ', label: 'CATL (300750.SZ)' }
    ],
    news_source_ph: 'Bloomberg / Reuters / Custom'
  }
} as const;
