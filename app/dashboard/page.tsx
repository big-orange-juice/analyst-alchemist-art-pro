'use client';

import { Suspense } from 'react';
import DashboardContent from './DashboardContent';

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className='w-full h-screen flex items-center justify-center text-cp-text-muted font-mono text-sm tracking-widest'>
          Loading dashboard…
        </div>
      }>
      <DashboardContent />
    </Suspense>
  );
}
