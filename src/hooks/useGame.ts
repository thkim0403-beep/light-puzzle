import { useState, useCallback, useEffect, useRef } from 'react';
import type { Tile, GameScreen, Difficulty, LevelProgress, Achievement } from '../types';
import { generatePuzzle, getLevelConfig, getInfiniteConfig } from '../utils/puzzleGenerator';
import { calculatePower, isAllBulbsPowered, calculateStars, countPipes } from '../utils/boardLogic';

const STORAGE_KEY = 'light-puzzle-progress';
const ACHIEVEMENT_KEY = 'light-puzzle-achievements';

function loadProgress(): Record<number, LevelProgress> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress: Record<number, LevelProgress>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function loadAchievements(): Achievement[] {
  try {
    const data = localStorage.getItem(ACHIEVEMENT_KEY);
    return data ? JSON.parse(data) : getDefaultAchievements();
  } catch {
    return getDefaultAchievements();
  }
}

function saveAchievements(achievements: Achievement[]) {
  localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(achievements));
}

function getDefaultAchievements(): Achievement[] {
  return [
    { id: 'first_light', name: '첫 번째 불', icon: '🌟', description: '첫 레벨 클리어', condition: '레벨 1 클리어', achieved: false },
    { id: 'lightning', name: '번개같이', icon: '💨', description: '10초 안에 클리어', condition: '10초 내 클리어', achieved: false },
    { id: 'perfect', name: '완벽한 배선', icon: '🎯', description: '최소 회전으로 클리어 (3성)', condition: '별 3개 획득', achieved: false },
    { id: 'streak', name: '연속 클리어', icon: '🔥', description: '5레벨 연속 클리어', condition: '5레벨 연속', achieved: false },
    { id: 'master', name: '파이프 마스터', icon: '🧠', description: '15레벨 클리어', condition: '15레벨 달성', achieved: false },
    { id: 'king', name: '전기왕', icon: '👑', description: '30레벨 모두 클리어', condition: '30레벨 완료', achieved: false },
    { id: 'bright', name: '밝은 세상', icon: '💡', description: '전구 총 50개 켜기', condition: '누적 전구 50개', achieved: false },
    { id: 'no_hint', name: '노 힌트', icon: '🚫', description: '힌트 없이 10레벨 클리어', condition: '힌트 미사용 10레벨', achieved: false },
  ];
}

