'use client';

interface CallTimerProps {
  duration: number;
}

export default function CallTimer({ duration }: CallTimerProps) {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
      <span className="text-lg font-mono font-bold text-orange-400">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
