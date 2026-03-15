import { motion } from 'framer-motion';
import type { Tile as TileType } from '../types';

interface TileProps {
  tile: TileType;
  size: number;
  onClick: () => void;
  onRightClick: (e: React.MouseEvent) => void;
  clearAnimating?: boolean;
}

// 기본 형태 SVG (rotation=0 기준) — 실제 회전은 CSS transform으로
function PipeSVG({ tile, size }: { tile: TileType; size: number }) {
  const s = size;
  const center = s / 2;
  const powered = tile.powered;
  const color = powered ? '#FFD93D' : '#777';
  const strokeW = powered ? 10 : 8;

  // 기본 연결 (rotation=0)
  let lines: [number, number, number, number][] = [];

  switch (tile.type) {
    case 'straight':
      // 위-아래
      lines = [[center, 0, center, s]];
      break;
    case 'curve':
      // 위-오른쪽 (L자)
      lines = [
        [center, 0, center, center],
        [center, center, s, center],
      ];
      break;
    case 'tjunction':
      // 위, 오른쪽, 아래 (T자)
      lines = [
        [center, 0, center, s],
        [center, center, s, center],
      ];
      break;
    case 'cross':
      lines = [
        [center, 0, center, s],
        [0, center, s, center],
      ];
      break;
    case 'locked':
    case 'bidirectional':
      // 기본은 straight처럼
      lines = [[center, 0, center, s]];
      break;
    default:
      break;
  }

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className="block">
      <defs>
        <filter id={`glow-${tile.row}-${tile.col}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 파이프 선 */}
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]}
          stroke={color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          filter={powered ? `url(#glow-${tile.row}-${tile.col})` : undefined}
        />
      ))}

      {/* 중앙 원 (연결점) */}
      {(tile.type === 'curve' || tile.type === 'tjunction' || tile.type === 'cross') && (
        <circle cx={center} cy={center} r={strokeW / 2} fill={color}
          filter={powered ? `url(#glow-${tile.row}-${tile.col})` : undefined}
        />
      )}

      {/* 전기 흐름 애니메이션 */}
      {powered && lines.map((l, i) => (
        <line
          key={`flow-${i}`}
          x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]}
          stroke="#FFF8DC"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="4 8"
          opacity={0.7}
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-24"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </line>
      ))}
    </svg>
  );
}

export default function Tile({ tile, size, onClick, onRightClick, clearAnimating }: TileProps) {
  const isPipe = ['straight', 'curve', 'tjunction', 'cross', 'locked', 'bidirectional'].includes(tile.type);
  const isClickable = isPipe && !tile.fixed && tile.type !== 'cross' && tile.type !== 'locked';

  // 시각적 회전 각도 (rotation * 90도)
  const rotationDeg = tile.rotation * 90;

  return (
    <div
      className={`relative flex items-center justify-center rounded-lg overflow-hidden ${
        tile.type === 'empty'
          ? 'bg-white/5'
          : isClickable
            ? 'bg-slate-800/60 cursor-pointer hover:bg-slate-700/60'
            : 'bg-slate-800/60'
      } ${tile.hinting ? 'ring-2 ring-green-400' : ''}`}
      style={{ width: size, height: size }}
      onClick={isClickable ? onClick : undefined}
      onContextMenu={isClickable ? onRightClick : undefined}
    >
      {/* 빈 칸 */}
      {tile.type === 'empty' && (
        <div className="w-full h-full rounded-lg opacity-20 bg-gradient-to-br from-slate-700 to-slate-800" />
      )}

      {/* 전원 (배터리) */}
      {tile.type === 'battery' && (
        <motion.div
          className="flex items-center justify-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-md" style={{ width: size * 0.7, height: size * 0.7, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
            <span className="relative z-10" style={{ fontSize: size * 0.5 }}>⚡</span>
          </div>
        </motion.div>
      )}

      {/* 전구 */}
      {tile.type === 'bulb' && (
        <motion.div
          className="flex items-center justify-center relative"
          animate={
            tile.powered
              ? { scale: [1, 1.2, 1] }
              : {}
          }
          transition={{ duration: 0.4 }}
        >
          {tile.powered && (
            <motion.div
              className="absolute rounded-full"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0.3, 0.6, 0.3], scale: 1 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                width: size * 1.2,
                height: size * 1.2,
                background: 'radial-gradient(circle, rgba(255,217,61,0.5) 0%, transparent 70%)',
              }}
            />
          )}
          <span
            className={`relative z-10 ${tile.powered ? 'drop-shadow-[0_0_12px_rgba(255,217,61,0.9)]' : 'opacity-40 grayscale'}`}
            style={{ fontSize: size * 0.5 }}
          >
            💡
          </span>
        </motion.div>
      )}

      {/* 파이프 — rotation은 CSS transform으로 애니메이션 */}
      {isPipe && (
        <motion.div
          className="absolute inset-1"
          animate={{ rotate: rotationDeg }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
            duration: 0.25,
          }}
          style={{ transformOrigin: 'center center' }}
        >
          <PipeSVG tile={tile} size={size - 8} />
        </motion.div>
      )}

      {/* 잠긴 파이프 표시 */}
      {tile.type === 'locked' && (
        <div className="absolute top-0.5 right-0.5 text-xs z-10">🔒</div>
      )}

      {/* 양방향 회전 표시 */}
      {tile.type === 'bidirectional' && (
        <div className="absolute bottom-0.5 right-0.5 text-xs opacity-60 z-10">↔</div>
      )}

      {/* 힌트 반짝 효과 */}
      {tile.hinting && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0, 0.5, 0] }}
          transition={{ duration: 1 }}
          style={{ background: 'rgba(74, 222, 128, 0.3)' }}
        />
      )}

      {/* 클리어 시 빛 효과 */}
      {clearAnimating && tile.powered && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0] }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{ background: 'radial-gradient(circle, rgba(255,217,61,0.6) 0%, transparent 70%)' }}
        />
      )}
    </div>
  );
}
