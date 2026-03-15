import { motion } from 'framer-motion';
import type { Difficulty, GameScreen, LevelProgress, Achievement } from '../types';

interface StartScreenProps {
  screen: GameScreen;
  progress: Record<number, LevelProgress>;
  achievements: Achievement[];
  maxUnlockedLevel: number;
  onStartLevel: (level: number) => void;
  onStartInfinite: (diff: Difficulty) => void;
  onStartTimeAttack: (diff: Difficulty) => void;
  onSetScreen: (screen: GameScreen) => void;
}

function Stars({ count }: { count: number }) {
  return (
    <span className="text-xs">
      {[1, 2, 3].map(s => (
        <span key={s} className={s <= count ? 'text-yellow-400' : 'text-white/20'}>
          ★
        </span>
      ))}
    </span>
  );
}

// 마을 실루엣 — 클리어 진행도에 따라 건물에 불이 켜짐
function VillageSilhouette({ progress }: { progress: Record<number, LevelProgress> }) {
  const clearedCount = Object.values(progress).filter(p => p.cleared).length;
  const buildings = [
    { name: '집', emoji: '🏠', threshold: 1, x: 10 },
    { name: '가게', emoji: '🏪', threshold: 3, x: 22 },
    { name: '학교', emoji: '🏫', threshold: 7, x: 35 },
    { name: '병원', emoji: '🏥', threshold: 12, x: 48 },
    { name: '공원', emoji: '🏞️', threshold: 18, x: 62 },
    { name: '시청', emoji: '🏛️', threshold: 25, x: 75 },
    { name: '타워', emoji: '🗼', threshold: 30, x: 88 },
  ];

  return (
    <div className="relative w-full h-16 mb-4">
      {buildings.map(b => (
        <motion.div
          key={b.name}
          className="absolute bottom-0"
          style={{ left: `${b.x}%`, transform: 'translateX(-50%)' }}
          animate={clearedCount >= b.threshold ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <span
            className={`text-2xl ${clearedCount >= b.threshold ? 'drop-shadow-[0_0_6px_rgba(255,217,61,0.6)]' : 'opacity-30 grayscale'}`}
          >
            {b.emoji}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export default function StartScreen({
  screen,
  progress,
  achievements,
  maxUnlockedLevel,
  onStartLevel,
  onStartInfinite,
  onStartTimeAttack,
  onSetScreen,
}: StartScreenProps) {
  // 시작 화면
  if (screen === 'start') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="text-6xl mb-2"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            💡
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-300 mb-2 drop-shadow-[0_0_20px_rgba(255,217,61,0.3)]">
            불을 켜라!
          </h1>
          <p className="text-white/50 text-sm mb-8">
            파이프를 연결해서 모든 전구에 불을 켜보세요
          </p>

          {/* 스토리 소개 */}
          <motion.div
            className="bg-white/5 rounded-2xl p-4 mb-8 max-w-sm mx-auto border border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-white/70 text-sm leading-relaxed">
              마을의 전기가 모두 나갔어요!<br />
              파이프를 연결해서 다시 불을 켜 주세요! ⚡
            </p>
          </motion.div>
        </motion.div>

        <div className="space-y-3 w-full max-w-xs">
          <motion.button
            onClick={() => onSetScreen('levelSelect')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-900 font-bold text-lg shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-shadow"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🎮 레벨 모드
          </motion.button>

          <motion.button
            onClick={() => onSetScreen('infinite')}
            className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-lg transition-colors border border-white/10"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ♾️ 무한 모드
          </motion.button>

          <motion.button
            onClick={() => onSetScreen('timeAttack')}
            className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-lg transition-colors border border-white/10"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ⏱️ 타임 어택
          </motion.button>

          <motion.button
            onClick={() => onSetScreen('achievements')}
            className="w-full py-3 rounded-2xl text-white/50 hover:text-white/80 text-sm transition-colors"
            whileHover={{ scale: 1.02 }}
          >
            🏆 업적
          </motion.button>
        </div>
      </div>
    );
  }

  // 레벨 선택 화면
  if (screen === 'levelSelect') {
    return (
      <div className="flex flex-col items-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => onSetScreen('start')}
              className="text-white/60 hover:text-white px-2 py-1"
            >
              ← 뒤로
            </button>
            <h2 className="text-xl font-bold text-yellow-300">레벨 선택</h2>
            <div className="w-12" />
          </div>

          <VillageSilhouette progress={progress} />

          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 30 }, (_, i) => i + 1).map(level => {
              const isUnlocked = level <= maxUnlockedLevel;
              const levelProgress = progress[level];
              const isCleared = levelProgress?.cleared;
              const isCurrent = level === maxUnlockedLevel && !isCleared;

              return (
                <motion.button
                  key={level}
                  onClick={() => isUnlocked && onStartLevel(level)}
                  disabled={!isUnlocked}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all ${
                    isCleared
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      : isCurrent
                        ? 'bg-white/15 text-white border-2 border-yellow-400 animate-pulse'
                        : isUnlocked
                          ? 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                          : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                  }`}
                  whileHover={isUnlocked ? { scale: 1.05 } : undefined}
                  whileTap={isUnlocked ? { scale: 0.95 } : undefined}
                >
                  {!isUnlocked && <span className="text-xs mb-0.5">🔒</span>}
                  <span>{level}</span>
                  {isCleared && levelProgress && (
                    <Stars count={levelProgress.stars} />
                  )}
                  {isCurrent && (
                    <span className="text-xs">💡</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 난이도 선택 (무한 모드 / 타임어택)
  if (screen === 'infinite' || screen === 'timeAttack') {
    const isTimeMode = screen === 'timeAttack';
    const title = isTimeMode ? '⏱️ 타임 어택' : '♾️ 무한 모드';
    const onStart = isTimeMode ? onStartTimeAttack : onStartInfinite;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <button
          onClick={() => onSetScreen('start')}
          className="absolute top-4 left-4 text-white/60 hover:text-white px-2 py-1"
        >
          ← 뒤로
        </button>

        <h2 className="text-2xl font-bold text-yellow-300 mb-8">{title}</h2>

        {isTimeMode && (
          <p className="text-white/50 text-sm mb-6 text-center">
            제한 시간 안에 퍼즐을 풀어보세요!
          </p>
        )}

        <div className="space-y-3 w-full max-w-xs">
          <motion.button
            onClick={() => onStart('easy')}
            className="w-full py-4 rounded-2xl bg-green-500/20 hover:bg-green-500/30 text-green-300 font-bold text-lg transition-colors border border-green-500/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🐣 쉬움 {isTimeMode && '(60초)'}
            <span className="block text-xs font-normal opacity-60 mt-1">4×4, 전구 1개</span>
          </motion.button>

          <motion.button
            onClick={() => onStart('normal')}
            className="w-full py-4 rounded-2xl bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 font-bold text-lg transition-colors border border-yellow-500/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🐥 보통 {isTimeMode && '(45초)'}
            <span className="block text-xs font-normal opacity-60 mt-1">6×6, 전구 2개</span>
          </motion.button>

          <motion.button
            onClick={() => onStart('hard')}
            className="w-full py-4 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-lg transition-colors border border-red-500/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🦅 어려움 {isTimeMode && '(30초)'}
            <span className="block text-xs font-normal opacity-60 mt-1">8×8, 전구 3개</span>
          </motion.button>
        </div>
      </div>
    );
  }

  // 업적 화면
  if (screen === 'achievements') {
    return (
      <div className="flex flex-col items-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => onSetScreen('start')}
              className="text-white/60 hover:text-white px-2 py-1"
            >
              ← 뒤로
            </button>
            <h2 className="text-xl font-bold text-yellow-300">🏆 업적</h2>
            <div className="w-12" />
          </div>

          <div className="space-y-2">
            {achievements.map(a => (
              <motion.div
                key={a.id}
                className={`p-4 rounded-xl border transition-all ${
                  a.achieved
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-white/5 border-white/10 opacity-50'
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: a.achieved ? 1 : 0.5, x: 0 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{a.icon}</span>
                  <div className="flex-1">
                    <h3 className={`font-bold ${a.achieved ? 'text-yellow-300' : 'text-white/50'}`}>
                      {a.name}
                    </h3>
                    <p className="text-xs text-white/40">{a.description}</p>
                  </div>
                  {a.achieved && a.achievedDate && (
                    <span className="text-xs text-white/30">{a.achievedDate}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
