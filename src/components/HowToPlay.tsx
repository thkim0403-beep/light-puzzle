import { motion, AnimatePresence } from 'framer-motion';

interface HowToPlayProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    icon: '⚡',
    title: '전원에서 시작!',
    desc: '번개 표시가 있는 곳이 전원이에요.\n여기서 전기가 출발해요.',
  },
  {
    icon: '👆',
    title: '파이프를 돌려요',
    desc: '파이프를 터치(클릭)하면\n시계 방향으로 90도 회전해요.',
  },
  {
    icon: '🔗',
    title: '파이프를 연결해요',
    desc: '파이프끼리 방향이 맞아야 연결돼요.\n연결되면 노란색으로 빛나요!',
  },
  {
    icon: '💡',
    title: '전구에 불을 켜요!',
    desc: '전원에서 전구까지 파이프를 모두 연결하면\n전구에 불이 켜져요!',
  },
];

const pipeGuide = [
  { name: '직선', shape: '━', desc: '위-아래 또는 좌-우 연결' },
  { name: '곡선', shape: '┗', desc: 'L자로 꺾어서 연결' },
  { name: 'T자', shape: '┣', desc: '세 방향으로 연결' },
  { name: '십자', shape: '╋', desc: '네 방향 모두 연결 (회전 불필요)' },
];

const tips = [
  '💡 힌트 버튼을 누르면 파이프 하나를 정답으로 돌려줘요',
  '↩ 실수했다면 되돌리기 버튼을 눌러보세요',
  '⭐ 적은 횟수로 클리어하면 별 3개를 받아요!',
  '🔒 자물쇠 파이프는 이미 정답이에요 — 단서로 활용하세요',
];

export default function HowToPlay({ open, onClose }: HowToPlayProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-white/10"
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 제목 */}
            <div className="text-center mb-5">
              <span className="text-4xl">📖</span>
              <h2 className="text-2xl font-bold text-yellow-300 mt-1">놀이 방법</h2>
            </div>

            {/* 단계별 설명 */}
            <div className="space-y-3 mb-6">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/5"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-500/15 flex items-center justify-center text-xl">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-0.5">
                      <span className="text-yellow-400 mr-1">{i + 1}.</span>
                      {step.title}
                    </h3>
                    <p className="text-xs text-white/55 whitespace-pre-line leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 파이프 종류 */}
            <div className="mb-5">
              <h3 className="text-sm font-bold text-white/70 mb-2">🔧 파이프 종류</h3>
              <div className="grid grid-cols-2 gap-2">
                {pipeGuide.map((p, i) => (
                  <div
                    key={i}
                    className="bg-white/5 rounded-lg p-2.5 border border-white/5 text-center"
                  >
                    <span className="text-2xl text-gray-400 block mb-1">{p.shape}</span>
                    <span className="text-xs font-bold text-white/80 block">{p.name}</span>
                    <span className="text-[10px] text-white/40">{p.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 팁 */}
            <div className="mb-5">
              <h3 className="text-sm font-bold text-white/70 mb-2">✨ 꿀팁</h3>
              <div className="space-y-1.5">
                {tips.map((tip, i) => (
                  <p key={i} className="text-xs text-white/50 bg-white/5 rounded-lg px-3 py-2">
                    {tip}
                  </p>
                ))}
              </div>
            </div>

            {/* 닫기 */}
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold text-base transition-colors"
            >
              알겠어요! 시작하기
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
