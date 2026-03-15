import type { Tile as TileType } from '../types';
import TileComponent from './Tile';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface BoardProps {
  board: TileType[][];
  onRotate: (row: number, col: number, reverse?: boolean) => void;
  clearAnimating: boolean;
  boardGenId?: number;
}

export default function Board({ board, onRotate, clearAnimating, boardGenId = 0 }: BoardProps) {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handle = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  if (board.length === 0) return null;

  const boardSize = board.length;
  const maxBoardPx = Math.min(480, screenWidth - 40);
  const gap = boardSize <= 5 ? 4 : boardSize <= 7 ? 3 : 2;
  const tileSize = Math.max(44, Math.floor((maxBoardPx - gap * (boardSize - 1)) / boardSize));
  const totalSize = boardSize * tileSize + (boardSize - 1) * gap;

  return (
    <motion.div
      className="relative mx-auto"
      style={{ width: totalSize + 28, padding: 14 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* 보드 배경 */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: 'rgba(15, 15, 40, 0.5)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      />

      {/* 클리어 빛 효과 */}
      {clearAnimating && (
        <motion.div
          className="absolute inset-0 rounded-2xl z-10 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0.3, 0] }}
          transition={{ duration: 1.5 }}
          style={{
            background: 'radial-gradient(circle, rgba(255,217,61,0.5) 0%, rgba(255,217,61,0.1) 50%, transparent 70%)',
          }}
        />
      )}

      {/* 타일 격자 */}
      <div
        className="relative z-[1]"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${boardSize}, ${tileSize}px)`,
          gap: `${gap}px`,
        }}
      >
        {board.map((row, r) =>
          row.map((tile, c) => (
            <TileComponent
              key={`${boardGenId}-${r}-${c}`}
              tile={tile}
              size={tileSize}
              onClick={() => onRotate(r, c)}
              onRightClick={(e) => {
                e.preventDefault();
                onRotate(r, c, true);
              }}
              clearAnimating={clearAnimating}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}
