import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import {
  JetBrains_Mono,
  Noto_Sans_SC,
  Noto_Serif_SC,
  Space_Grotesk
} from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk'
});

const notoSans = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans'
});

const notoSerif = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-serif'
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono'
});

export const metadata: Metadata = {
  title: 'Analyst Alchemist',
  description: 'Financial Intelligence Matrix - Deploy AI Agents for Trading'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='zh-CN' suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${notoSans.variable} ${notoSerif.variable} ${jetbrains.variable}`}>
        <div className='texture-overlay' />
        {children}
      </body>
    </html>
  );
}
