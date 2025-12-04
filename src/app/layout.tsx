import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Analyst Alchemist',
  description: 'Financial Intelligence Matrix - Deploy AI Agents for Trading',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Serif+SC:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="texture-overlay" />
        {children}
      </body>
    </html>
  );
}
