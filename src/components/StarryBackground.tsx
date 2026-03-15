import { useMemo } from 'react';

interface StarryBackgroundProps {
  isCleared: boolean;
}

export default function StarryBackground({ isCleared }: StarryBackgroundProps) {
  const stars = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 3,
    }));
  }, []);

  return (
    <div
      className={`fixed inset-0 -z-10 transition-all duration-[2000ms] ${
        isCleared
          ? 'bg-gradient-to-b from-indigo-800 via-purple-700 to-orange-400'
          : 'bg-gradient-to-b from-slate-900 via-indigo-950 to-purple-950'
      }`}
    >
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