export function useGame() {
  const [screen, setScreen] = useState<GameScreen>('start');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [board, setBoard] = useState<Tile[][]>([]);
  const [moveCount, setMoveCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(2);
  const [isCleared, setIsCleared] = useState(false);
  const [progress, setProgress] = useState<Record<number, LevelProgress>>(loadProgress);
  const [achievements, setAchievements] = useState<Achievement[]>(loadAchievements);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [undoStack, setUndoStack] = useState<{ row: number; col: number; prevRotation: number }[]>([]);
  const [usedHintThisLevel, setUsedHintThisLevel] = useState(false);
  const [consecutiveClears, setConsecutiveClears] = useState(0);
  const [totalBulbsLit, setTotalBulbsLit] = useState(() => {
    try {
      return parseInt(localStorage.getItem('light-puzzle-bulbs') || '0');
    } catch { return 0; }
  });
  const [noHintLevels, setNoHintLevels] = useState(() => {
    try {
      return parseInt(localStorage.getItem('light-puzzle-nohint') || '0');
    } catch { return 0; }
  });
  const [clearAnimating, setClearAnimating] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 타이머
  useEffect(() => {
    if (screen === 'game' || screen === 'infinite' || screen === 'timeAttack') {
      if (!isCleared && !isTimeUp) {
        timerRef.current = setInterval(() => {
          setElapsedTime(t => t + 1);
          if (timeLimit !== null) {
            setTimeRemaining(prev => {
              if (prev === null) return null;
              if (prev <= 1) {
                setIsTimeUp(true);
                return 0;
              }
              return prev - 1;
            });
          }
        }, 1000);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screen, isCleared, isTimeUp, timeLimit]);

  const startLevel = useCallback((level: number) => {
    const config = getLevelConfig(level);
    const newBoard = generatePuzzle(config);
    const powered = calculatePower(newBoard);
    setBoard(powered);
    setCurrentLevel(level);
    setMoveCount(0);
    setElapsedTime(0);
    setHintsRemaining(2);
    setIsCleared(false);
    setIsTimeUp(false);
    setClearAnimating(false);
    setTimeLimit(null);
    setTimeRemaining(null);
    setUndoStack([]);
    setUsedHintThisLevel(false);
    setScreen('game');
  }, []);

  const startInfinite = useCallback((diff: Difficulty) => {
    const config = getInfiniteConfig(diff);
    const newBoard = generatePuzzle(config);
    const powered = calculatePower(newBoard);
    setBoard(powered);
    setDifficulty(diff);
    setMoveCount(0);
    setElapsedTime(0);
    setHintsRemaining(2);
    setIsCleared(false);
    setIsTimeUp(false);
    setClearAnimating(false);
    setTimeLimit(null);
    setTimeRemaining(null);
    setUndoStack([]);
    setUsedHintThisLevel(false);
    setScreen('infinite');
  }, []);

  const startTimeAttack = useCallback((diff: Difficulty) => {
    const config = getInfiniteConfig(diff);
    const newBoard = generatePuzzle(config);
    const powered = calculatePower(newBoard);
    setBoard(powered);
    setDifficulty(diff);
    setMoveCount(0);
    setElapsedTime(0);
    setHintsRemaining(2);
    setIsCleared(false);
    setIsTimeUp(false);
    setClearAnimating(false);
    const limit = diff === 'easy' ? 60 : diff === 'normal' ? 45 : 30;
    setTimeLimit(limit);
    setTimeRemaining(limit);
    setUndoStack([]);
    setUsedHintThisLevel(false);
    setScreen('timeAttack');
  }, []);

  const checkAchievements = useCallback((
    newProgress: Record<number, LevelProgress>,
    stars: number,
    time: number,
    bulbs: number,
    noHint: number,
    consecutive: number,
  ) => {
    const updated = [...achievements];
    let newlyAchieved: Achievement | null = null;

    const check = (id: string, condition: boolean) => {
      const a = updated.find(a => a.id === id);
      if (a && !a.achieved && condition) {
        a.achieved = true;
        a.achievedDate = new Date().toISOString().split('T')[0];
        newlyAchieved = a;
      }
    };

    const clearedCount = Object.values(newProgress).filter(p => p.cleared).length;

    check('first_light', clearedCount >= 1);
    check('lightning', time <= 10);
    check('perfect', stars === 3);
    check('streak', consecutive >= 5);
    check('master', clearedCount >= 15);
    check('king', clearedCount >= 30);
    check('bright', bulbs >= 50);
    check('no_hint', noHint >= 10);

    setAchievements(updated);
    saveAchievements(updated);
    if (newlyAchieved) {
      setNewAchievement(newlyAchieved);
      setTimeout(() => setNewAchievement(null), 3000);
    }
  }, [achievements]);

  const rotateTile = useCallback((row: number, col: number, reverse = false) => {
    if (isCleared || isTimeUp) return;

    setBoard(prev => {
      const tile = prev[row][col];
      if (!tile || tile.type === 'empty' || tile.type === 'battery' || tile.type === 'bulb' || tile.type === 'cross') return prev;
      if (tile.fixed || tile.type === 'locked') return prev;

      const prevRotation = tile.rotation;
      const newRotation = reverse
        ? (tile.rotation + 3) % 4
        : (tile.rotation + 1) % 4;

      const newBoard = prev.map(r =>
        r.map(t =>
          t.row === row && t.col === col
            ? { ...t, rotation: newRotation }
            : t
        )
      );

      const powered = calculatePower(newBoard);

      // 클리어 체크
      if (isAllBulbsPowered(powered)) {
        const pipeCount = countPipes(powered);
        const newMoveCount = moveCount + 1;
        const stars = calculateStars(newMoveCount, pipeCount);

        // 전구 수 카운트
        let bulbsInLevel = 0;
        for (const r of powered) {
          for (const t of r) {
            if (t.type === 'bulb' && t.powered) bulbsInLevel++;
          }
        }
        const newTotalBulbs = totalBulbsLit + bulbsInLevel;
        setTotalBulbsLit(newTotalBulbs);
        localStorage.setItem('light-puzzle-bulbs', String(newTotalBulbs));

        const newConsecutive = consecutiveClears + 1;
        setConsecutiveClears(newConsecutive);

        let newNoHint = noHintLevels;
        if (!usedHintThisLevel) {
          newNoHint++;
          setNoHintLevels(newNoHint);
          localStorage.setItem('light-puzzle-nohint', String(newNoHint));
        }

        // 진행 저장 (레벨 모드일 때만)
        if (screen === 'game') {
          const newProgress = { ...progress };
          const existing = newProgress[currentLevel];
          newProgress[currentLevel] = {
            cleared: true,
            stars: Math.max(stars, existing?.stars || 0),
            bestMoves: existing?.bestMoves ? Math.min(newMoveCount, existing.bestMoves) : newMoveCount,
            bestTime: existing?.bestTime ? Math.min(elapsedTime, existing.bestTime) : elapsedTime,
          };
          setProgress(newProgress);
          saveProgress(newProgress);

          checkAchievements(newProgress, stars, elapsedTime, newTotalBulbs, newNoHint, newConsecutive);
        }

        setClearAnimating(true);
        setTimeout(() => {
          setIsCleared(true);
        }, 1500);
      }

      // Undo 스택 업데이트
      setUndoStack(prev => [...prev.slice(-4), { row, col, prevRotation }]);
      setMoveCount(m => m + 1);

      return powered;
    });
  }, [isCleared, isTimeUp, moveCount, progress, currentLevel, elapsedTime, screen, totalBulbsLit, consecutiveClears, noHintLevels, usedHintThisLevel, checkAchievements]);

  const useHint = useCallback(() => {
    if (hintsRemaining <= 0 || isCleared) return;

    setBoard(prev => {
      // 정답이 아닌 파이프 찾기
      const wrongPipes: Tile[] = [];
      for (const row of prev) {
        for (const tile of row) {
          if (
            tile.correctRotation !== undefined &&
            tile.rotation !== tile.correctRotation &&
            !tile.fixed &&
            tile.type !== 'empty' &&
            tile.type !== 'battery' &&
            tile.type !== 'bulb' &&
            tile.type !== 'cross'
          ) {
            wrongPipes.push(tile);
          }
        }
      }

      if (wrongPipes.length === 0) return prev;

      const target = wrongPipes[Math.floor(Math.random() * wrongPipes.length)];
      const newBoard = prev.map(r =>
        r.map(t =>
          t.row === target.row && t.col === target.col
            ? { ...t, rotation: t.correctRotation!, hinting: true }
            : t
        )
      );

      // 힌트 반짝임 효과 제거
      setTimeout(() => {
        setBoard(b =>
          b.map(r =>
            r.map(t =>
              t.row === target.row && t.col === target.col
                ? { ...t, hinting: false }
                : t
            )
          )
        );
      }, 1000);

      const powered = calculatePower(newBoard);

      // 힌트 후 클리어 체크
      if (isAllBulbsPowered(powered)) {
        setClearAnimating(true);
        setTimeout(() => setIsCleared(true), 1500);
      }

      return powered;
    });

    setHintsRemaining(h => h - 1);
    setUsedHintThisLevel(true);
    setMoveCount(m => m + 1);
  }, [hintsRemaining, isCleared]);

  const undo = useCallback(() => {
    if (undoStack.length === 0 || isCleared) return;

    const last = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));

    setBoard(prev => {
      const newBoard = prev.map(r =>
        r.map(t =>
          t.row === last.row && t.col === last.col
            ? { ...t, rotation: last.prevRotation }
            : t
        )
      );
      return calculatePower(newBoard);
    });

    setMoveCount(m => Math.max(0, m - 1));
  }, [undoStack, isCleared]);

  const nextLevel = useCallback(() => {
    if (currentLevel < 30) {
      startLevel(currentLevel + 1);
    } else {
      setScreen('levelSelect');
    }
  }, [currentLevel, startLevel]);

  const retry = useCallback(() => {
    if (screen === 'game') {
      startLevel(currentLevel);
    } else if (screen === 'infinite') {
      startInfinite(difficulty);
    } else if (screen === 'timeAttack') {
      startTimeAttack(difficulty);
    }
  }, [screen, currentLevel, difficulty, startLevel, startInfinite, startTimeAttack]);

  const getMaxUnlockedLevel = useCallback(() => {
    let max = 1;
    for (let i = 1; i <= 30; i++) {
      if (progress[i]?.cleared) max = i + 1;
    }
    return Math.min(max, 30);
  }, [progress]);

  return {
    screen,
    setScreen,
    currentLevel,
    board,
    moveCount,
    elapsedTime,
    hintsRemaining,
    isCleared,
    clearAnimating,
    progress,
    achievements,
    newAchievement,
    difficulty,
    timeLimit,
    timeRemaining,
    isTimeUp,
    undoStack,
    startLevel,
    startInfinite,
    startTimeAttack,
    rotateTile,
    useHint,
    undo,
    nextLevel,
    retry,
    getMaxUnlockedLevel,
  };
}
