interface HeaderProps {
  moveCount: number;
  elapsedTime: number;
  hintsRemaining: number;
  currentLevel?: number;
  onHint: () => void;
  onUndo: () => void;
  onBack: () => void;
  undoCount: number;
  timeRemaining?: number | null;
  timeLimit?: number | null;
  isTimeAttack?: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Header({
  moveCount,
  elapsedTime,
  hintsRemaining,
  currentLevel,
  onHint,
  onUndo,
  onBack,
  undoCount,
  timeRemaining,
  timeLimit,
  isTimeAttack,
}: HeaderProps) {
  const timerColor = timeRemaining !== null && timeRemaining !== undefined
    ? timeRemaining <= 10
      ? 'text-red-400 animate-pulse'
      : timeRemaining <= 20
        ? 'text-yellow-400'
        : 'text-green-400'
    : 'text-white/80';

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-2">
      {/* 상단 행: 뒤로가기 + 레벨 */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onBack}
          className="text-white/60 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
        >
          ← 나가기
        </button>
        {currentLevel && (
          <div className="text-lg font-bold text-yellow-300">
            레벨 {currentLevel}
          </div>
        )}
        <div className="w-16" /> {/* 간격 맞추기 */}
      </div>

      {/* 타이머 바 (타임어택 모드) */}
      {isTimeAttack && timeRemaining !== null && timeRemaining !== undefined && (
        <div className="w-full h-3 bg-black/30 rounded-full mb-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              timeRemaining <= 10
                ? 'bg-red-500 animate-pulse'
                : timeRemaining <= 20
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
            }`}
            style={{
              width: `${((timeRemaining) / (timeLimit || 60)) * 100}%`,
            }}
          />
        </div>
      )}

      {/* 정보 행 */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <span className="text-white/60">
            🔄 <span className="text-white/90 font-bold">{moveCount}</span>
          </span>
          <span className={timerColor}>
            ⏱ {isTimeAttack && timeRemaining !== null && timeRemaining !== undefined
              ? formatTime(timeRemaining)
              : formatTime(elapsedTime)
            }
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={undoCount === 0}
            className={`px-2 py-1 rounded-lg text-xs transition-all ${
              undoCount > 0
                ? 'bg-white/10 text-white/80 hover:bg-white/20'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            ↩ 되돌리기 ({undoCount})
          </button>
          <button
            onClick={onHint}
            disabled={hintsRemaining === 0}
            className={`px-2 py-1 rounded-lg text-xs transition-all ${
              hintsRemaining > 0
                ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            💡 힌트 ({hintsRemaining})
          </button>
        </div>
      </div>
    </div>
  );
}
