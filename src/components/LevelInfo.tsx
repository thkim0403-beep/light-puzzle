import { motion, AnimatePresence } from 'framer-motion';

interface LevelInfoProps {
  isCleared: boolean;
  moveCount: number;
  elapsedTime: number;
  stars: number;
  onNext: () => void;
  onRetry: () => void;
  onLevelSelect: () => void;
  isTimeAttack?: boolean;
  timeRemaining?: number | null;
  isTimeUp?: boolean;
  currentLevel?: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// 레벨별 스토리 메시지
const storyMessages: Record<number, string> = {
  5: '첫 번째 집에 불이 들어왔어요! 🏠',
  10: '학교도 환해졌어요! 🏫',
  15: '병원에 전기가 통했어요! 🏥',
  20: '공원 가로등이 켜졌어요! 🏞️',
  25: '마을 전체가 밝아지고 있어요! 🌃',
  30: '마을에 다시 빛이 돌아왔습니다! 🎆',
};

export default function LevelInfo({
  isCleared,
  moveCount,
  elapsedTime,
  stars,
  onNext,
  onRetry,
  onLevelSelect,
  isTimeAttack,
  timeRemaining,
  isTimeUp,
  currentLevel,
}: LevelInfoProps) {
  const storyMessage = currentLevel ? storyMessages[currentLevel] : null;

  return (
    <AnimatePresence>
      {(isCleared || isTimeUp) && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl border border-white/10"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            {isTimeUp ? (
              <>
                <motion.div
                  className="text-5xl mb-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  ⏰
                </motion.div>
                <h2 className="text-2xl font-bold text-red-400 mb-2">
                  시간 초과!
                </h2>
                <p className="text-white/60 mb-6">다시 도전해 보세요!</p>
              </>
            ) : (
              <>
                <motion.div
                  className="text-5xl mb-4"
                  animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.6 }}
                >
                  💡
                </motion.div>
                <h2 className="text-2xl font-bold text-yellow-300 mb-2">
                  불이 켜졌어요!
                </h2>

                {storyMessage && (
                  <motion.p
                    className="text-lg text-yellow-200/80 mb-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {storyMessage}
                  </motion.p>
                )}

                <div className="flex justify-center gap-1 mb-4">
                  {[1, 2, 3].map(s => (
                    <motion.span
                      key={s}
                      className="text-3xl"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + s * 0.15 }}
                    >
                      {s <= stars ? '⭐' : '☆'}
                    </motion.span>
                  ))}
                </div>

                <div className="space-y-1 text-white/70 text-sm mb-6">
                  <p>회전 횟수: <span className="text-white font-bold">{moveCount}회</span></p>
                  <p>걸린 시간: <span className="text-white font-bold">{formatTime(elapsedTime)}</span></p>
                  {isTimeAttack && timeRemaining !== null && timeRemaining !== undefined && timeRemaining > 0 && (
                    <p>보너스 점수: <span className="text-yellow-300 font-bold">+{timeRemaining * 100}</span></p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              {isCleared && !isTimeAttack && currentLevel && currentLevel < 30 && (
                <button
                  onClick={onNext}
                  className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold text-lg transition-colors"
                >
                  다음 레벨 →
                </button>
              )}
              <button
                onClick={onRetry}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
              >
                다시 하기
              </button>
              <button
                onClick={onLevelSelect}
                className="w-full py-2 rounded-xl text-white/50 hover:text-white/80 text-sm transition-colors"
              >
                나가기
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
