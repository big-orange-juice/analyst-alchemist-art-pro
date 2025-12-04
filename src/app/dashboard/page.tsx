'use client';

import dynamic from 'next/dynamic';

// Dynamically import the dashboard to ensure it's CSR only
const DashboardContent = dynamic(() => import('./DashboardContent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-cp-black flex items-center justify-center">
      <div className="text-cp-yellow animate-pulse text-xl font-mono">Loading Matrix...</div>
    </div>
  ),
});

export default function DashboardPage() {
  return <DashboardContent />;
}
