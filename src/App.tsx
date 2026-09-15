import { useState, useRef, useEffect, useCallback } from 'react';
import { GameScreen, PlayerConfig, PlayerRuntimeData, PlayerStats } from './types';
import { GameWorld } from './game/GameWorld';
import { gameManager } from './game/GameManager';
import { MainMenu } from './components/MainMenu';
import { PlayerSetupModal } from './components/PlayerSetupModal';
import { PlayerStatusPanel } from './components/PlayerStatusPanel';
import { Minimap } from './components/Minimap';
import { GameOverlay } from './components/GameOverlay';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { soundManager } from './audio/SoundManager';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('MENU');
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);

  // Reactive game runtime snapshot for UI
  const [playersState, setPlayersState] = useState<PlayerRuntimeData[]>([]);
  const [statsState, setStatsState] = useState<PlayerStats[]>([]);

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<GameWorld | null>(null);

  // State sync callback called by GameManager on every tick or event
  const handleGameStateChange = useCallback(() => {
    setPlayersState([...gameManager.players]);
  }, []);

  const handleStartGame = (configs: PlayerConfig[]) => {
    setScreen('PLAYING');
    setShowResults(false);

    // Give DOM a frame to ensure canvasContainerRef is mounted
    setTimeout(() => {
      if (canvasContainerRef.current) {
        if (!worldRef.current) {
          worldRef.current = new GameWorld(canvasContainerRef.current);
        }
        gameManager.init(configs, worldRef.current, handleGameStateChange);
        gameManager.start();
        setPlayersState([...gameManager.players]);
      }
    }, 50);
  };

  const handleTogglePause = () => {
    soundManager.playClick();
    if (screen === 'PLAYING') {
      gameManager.pause();
      setScreen('PAUSED');
    } else if (screen === 'PAUSED') {
      gameManager.resume();
      setScreen('PLAYING');
    }
  };

  const handleResume = () => {
    soundManager.playClick();
    gameManager.resume();
    setScreen('PLAYING');
  };

  const handleRestart = () => {
    soundManager.playClick();
    gameManager.restartMatch();
    setScreen('PLAYING');
    setShowResults(false);
  };

  const handleEndGame = () => {
    soundManager.playClick();
    gameManager.pause();
    const currentStats = Array.from(gameManager.stats.values());
    setStatsState(currentStats);
    setShowResults(true);
    setScreen('RESULTS');
  };

  const handleReturnToMainMenu = () => {
    soundManager.playClick();
    gameManager.stop();
    setScreen('MENU');
    setShowResults(false);
  };

  // Clean up Three.js on unmount
  useEffect(() => {
    return () => {
      gameManager.stop();
      if (worldRef.current) {
        worldRef.current.destroy();
        worldRef.current = null;
      }
    };
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Container */}
      <div
        id="game-canvas-container"
        ref={canvasContainerRef}
        className={`absolute inset-0 w-full h-full ${
          screen === 'MENU' || screen === 'SETUP' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      />

      {/* Main Menu Screen */}
      {screen === 'MENU' && (
        <MainMenu
          onPlay={() => setScreen('SETUP')}
          onHowToPlay={() => setShowHowToPlay(true)}
          onSettings={() => setShowSettings(true)}
        />
      )}

      {/* Player Setup Flow Modal (Step 1, 2, 3) */}
      {screen === 'SETUP' && (
        <PlayerSetupModal
          onStartGame={handleStartGame}
          onCancel={() => setScreen('MENU')}
        />
      )}

      {/* Active In-Game HUD (Only during PLAYING, PAUSED, or RESULTS) */}
      {(screen === 'PLAYING' || screen === 'PAUSED' || screen === 'RESULTS') && (
        <>
          {/* TOP RIGHT: Player Status Panel */}
          <PlayerStatusPanel players={playersState} />

          {/* BOTTOM RIGHT: Minimap */}
          <Minimap players={playersState} />

          {/* BOTTOM LEFT: Quick Controls Bar */}
          <div
            id="quick-controls-bar"
            className="absolute bottom-4 left-4 z-20 pointer-events-none select-none bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-2.5 shadow-2xl text-white hidden sm:flex items-center gap-3 text-xs"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
              Keys:
            </span>
            {playersState.map((p) => {
              const isCatcher = p.state === 'CATCHER';
              const keys =
                p.id === 'p1'
                  ? 'W A S D'
                  : p.id === 'p2'
                  ? '↑ ← ↓ →'
                  : p.id === 'p3'
                  ? 'I J K L'
                  : p.id === 'p4'
                  ? 'T F G H'
                  : '8 4 5 6';

              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                    isCatcher
                      ? 'bg-rose-950/60 border-rose-500/70 text-rose-200 ring-1 ring-rose-500/50'
                      : 'bg-slate-800/60 border-slate-700/40 text-slate-300'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.playerNumber}
                  </span>
                  <span className="font-semibold text-slate-100">{p.name}:</span>
                  <span className="font-mono font-bold tracking-wider text-amber-300">
                    {keys}
                  </span>
                  {isCatcher && (
                    <span className="text-[9px] font-bold bg-rose-500 text-white px-1 rounded ml-0.5">
                      CATCHER
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Center Announcements, Pause Menu, Results */}
          <GameOverlay
            notifications={gameManager.activeNotifications}
            isPaused={screen === 'PAUSED'}
            onTogglePause={handleTogglePause}
            onResume={handleResume}
            onRestart={handleRestart}
            onOpenHowToPlay={() => setShowHowToPlay(true)}
            onEndGame={handleEndGame}
            onMainMenu={handleReturnToMainMenu}
            showResults={showResults}
            stats={statsState}
            onPlayAgain={handleRestart}
          />
        </>
      )}

      {/* How To Play Modal */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </main>
  );
}
