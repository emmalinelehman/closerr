'use client';

import { usePathname, useRouter } from 'next/navigation';

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isDashboard = pathname === '/dashboard';
  const isHistory = pathname === '/history';

  return (
    <nav className="border-b border-gray-300 bg-white sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="font-serif text-lg font-black uppercase text-black hover:opacity-70"
          style={{ letterSpacing: '-0.01em' }}
        >
          CLOSERR
        </button>

        <div className="flex gap-1">
          <button
            onClick={() => router.push('/dashboard')}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase transition-all ${
              isDashboard
                ? 'text-black border-b-2 border-black'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => router.push('/history')}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase transition-all ${
              isHistory
                ? 'text-black border-b-2 border-black'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            History
          </button>
        </div>

        <div className="w-0" />
      </div>
    </nav>
  );
}
