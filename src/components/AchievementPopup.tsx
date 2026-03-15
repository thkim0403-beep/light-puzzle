import { motion, AnimatePresence } from 'framer-motion';
import type { Achievement } from '../types';

interface AchievementPopupProps {
  achievement: Achievement | null;
}

export default function AchievementPopup({ achievement }: AchievementPopupProps) {
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100]"
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <div className="bg-gradient-to-r from-yellow-600/90 to-orange-600/90 backdrop-blur-md rounded-2xl px-6 py-4 shadow-2xl border border-yellow-400/30 flex items-center gap-3">
            <motion.span
              className="text-3xl"
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              {achievement.icon}
            </motion.span>
            <div>
              <p className="text-yellow-200 text-xs font-bold">업적 달성!</p>
              <p className="text-white font-bold">{achievement.name}</p>
              <p className="text-yellow-200/60 text-xs">{achievement.description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
