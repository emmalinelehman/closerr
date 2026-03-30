'use client';

import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isActive: boolean;
}

export default function AudioVisualizer({
  audioElement,
  isActive,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!audioElement || !isActive) return;

    try {
      // Initialize Web Audio API
      const audioContext =
        audioContextRef.current ||
        new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create analyser if needed
      if (!analyserRef.current) {
        const source = audioContext.createMediaElementSource(audioElement);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        analyserRef.current = analyser;
      }

      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      const draw = () => {
        animationRef.current = requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);

        // Clear canvas
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, 0, width, height);

        // Draw waveform bars
        const barWidth = width / bufferLength;
        const barGap = 1;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height;

          // Grayscale bars
          const brightness = 30 + (i / bufferLength) * 50; // Dark gray to medium gray
          ctx.fillStyle = `hsl(0, 0%, ${brightness}%)`;

          ctx.fillRect(x, height - barHeight, barWidth - barGap, barHeight);
          x += barWidth;
        }
      };

      draw();
    } catch (error) {
      console.error('Audio visualizer error:', error);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioElement, isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      className="absolute inset-0 rounded-full opacity-60"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
