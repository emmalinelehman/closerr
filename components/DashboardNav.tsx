'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, History } from 'lucide-react';

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isDashboard = pathname === '/dashboard';
  const isHistory = pathname === '/history';

  return (
    <nav className="border-b-4 border-[#000000] bg-white sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold tracking-tighter uppercase font-serif" style={{ letterSpacing: '-0.02em' }}>
          CLOSERR
        </div>

        <div className="flex gap-2 border-4 border-[#000000] bg-white">
          <button
            onClick={() => router.push('/dashboard')}
            className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider border-r-4 border-[#000000] flex items-center gap-2 transition-all ${
              isDashboard
                ? 'bg-[#000000] text-white'
                : 'bg-white text-[#000000] hover:bg-gray-100'
            }`}
          >
            <Home className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => router.push('/history')}
            className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              isHistory
                ? 'bg-[#000000] text-white'
                : 'bg-white text-[#000000] hover:bg-gray-100'
            }`}
          >
            <History className="w-4 h-4" />
            History
          </button>
        </div>

        <button
          onClick={() => router.push('/')}
          className="font-mono text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black"
        >
          Home
        </button>
      </div>
    </nav>
  );
}
