import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import GlobalConfirmModal from '@/components/GlobalConfirmModal';

export const metadata: Metadata = {
  title: 'Analyst Alchemist',
  description: 'Financial Intelligence Matrix - Deploy AI Agents for Trading'
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
