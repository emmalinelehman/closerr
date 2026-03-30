'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement actual authentication
      // For now, just redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#000000] font-sans flex flex-col">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .marquee-scroll {
          animation: scroll 15s linear infinite;
        }
      `}</style>

      {/* MARQUEE TICKER */}
      <div className="border-b-4 border-t-4 border-[#000000] bg-[#00E5FF] py-3 overflow-hidden">
        <div className="flex marquee-scroll whitespace-nowrap">
          <div className="text-black font-mono font-bold tracking-widest text-lg px-8">
            • MASTER THE PITCH • CLOSE MORE DEALS • CRUSH YOUR QUOTA • NO EXCUSES • MASTER THE PITCH • CLOSE MORE DEALS • CRUSH YOUR QUOTA • NO EXCUSES •
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="border-b-4 border-[#000000] py-6 px-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.push('/')}
            className="text-2xl md:text-3xl font-bold tracking-tighter uppercase font-serif hover:opacity-70 transition-opacity"
            style={{ letterSpacing: '-0.02em' }}
          >
            CLOSERR
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="font-serif text-4xl md:text-5xl font-black uppercase tracking-tighter mb-3" style={{ letterSpacing: '-0.02em' }}>
              LOGIN
            </h1>
            <p className="font-mono text-sm uppercase tracking-wider text-gray-600">
              Access your training dashboard
            </p>
          </div>

          {/* Form Container */}
          <div className="border-4 border-[#000000] bg-white p-8" style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="font-mono text-xs uppercase font-bold tracking-widest text-gray-600 block mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border-4 border-[#000000] px-4 py-3 font-mono text-sm focus:outline-none bg-white"
                  style={{ boxShadow: '2px 2px 0px 0px rgba(0,0,0,0.1)' }}
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="font-mono text-xs uppercase font-bold tracking-widest text-gray-600 block mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border-4 border-[#000000] px-4 py-3 font-mono text-sm focus:outline-none bg-white"
                  style={{ boxShadow: '2px 2px 0px 0px rgba(0,0,0,0.1)' }}
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="border-4 border-red-500 bg-red-50 p-4">
                  <p className="font-mono text-xs uppercase font-bold text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full border-4 border-[#000000] bg-[#FF2A85] text-white font-serif font-black text-lg uppercase px-8 py-4 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                style={{ boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}
                onMouseDown={(e) => {
                  if (!isLoading) {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translate(6px, 6px)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                  }
                }}
                onMouseUp={(e) => {
                  if (!isLoading) {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '6px 6px 0px 0px rgba(0,0,0,1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '6px 6px 0px 0px rgba(0,0,0,1)';
                  }
                }}
              >
                {isLoading ? 'LOGGING IN...' : 'LOGIN'}
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>

            {/* Divider */}
            <div className="border-t-2 border-gray-300 my-6"></div>

            {/* Signup Link */}
            <p className="text-center font-mono text-sm text-gray-600">
              No account?{' '}
              <Link href="/signup" className="font-bold text-[#FF2A85] hover:underline">
                Sign up here
              </Link>
            </p>
          </div>

          {/* Demo Link */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/')}
              className="font-mono text-xs uppercase font-bold tracking-widest text-gray-600 hover:text-black transition-colors"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t-4 border-[#000000] py-8 px-8">
        <div className="max-w-7xl mx-auto text-center font-mono text-xs uppercase font-bold tracking-widest">
          CLOSERR © 2024 | AI SALES TRAINING
        </div>
      </footer>
    </div>
  );
}
