'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function HowItWorksPage() {
  const router = useRouter();
  const asciiRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const asciiOverlay = asciiRef.current;
    if (!asciiOverlay) return;

    const chars = '▓░▒█▀▄╱╲╳╭╮╰╯┌┐└┘│─├┤┬┴┼·•°◆◇★✦✧✱✲✳❋❉❈❊';

    interface CharCell {
      char: string;
      life: number;
      decay: () => void;
      spawn: () => void;
    }

    class CharCellClass implements CharCell {
      char: string;
      life: number;

      constructor() {
        this.char = Math.random() > 0.5 ? this.randomChar() : ' ';
        this.life = Math.random() * 100;
      }

      randomChar() {
        return chars.charAt(Math.floor(Math.random() * chars.length));
      }

      decay() {
        this.life -= Math.random() * 3 + 1;
        if (this.life <= 0) {
          this.char = ' ';
          this.life = 0;
        }
      }

      spawn() {
        if (this.life <= 0 && Math.random() > 0.92) {
          this.char = this.randomChar();
          this.life = 100 + Math.random() * 50;
        }
      }
    }

    function getGridDimensions() {
      const charWidth = 7;
      const charHeight = 14;
      const cols = Math.floor(window.innerWidth / charWidth);
      const rows = Math.floor(window.innerHeight / charHeight);
      return { cols, rows };
    }

    let { cols, rows } = getGridDimensions();
    let grid: CharCellClass[][] = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(null).map(() => new CharCellClass()));

    function updateGrid() {
      const { cols: newCols, rows: newRows } = getGridDimensions();

      if (newCols !== cols || newRows !== rows) {
        cols = newCols;
        rows = newRows;
        grid = Array(rows)
          .fill(null)
          .map(() => Array(cols).fill(null).map(() => new CharCellClass()));
      }

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          grid[i][j].decay();
          grid[i][j].spawn();
        }
      }

      if (Math.random() > 0.85) {
        const burstRow = Math.floor(Math.random() * rows);
        const burstCol = Math.floor(Math.random() * cols);
        const burstSize = Math.floor(Math.random() * 15 + 5);

        for (let k = 0; k < burstSize; k++) {
          const r = Math.max(0, Math.min(rows - 1, burstRow + Math.floor(Math.random() * 10 - 5)));
          const c = Math.max(0, Math.min(cols - 1, burstCol + Math.floor(Math.random() * 10 - 5)));
          if (grid[r][c].life <= 0) {
            grid[r][c].char = chars.charAt(Math.floor(Math.random() * chars.length));
            grid[r][c].life = 100;
          }
        }
      }

      let output = '';
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const cell = grid[i][j];
          if (cell.char === ' ' || cell.life <= 0) {
            output += ' ';
          } else {
            output += cell.char;
          }
        }
        if (i < rows - 1) output += '\n';
      }
      if (asciiOverlay) {
        asciiOverlay.textContent = output;
      }
    }

    function animate() {
      updateGrid();
      setTimeout(animate, 200);
    }

    animate();
  }, []);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* NAVIGATION */}
      <nav className="border-b border-gray-300 px-8 bg-white z-50 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="font-serif text-lg font-black uppercase hover:opacity-70 transition-opacity"
            style={{ letterSpacing: '-0.01em' }}
          >
            CLOSERR
          </button>
          <button
            onClick={() => router.push('/')}
            className="font-mono text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black transition-colors"
          >
            Back
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section
        className="border-b border-gray-300 h-screen px-8 md:px-12 relative animate-fade-in flex items-center"
        style={{
          backgroundImage: 'url(/newbarbs.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="w-full relative z-10">
          <div className="max-w-2xl">
            <h1
              className="font-serif font-bold leading-tight tracking-tight mb-0"
              style={{
                fontSize: 'clamp(4rem, 20vw, 12rem)',
                lineHeight: '0.9',
                color: '#FFFFFF',
              }}
            >
              HOW IT<br />WORKS
            </h1>
            <p className="text-white text-lg md:text-xl mt-6 text-center">
              Master real sales conversations with AI-powered personas that challenge you at every turn.
            </p>
          </div>
        </div>
      </section>

      {/* THE PROCESS */}
      <section
        className="border-b border-gray-300 py-24 md:py-32 px-8 md:px-12 relative"
        style={{
          backgroundImage: 'url(/phoneascii.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-white/90"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl font-bold uppercase tracking-tight mb-16" style={{ letterSpacing: '-0.01em' }}>
            The Training Loop
          </h2>

          <div className="space-y-10">
            {/* Step 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-serif font-black text-lg">
                    1
                  </div>
                  <h3 className="font-serif text-2xl font-bold uppercase" style={{ letterSpacing: '-0.01em' }}>
                    Choose Your Buyer
                  </h3>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Pick from three distinct personas: the skeptical CFO, the busy founder, or the cost-conscious SMB owner. Each has different priorities, objections, and buying signals.
                </p>
              </div>
              <div className="bg-white border-4 border-black p-8 text-center">
                <p className="font-serif text-base uppercase font-bold text-black mb-4">Personas Available</p>
                <p className="text-3xl font-black mb-4">3 Types</p>
                <p className="text-base text-gray-700 leading-relaxed">Realistic buyer behaviors</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center md:order-last">
              <div className="bg-white border-4 border-black p-8 text-center md:order-last">
                <p className="font-serif text-base uppercase font-bold text-black mb-4">Real-Time Tracking</p>
                <p className="text-3xl font-black mb-4">5+ Metrics</p>
                <p className="text-base text-gray-700 leading-relaxed">Talk ratio, pacing, sentiment, questions asked</p>
              </div>
              <div className="md:order-first">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-serif font-black text-lg">
                    2
                  </div>
                  <h3 className="font-serif text-2xl font-bold uppercase" style={{ letterSpacing: '-0.01em' }}>
                    Start a Conversation
                  </h3>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Hit the microphone and start your pitch. The AI responds in real time, throwing realistic objections and asking tough questions. Your metrics update live as you speak.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-serif font-black text-lg">
                    3
                  </div>
                  <h3 className="font-serif text-2xl font-bold uppercase" style={{ letterSpacing: '-0.01em' }}>
                    Get Your Score
                  </h3>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  After each call, see detailed feedback on your performance. Track how you handle objections, control the pace of the conversation, and build rapport. Build your skill over time.
                </p>
              </div>
              <div className="bg-white border-4 border-black p-8 text-center">
                <p className="font-serif text-base uppercase font-bold text-black mb-4">Scored on</p>
                <p className="text-3xl font-black mb-4">/100</p>
                <p className="text-base text-gray-700 leading-relaxed">Comprehensive sales acumen</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KEY FEATURES */}
      <section className="border-b border-gray-300 py-24 md:py-32 px-8 md:px-12 bg-gray-950 relative overflow-hidden">
        {/* ASCII Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 10,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          <pre
            ref={asciiRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              margin: 0,
              padding: 0,
              fontFamily: "'Courier New', monospace",
              fontSize: '12px',
              lineHeight: 1.2,
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              color: '#ffffff',
              opacity: 0.3,
              textShadow: 'none',
              letterSpacing: '0.1em',
              overflow: 'hidden',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-20">
          <h2 className="font-serif text-4xl md:text-5xl font-bold uppercase tracking-tight mb-16 text-white" style={{ letterSpacing: '-0.01em' }}>
            Why Closerr Wins
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Realistic AI Buyers',
                description: 'Each persona responds like a real decision-maker. They push back. They have budgets. They have priorities.',
              },
              {
                title: 'Instant Feedback',
                description: 'See your metrics update in real time. Know exactly where you need to improve on every call.',
              },
              {
                title: 'No Client Risk',
                description: 'Practice your pitch on AI before you pitch to real buyers. Build confidence without stakes.',
              },
              {
                title: 'Track Progress',
                description: 'Every call is saved. Watch your scores improve as you get better at handling objections.',
              },
              {
                title: 'Sales-Specific Scoring',
                description: 'Graded on what actually matters: pacing, questions, ROI messaging, emotional intelligence.',
              },
              {
                title: 'Repeat, Refine, Repeat',
                description: 'Run unlimited simulations. Each buyer type teaches you something different about selling.',
              },
            ].map((feature, idx) => (
              <div key={idx} className="border-4 border-black p-8 bg-white">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-black flex-shrink-0 mt-1" />
                  <h3 className="font-serif text-lg font-bold uppercase" style={{ letterSpacing: '-0.01em' }}>
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* METRICS EXPLAINED */}
      <section className="border-b border-gray-300 py-24 md:py-32 px-8 md:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-bold uppercase tracking-tight mb-16" style={{ letterSpacing: '-0.01em' }}>
            What We Measure
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                metric: 'Talk-to-Listen Ratio',
                description: 'Are you talking too much? Good sales reps listen at least as much as they pitch.',
              },
              {
                metric: 'Speaking Pace (WPM)',
                description: 'Rushing signals nervousness. Dragging loses attention. Find your optimal pace.',
              },
              {
                metric: 'Sentiment Analysis',
                description: 'Does the buyer sound positive, neutral, or negative? Track how your words land.',
              },
              {
                metric: 'Questions Asked',
                description: 'Questions show curiosity and control the conversation. More = stronger sales skills.',
              },
              {
                metric: 'Objection Handling',
                description: 'Did you address the buyer\'s concerns? Did you overcome or concede?',
              },
              {
                metric: 'Overall Score',
                description: 'A holistic rating that combines all metrics into your sales acumen score.',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white border-4 border-black p-8 text-center">
                <p className="font-serif text-base uppercase font-bold text-gray-600 mb-4">{item.metric}</p>
                <p className="text-gray-700 leading-relaxed text-base">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="border-b border-gray-300 py-24 md:py-32 px-8 md:px-12 text-white relative"
        style={{
          backgroundImage: 'url(/graphite.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl font-bold uppercase tracking-tight mb-8" style={{ letterSpacing: '-0.01em' }}>
            Ready to Sell Harder?
          </h2>
          <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
            Start your first simulation now. Pick your buyer, master your pitch, and watch your score climb.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-12 py-6 border-2 border-white font-serif font-bold text-xl uppercase flex items-center gap-3 mx-auto hover:bg-white hover:text-black transition-all"
          >
            BEGIN TRAINING
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-300 py-12 px-8 md:px-12">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-600 font-semibold tracking-wide">
          CLOSERR © 2024 | AI SALES TRAINING
        </div>
      </footer>
    </div>
  );
}
