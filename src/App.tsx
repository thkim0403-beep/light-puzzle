import { useState } from 'react';
import { useGame } from './hooks/useGame';
import Board from './components/Board';
import Header from './components/Header';
import LevelInfo from './components/LevelInfo';
import StartScreen from './components/StartScreen';
import AchievementPopup from './components/AchievementPopup';
import StarryBackground from './components/StarryBackground';
import HowToPlay from './components/HowToPlay';
import { calculateStars, countPipes } from './utils/boardLogic';

export default function App() {
  const game = useGame();
  const [showHelp, setShowHelp] = useState(false);

  const isGameScreen = game.screen === 'game' || (game.screen === 'infinite' && game.board.length > 0) || (game.screen === 'timeAttack' && game.board.length > 0);

  const pipeCount = game.board.length > 0 ? countPipes(game.board) : 1;
  const stars = calculateStars(game.moveCount, pipeCount);

  return (
    <div className="min-h-screen font-[Jua] text-white overflow-hidden select-none" style={{ overscrollBehavior: 'none' }}>
      <StarryBackground isCleared={game.isCleared} />
      <AchievementPopup achievement={game.newAchievement} />
      <HowToPlay open={showHelp} onClose={() => setShowHelp(false)} />

      {!isGameScreen && (
        <StartScreen
          screen={game.screen}
          progress={game.progress}
          achievements={game.achievements}
          maxUnlockedLevel={game.getMaxUnlockedLevel()}
          onStartLevel={game.startLevel}
          onStartInfinite={game.startInfinite}
          onStartTimeAttack={game.startTimeAttack}
          onSetScreen={game.setScreen}
          onShowHelp={() => setShowHelp(true)}
        />
      )}

      {isGameScreen && (
        <div className="flex flex-col items-center min-h-screen py-4">
          <Header
            moveCount={game.moveCount}
            elapsedTime={game.elapsedTime}
            hintsRemaining={game.hintsRemaining}
            currentLevel={game.screen === 'game' ? game.currentLevel : undefined}
            onHint={game.useHint}
            onUndo={game.undo}
            onBack={() => game.setScreen(game.screen === 'game' ? 'levelSelect' : 'start')}
            undoCount={game.undoStack.length}
            timeRemaining={game.timeRemaining}
            timeLimit={game.timeLimit}
            isTimeAttack={game.screen === 'timeAttack'}
          />

          <div className="flex-1 flex items-center justify-center py-4">
            <Board
              board={game.board}
              onRotate={game.rotateTile}
              clearAnimating={game.clearAnimating}
            />
          </div>

          <LevelInfo
            isCleared={game.isCleared}
            moveCount={game.moveCount}
            elapsedTime={game.elapsedTime}
            stars={stars}
            onNext={game.nextLevel}
            onRetry={game.retry}
            onLevelSelect={() => game.setScreen(game.screen === 'game' ? 'levelSelect' : 'start')}
            isTimeAttack={game.screen === 'timeAttack'}
            timeRemaining={game.timeRemaining}
            isTimeUp={game.isTimeUp}
            currentLevel={game.screen === 'game' ? game.currentLevel : undefined}
          />
        </div>
      )}
    </div>
  );
}
