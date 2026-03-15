import type { Tile, Direction } from '../types';
import { oppositeDirection, directionDelta } from './tileData';

// 타일의 현재 상태에서 연결 방향 가져오기
export function getTileConnections(tile: Tile): Direction[] {
  const { type, rotation } = tile;

  if (type === 'empty') return [];
  if (type === 'cross') return ['top', 'right', 'bottom', 'left'];

  // battery와 bulb는 고정 방향 (rotation 필드에 방향 인코딩)
  if (type === 'battery' || type === 'bulb') {
    const dirs: Direction[] = ['top', 'right', 'bottom', 'left'];
    return [dirs[rotation]];
  }

  const DIRECTION_ORDER: Direction[] = ['top', 'right', 'bottom', 'left'];

  function rotateDir(dir: Direction, rot: number): Direction {
    const idx = DIRECTION_ORDER.indexOf(dir);
    return DIRECTION_ORDER[(idx + rot) % 4];
  }

  // 기본 연결 (rotation=0)
  let baseConnections: Direction[];
  switch (type) {
    case 'straight':
      baseConnections = ['top', 'bottom'];
      break;
    case 'curve':
      baseConnections = ['top', 'right'];
      break;
    case 'tjunction':
      baseConnections = ['top', 'right', 'bottom'];
      break;
    case 'locked':
    case 'bidirectional':
      // locked/bidirectional은 실제로 straight/curve/tjunction 중 하나인데,
      // correctRotation에 저장된 파이프 정보를 사용
      // 여기서는 straight로 기본 처리 (실제 구현에서는 별도 처리)
      baseConnections = ['top', 'bottom'];
      break;
    case 'teleport':
      // 텔레포트는 4방향 모두 입력 가능
      return ['top', 'right', 'bottom', 'left'];
    default:
      return [];
  }

  return baseConnections.map(d => rotateDir(d, rotation));
}

// 두 인접 타일이 연결되는지 확인
export function areConnected(tileA: Tile, tileB: Tile, dirFromAtoB: Direction): boolean {
  const connectionsA = getTileConnections(tileA);
  const connectionsB = getTileConnections(tileB);
  const oppositeDir = oppositeDirection(dirFromAtoB);

  return connectionsA.includes(dirFromAtoB) && connectionsB.includes(oppositeDir);
}

// BFS로 전기 흐름 계산
export function calculatePower(board: Tile[][]): Tile[][] {
  const rows = board.length;
  const cols = board[0].length;

  // 모든 타일의 powered를 false로 초기화
  const newBoard = board.map(row =>
    row.map(tile => ({ ...tile, powered: false }))
  );

  // 텔레포트 쌍 매핑
  const teleportPairs = new Map<number, Tile[]>();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tile = newBoard[r][c];
      if (tile.type === 'teleport' && tile.teleportPairId !== undefined) {
        if (!teleportPairs.has(tile.teleportPairId)) {
          teleportPairs.set(tile.teleportPairId, []);
        }
        teleportPairs.get(tile.teleportPairId)!.push(tile);
      }
    }
  }

  // 전원(battery) 찾기
  const queue: { row: number; col: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newBoard[r][c].type === 'battery') {
        newBoard[r][c].powered = true;
        queue.push({ row: r, col: c });
      }
    }
  }

  // BFS
  const directions: Direction[] = ['top', 'right', 'bottom', 'left'];
  const visited = new Set<string>();

  for (const q of queue) {
    visited.add(`${q.row},${q.col}`);
  }

  while (queue.length > 0) {
    const { row, col } = queue.shift()!;
    const currentTile = newBoard[row][col];

    // 텔레포트 처리
    if (currentTile.type === 'teleport' && currentTile.teleportPairId !== undefined) {
      const pair = teleportPairs.get(currentTile.teleportPairId);
      if (pair) {
        for (const partner of pair) {
          if (partner.row !== row || partner.col !== col) {
            const key = `${partner.row},${partner.col}`;
            if (!visited.has(key)) {
              visited.add(key);
              newBoard[partner.row][partner.col].powered = true;
              queue.push({ row: partner.row, col: partner.col });
            }
          }
        }
      }
    }

    // 인접 타일 확인
    for (const dir of directions) {
      const { dr, dc } = directionDelta(dir);
      const nr = row + dr;
      const nc = col + dc;

      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;

      const key = `${nr},${nc}`;
      if (visited.has(key)) continue;

      const neighbor = newBoard[nr][nc];
      if (neighbor.type === 'empty') continue;

      if (areConnected(currentTile, neighbor, dir)) {
        visited.add(key);
        neighbor.powered = true;
        queue.push({ row: nr, col: nc });
      }
    }
  }

  return newBoard;
}

// 모든 전구가 켜졌는지 확인
export function isAllBulbsPowered(board: Tile[][]): boolean {
  for (const row of board) {
    for (const tile of row) {
      if (tile.type === 'bulb' && !tile.powered) {
        return false;
      }
    }
  }
  return true;
}

// 별점 계산 (회전 횟수 기준)
export function calculateStars(moveCount: number, pipeCount: number): number {
  if (moveCount <= pipeCount * 1.5) return 3;
  if (moveCount <= pipeCount * 2) return 2;
  return 1;
}

// 파이프 타일 개수
export function countPipes(board: Tile[][]): number {
  let count = 0;
  for (const row of board) {
    for (const tile of row) {
      if (
        tile.type !== 'empty' &&
        tile.type !== 'battery' &&
        tile.type !== 'bulb' &&
        tile.type !== 'locked'
      ) {
        count++;
      }
    }
  }
  return count;
}
