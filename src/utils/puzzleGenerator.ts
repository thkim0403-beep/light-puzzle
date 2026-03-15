import type { Tile, TileType, Direction, LevelConfig } from '../types';

const DIRECTION_ORDER: Direction[] = ['top', 'right', 'bottom', 'left'];

function oppositeDir(dir: Direction): Direction {
  const map: Record<Direction, Direction> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
  return map[dir];
}

function dirDelta(dir: Direction): [number, number] {
  switch (dir) {
    case 'top': return [-1, 0];
    case 'bottom': return [1, 0];
    case 'left': return [0, -1];
    case 'right': return [0, 1];
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 방향 세트에 맞는 파이프 타입과 회전값 결정
function getPipeForDirections(
  dirs: Direction[],
  allowedTypes: TileType[]
): { type: TileType; rotation: number } | null {
  const dirSet = new Set(dirs);

  if (dirSet.size === 4 && allowedTypes.includes('cross')) {
    return { type: 'cross', rotation: 0 };
  }

  if (dirSet.size === 3 && allowedTypes.includes('tjunction')) {
    // T-junction: base = top, right, bottom (rotation 0)
    const configs: [Set<Direction>, number][] = [
      [new Set(['top', 'right', 'bottom'] as Direction[]), 0],
      [new Set(['right', 'bottom', 'left'] as Direction[]), 1],
      [new Set(['top', 'bottom', 'left'] as Direction[]), 2],
      [new Set(['top', 'right', 'left'] as Direction[]), 3],
    ];
    for (const [s, rot] of configs) {
      if ([...s].every(d => dirSet.has(d)) && dirSet.size === 3) {
        return { type: 'tjunction', rotation: rot };
      }
    }
  }

  if (dirSet.size === 2) {
    // 직선 체크
    if (dirSet.has('top') && dirSet.has('bottom') && allowedTypes.includes('straight')) {
      return { type: 'straight', rotation: 0 };
    }
    if (dirSet.has('left') && dirSet.has('right') && allowedTypes.includes('straight')) {
      return { type: 'straight', rotation: 1 };
    }
    // 곡선 체크
    if (allowedTypes.includes('curve')) {
      const curveConfigs: [Direction, Direction, number][] = [
        ['top', 'right', 0],
        ['right', 'bottom', 1],
        ['bottom', 'left', 2],
        ['top', 'left', 3],
      ];
      for (const [d1, d2, rot] of curveConfigs) {
        if (dirSet.has(d1) && dirSet.has(d2)) {
          return { type: 'curve', rotation: rot };
        }
      }
    }
  }

  if (dirSet.size === 1) {
    // 단일 방향 — 직선 파이프로 처리 (한쪽 끝만 연결)
    // 실제로는 여기 오면 안 되지만 안전장치
    const d = [...dirSet][0];
    if (allowedTypes.includes('straight')) {
      if (d === 'top' || d === 'bottom') return { type: 'straight', rotation: 0 };
      return { type: 'straight', rotation: 1 };
    }
  }

  return null;
}

// 연결 맵: 각 셀이 어떤 방향들로 연결되는지
type ConnectionMap = Map<string, Set<Direction>>;

function cellKey(r: number, c: number): string {
  return `${r},${c}`;
}

// 랜덤 경로 생성 (DFS 랜덤 워크)
function randomPath(
  startR: number,
  startC: number,
  boardSize: number,
  used: Set<string>,
  minLen: number,
  maxLen: number,
): [number, number][] | null {
  const path: [number, number][] = [[startR, startC]];
  const pathSet = new Set([cellKey(startR, startC)]);
  let cr = startR;
  let cc = startC;
  const targetLen = minLen + Math.floor(Math.random() * (maxLen - minLen + 1));

  for (let step = 0; step < targetLen; step++) {
    const dirs = shuffle(DIRECTION_ORDER.slice());
    let moved = false;
    for (const dir of dirs) {
      const [dr, dc] = dirDelta(dir);
      const nr = cr + dr;
      const nc = cc + dc;
      if (nr < 0 || nr >= boardSize || nc < 0 || nc >= boardSize) continue;
      const key = cellKey(nr, nc);
      if (used.has(key) || pathSet.has(key)) continue;
      path.push([nr, nc]);
      pathSet.add(key);
      cr = nr;
      cc = nc;
      moved = true;
      break;
    }
    if (!moved) break;
  }

  return path.length >= minLen ? path : null;
}

export function generatePuzzle(config: LevelConfig): Tile[][] {
  const { boardSize, bulbCount, pipeTypes } = config;
  const maxRetries = 20;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const result = tryGeneratePuzzle(boardSize, bulbCount, pipeTypes);
    if (result) return result;
  }

  // 최후 수단: 아주 간단한 직선 퍼즐
  return generateSimplePuzzle(boardSize, pipeTypes);
}

function tryGeneratePuzzle(
  boardSize: number,
  bulbCount: number,
  pipeTypes: TileType[],
): Tile[][] | null {
  const used = new Set<string>();
  const connections: ConnectionMap = new Map();

  function addConnection(r: number, c: number, dir: Direction) {
    const key = cellKey(r, c);
    if (!connections.has(key)) connections.set(key, new Set());
    connections.get(key)!.add(dir);
  }

  // 전원 위치
  const batteryRow = Math.floor(Math.random() * (boardSize - 2)) + 1;
  const batteryCol = 0;
  used.add(cellKey(batteryRow, batteryCol));

  // 경로 시작점
  const startR = batteryRow;
  const startC = batteryCol + 1;
  if (startC >= boardSize) return null;
  used.add(cellKey(startR, startC));

  // 배터리 → 첫 셀 연결
  addConnection(startR, startC, 'left'); // 첫 셀은 왼쪽에서 입력

  // 전체 경로 생성 (하나의 큰 경로에서 분기)
  const allPaths: [number, number][][] = [];
  let currentEnd: [number, number] = [startR, startC];

  for (let b = 0; b < bulbCount; b++) {
    const minLen = Math.max(3, Math.floor(boardSize * 0.8));
    const maxLen = Math.max(4, boardSize + 1);
    const path = randomPath(currentEnd[0], currentEnd[1], boardSize, used, minLen, maxLen);

    if (!path || path.length < 3) return null;

    // path의 첫 번째 셀은 이미 이전 경로의 마지막이므로 제외
    const newCells = b === 0 ? path : path.slice(1);
    allPaths.push(path);

    // 사용된 셀 마킹
    for (const [r, c] of newCells) {
      used.add(cellKey(r, c));
    }

    // 연결 방향 기록
    for (let i = 0; i < path.length - 1; i++) {
      const [r1, c1] = path[i];
      const [r2, c2] = path[i + 1];

      let dir: Direction;
      if (r2 < r1) dir = 'top';
      else if (r2 > r1) dir = 'bottom';
      else if (c2 < c1) dir = 'left';
      else dir = 'right';

      addConnection(r1, c1, dir);
      addConnection(r2, c2, oppositeDir(dir));
    }

    // 다음 경로 시작점 = 현재 경로의 중간지점 (분기)
    if (b < bulbCount - 1 && path.length >= 3) {
      const branchIdx = 1 + Math.floor(Math.random() * Math.max(1, path.length - 3));
      currentEnd = path[branchIdx];
    }
  }

  // 보드 생성
  const board: Tile[][] = Array.from({ length: boardSize }, (_, r) =>
    Array.from({ length: boardSize }, (_, c) => ({
      type: 'empty' as TileType,
      rotation: 0,
      powered: false,
      row: r,
      col: c,
    }))
  );

  // 전원 배치
  board[batteryRow][batteryCol] = {
    type: 'battery',
    rotation: 1, // right
    powered: true,
    row: batteryRow,
    col: batteryCol,
    fixed: true,
    correctRotation: 1,
  };

  // 전구 배치 (각 경로의 마지막 셀)
  const bulbPositions = new Set<string>();
  for (const path of allPaths) {
    const [br, bc] = path[path.length - 1];
    bulbPositions.add(cellKey(br, bc));
    const bulbConnections = connections.get(cellKey(br, bc));
    const bulbDir = bulbConnections ? [...bulbConnections][0] : 'left';
    const bulbRotation = DIRECTION_ORDER.indexOf(bulbDir);

    board[br][bc] = {
      type: 'bulb',
      rotation: bulbRotation,
      powered: false,
      row: br,
      col: bc,
      fixed: true,
      correctRotation: bulbRotation,
    };
  }

  // 파이프 배치 (전원, 전구 제외)
  for (const [key, dirs] of connections) {
    const [r, c] = key.split(',').map(Number);
    if (r === batteryRow && c === batteryCol) continue;
    if (bulbPositions.has(key)) continue;

    const dirArray = [...dirs];
    const pipe = getPipeForDirections(dirArray, pipeTypes);

    if (!pipe) {
      // 사용 가능한 파이프가 없으면 실패
      return null;
    }

    board[r][c] = {
      type: pipe.type,
      rotation: pipe.rotation,
      powered: false,
      row: r,
      col: c,
      correctRotation: pipe.rotation,
    };
  }

  // 퍼즐 섞기
  const scrambled = board.map(row =>
    row.map(tile => {
      if (tile.fixed || tile.type === 'empty' || tile.type === 'cross') return tile;
      const rotations = 1 + Math.floor(Math.random() * 3);
      return { ...tile, rotation: (tile.rotation + rotations) % 4 };
    })
  );

  return scrambled;
}

// 최후 수단 간단한 퍼즐
function generateSimplePuzzle(boardSize: number, pipeTypes: TileType[]): Tile[][] {
  const board: Tile[][] = Array.from({ length: boardSize }, (_, r) =>
    Array.from({ length: boardSize }, (_, c) => ({
      type: 'empty' as TileType,
      rotation: 0,
      powered: false,
      row: r,
      col: c,
    }))
  );

  const midRow = Math.floor(boardSize / 2);

  // 전원 (왼쪽)
  board[midRow][0] = {
    type: 'battery',
    rotation: 1,
    powered: true,
    row: midRow,
    col: 0,
    fixed: true,
    correctRotation: 1,
  };

  // 직선 파이프 중간
  for (let c = 1; c < boardSize - 1; c++) {
    board[midRow][c] = {
      type: 'straight' as TileType,
      rotation: 1,
      powered: false,
      row: midRow,
      col: c,
      correctRotation: 1,
    };
  }

  // 전구 (오른쪽 끝)
  board[midRow][boardSize - 1] = {
    type: 'bulb',
    rotation: 3,
    powered: false,
    row: midRow,
    col: boardSize - 1,
    fixed: true,
    correctRotation: 3,
  };

  // L자 경로 추가 (위로 꺾기)
  if (boardSize >= 4 && pipeTypes.includes('curve')) {
    const turnCol = 1 + Math.floor(Math.random() * (boardSize - 3));
    // 꺾는 지점을 커브로
    board[midRow][turnCol] = {
      type: 'curve',
      rotation: 0, // top-right → 위로 가고 오른쪽에서 옴
      powered: false,
      row: midRow,
      col: turnCol,
      correctRotation: 0,
    };

    // 위 방향으로 직선
    if (midRow - 1 >= 0) {
      board[midRow - 1][turnCol] = {
        type: 'curve',
        rotation: 1, // right-bottom → 아래에서 오고 오른쪽으로
        powered: false,
        row: midRow - 1,
        col: turnCol,
        correctRotation: 1,
      };

      // 위 행 직선 파이프
      for (let c = turnCol + 1; c < boardSize - 1; c++) {
        if (board[midRow - 1][c].type === 'empty') {
          board[midRow - 1][c] = {
            type: 'straight',
            rotation: 1,
            powered: false,
            row: midRow - 1,
            col: c,
            correctRotation: 1,
          };
        }
      }
    }
  }

  // 섞기
  return board.map(row =>
    row.map(tile => {
      if (tile.fixed || tile.type === 'empty' || tile.type === 'cross') return tile;
      const rotations = 1 + Math.floor(Math.random() * 3);
      return { ...tile, rotation: (tile.rotation + rotations) % 4 };
    })
  );
}

// 레벨 설정 생성
export function getLevelConfig(level: number): LevelConfig {
  if (level <= 5) {
    return {
      level,
      boardSize: 4,
      bulbCount: 1,
      pipeTypes: ['straight', 'curve'],
      emptyCount: 0,
      hasLockedPipes: false,
      hasBidirectional: false,
      hasTeleport: false,
      teleportPairs: 0,
    };
  }
  if (level <= 10) {
    return {
      level,
      boardSize: 5,
      bulbCount: 1 + (level > 8 ? 1 : 0),
      pipeTypes: ['straight', 'curve', 'tjunction'],
      emptyCount: 0,
      hasLockedPipes: false,
      hasBidirectional: false,
      hasTeleport: false,
      teleportPairs: 0,
    };
  }
  if (level <= 15) {
    return {
      level,
      boardSize: 5,
      bulbCount: 2,
      pipeTypes: ['straight', 'curve', 'tjunction'],
      emptyCount: 2 + Math.floor((level - 11) / 2),
      hasLockedPipes: true,
      hasBidirectional: false,
      hasTeleport: false,
      teleportPairs: 0,
    };
  }
  if (level <= 20) {
    return {
      level,
      boardSize: 6,
      bulbCount: 2 + (level > 18 ? 1 : 0),
      pipeTypes: ['straight', 'curve', 'tjunction', 'cross'],
      emptyCount: 3,
      hasLockedPipes: true,
      hasBidirectional: level >= 16,
      hasTeleport: level >= 20,
      teleportPairs: level >= 20 ? 1 : 0,
    };
  }
  if (level <= 25) {
    return {
      level,
      boardSize: 7,
      bulbCount: 3,
      pipeTypes: ['straight', 'curve', 'tjunction', 'cross'],
      emptyCount: 4,
      hasLockedPipes: true,
      hasBidirectional: true,
      hasTeleport: true,
      teleportPairs: 1,
    };
  }
  return {
    level,
    boardSize: 8,
    bulbCount: 3 + (level > 28 ? 1 : 0),
    pipeTypes: ['straight', 'curve', 'tjunction', 'cross'],
    emptyCount: 6 + Math.floor((level - 26) / 2),
    hasLockedPipes: true,
    hasBidirectional: true,
    hasTeleport: true,
    teleportPairs: level >= 28 ? 2 : 1,
  };
}

export function getInfiniteConfig(difficulty: 'easy' | 'normal' | 'hard'): LevelConfig {
  switch (difficulty) {
    case 'easy':
      return {
        level: 0,
        boardSize: 4,
        bulbCount: 1,
        pipeTypes: ['straight', 'curve'],
        emptyCount: 0,
        hasLockedPipes: false,
        hasBidirectional: false,
        hasTeleport: false,
        teleportPairs: 0,
      };
    case 'normal':
      return {
        level: 0,
        boardSize: 6,
        bulbCount: 2,
        pipeTypes: ['straight', 'curve', 'tjunction'],
        emptyCount: 2,
        hasLockedPipes: false,
        hasBidirectional: false,
        hasTeleport: false,
        teleportPairs: 0,
      };
    case 'hard':
      return {
        level: 0,
        boardSize: 8,
        bulbCount: 3,
        pipeTypes: ['straight', 'curve', 'tjunction', 'cross'],
        emptyCount: 4,
        hasLockedPipes: true,
        hasBidirectional: false,
        hasTeleport: false,
        teleportPairs: 0,
      };
  }
}
