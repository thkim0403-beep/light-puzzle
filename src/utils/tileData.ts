import type { Direction, TileType } from '../types';

// 각 타일의 기본 연결 방향 (rotation = 0일 때)
const BASE_CONNECTIONS: Record<string, Direction[]> = {
  battery_top: ['top'],
  battery_right: ['right'],
  battery_bottom: ['bottom'],
  battery_left: ['left'],
  bulb_top: ['top'],
  bulb_right: ['right'],
  bulb_bottom: ['bottom'],
  bulb_left: ['left'],
  straight: ['top', 'bottom'],
  curve: ['top', 'right'],
  tjunction: ['top', 'right', 'bottom'],
  cross: ['top', 'right', 'bottom', 'left'],
  empty: [],
};

const DIRECTION_ORDER: Direction[] = ['top', 'right', 'bottom', 'left'];

// 방향을 rotation만큼 시계방향 회전
function rotateDirection(dir: Direction, rotation: number): Direction {
  const idx = DIRECTION_ORDER.indexOf(dir);
  return DIRECTION_ORDER[(idx + rotation) % 4];
}

// 반대 방향
export function oppositeDirection(dir: Direction): Direction {
  const map: Record<Direction, Direction> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  };
  return map[dir];
}

// 타일의 현재 rotation에서의 연결 방향들
export function getConnections(type: TileType, rotation: number, subDirection?: Direction): Direction[] {
  if (type === 'empty') return [];
  if (type === 'cross') return ['top', 'right', 'bottom', 'left'];

  if (type === 'battery' || type === 'bulb') {
    const key = `${type}_${subDirection || 'right'}`;
    const base = BASE_CONNECTIONS[key] || ['right'];
    return base;
  }

  // teleport, locked, bidirectional은 파이프 종류와 동일하게 처리
  let baseType = type;
  if (type === 'locked' || type === 'bidirectional') {
    baseType = 'straight'; // 기본값, 실제로는 tile의 내부 파이프 타입 사용
  }

  const base = BASE_CONNECTIONS[baseType as string] || [];
  return base.map(d => rotateDirection(d, rotation));
}

// 파이프 타일의 연결 방향 계산 (일반 파이프용)
export function getPipeConnections(type: TileType, rotation: number): Direction[] {
  if (type === 'empty') return [];
  if (type === 'cross') return ['top', 'right', 'bottom', 'left'];

  const typeKey = type === 'locked' || type === 'bidirectional' ? 'straight' : type;
  const base = BASE_CONNECTIONS[typeKey as string];
  if (!base) return [];
  return base.map(d => rotateDirection(d, rotation));
}

// 타일이 회전 가능한지
export function isRotatable(type: TileType): boolean {
  return !['battery', 'bulb', 'empty', 'cross', 'locked'].includes(type);
}

// 타일이 파이프인지 (연결에 참여하는지)
export function isPipe(type: TileType): boolean {
  return !['empty'].includes(type);
}

// 방향 벡터
export function directionDelta(dir: Direction): { dr: number; dc: number } {
  switch (dir) {
    case 'top': return { dr: -1, dc: 0 };
    case 'bottom': return { dr: 1, dc: 0 };
    case 'left': return { dr: 0, dc: -1 };
    case 'right': return { dr: 0, dc: 1 };
  }
}
