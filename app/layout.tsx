import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import GlobalConfirmModal from '@/components/GlobalConfirmModal';

export const metadata: Metadata = {
  title: 'Analyst Alchemist',
  description:
    'Stock assistant platform - build agents, backtest strategies, and join activities'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='zh-CN' suppressHydrationWarning>
      <body>
        <div className='texture-overlay' />
        <GlobalConfirmModal />
        {children}
      </body>
    </html>
  );
}
