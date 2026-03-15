export type Direction = 'top' | 'right' | 'bottom' | 'left';

export type TileType =
  | 'battery'
  | 'bulb'
  | 'straight'
  | 'curve'
  | 'tjunction'
  | 'cross'
  | 'empty'
  | 'locked'
  | 'bidirectional'
  | 'teleport';

export interface Tile {
  type: TileType;
  rotation: number; // 0, 1, 2, 3 (각각 0°, 90°, 180°, 270°)
  powered: boolean;
  row: number;
  col: number;
  fixed?: boolean; // 회전 불가 (battery, bulb, locked)
  teleportColor?: string; // 텔레포트 쌍 구분
  teleportPairId?: number;
  correctRotation?: number; // 정답 회전값 (힌트용)
  hinting?: boolean; // 힌트 애니메이션 중
}

export interface LevelConfig {
  level: number;
  boardSize: number;
  bulbCount: number;
  pipeTypes: TileType[];
  emptyCount: number;
  hasLockedPipes: boolean;
  hasBidirectional: boolean;
  hasTeleport: boolean;
  teleportPairs: number;
}

export interface LevelProgress {
  cleared: boolean;
  stars: number;
  bestMoves: number;
  bestTime: number;
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: string;
  achieved: boolean;
  achievedDate?: string;
}

export type GameScreen =
  | 'start'
  | 'levelSelect'
  | 'game'
  | 'infinite'
  | 'timeAttack'
  | 'achievements'
  | 'editor';

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface GameState {
  screen: GameScreen;
  currentLevel: number;
  board: Tile[][];
  moveCount: number;
  elapsedTime: number;
  hintsRemaining: number;
  isCleared: boolean;
  isPaused: boolean;
  difficulty?: Difficulty;
  timeLimit?: number;
  undoStack: { row: number; col: number; prevRotation: number }[];
}
