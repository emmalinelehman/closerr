'use client';

import { useEffect, useRef } from 'react';

export default function MatrixPage() {
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
      setTimeout(animate, 80);
    }

    animate();
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      {/* Background */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          background: 'transparent',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* ASCII Overlay */}
      <div
        style={{
          position: 'fixed',
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
            opacity: 0.4,
            textShadow: 'none',
            letterSpacing: '0.1em',
            overflow: 'hidden',
          }}
        />
      </div>

    </div>
  );
}
