import React, { useEffect } from 'react';
import { GameEventNotification, PlayerStats } from '../types';
import { Pause, Play, RotateCcw, Award, Home, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GameOverlayProps {
  notifications: GameEventNotification[];
  isPaused: boolean;
  onTogglePause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onOpenHowToPlay: () => void;
  onEndGame: () => void;
  onMainMenu: () => void;
  showResults: boolean;
  stats: PlayerStats[];
  onPlayAgain: () => void;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({
  notifications,
  isPaused,
  onTogglePause,
  onResume,
  onRestart,
  onOpenHowToPlay,
  onEndGame,
  onMainMenu,
  showResults,
  stats,
  onPlayAgain,
}) => {
  // ESC key listener for toggling pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!showResults) {
          onTogglePause();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePause, showResults]);

  // Confetti on results
  useEffect(() => {
    if (showResults) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [showResults]);

  const latestNotification = notifications.length > 0 ? notifications[notifications.length - 1] : null;

  return (
    <>
      {/* Top-Left Discreet Pause Button */}
      {!showResults && (
        <div className="absolute top-4 left-4 z-20">
          <button
            id="btn-pause-toggle"
            onClick={onTogglePause}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 shadow-lg text-xs font-semibold backdrop-blur transition-all active:scale-95 cursor-pointer"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
            <span className="text-[10px] text-slate-500 font-mono ml-1">(ESC)</span>
          </button>
        </div>
      )}

      {/* Center Temporary Announcement Banner */}
      {latestNotification && !isPaused && !showResults && (
        <div
          id={`notification-${latestNotification.id}`}
          className="absolute inset-x-0 top-24 z-30 pointer-events-none flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200"
        >
          <div
            className="px-8 py-3 rounded-2xl shadow-2xl backdrop-blur-md border border-white/20 text-center transform scale-105 transition-transform"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              boxShadow: `0 10px 40px -10px ${latestNotification.color}66`,
            }}
          >
            <h1
              className="text-4xl sm:text-5xl font-black tracking-wider uppercase drop-shadow-md"
              style={{ color: latestNotification.color }}
            >
              {latestNotification.primaryText}
            </h1>
            {latestNotification.secondaryText && (
              <p className="text-sm sm:text-base font-semibold text-slate-200 mt-1 drop-shadow">
                {latestNotification.secondaryText}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Pause Menu Modal */}
      {isPaused && !showResults && (
        <div
          id="pause-modal-backdrop"
          className="absolute inset-0 z-40 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            id="pause-menu-card"
            className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center text-white"
          >
            <h2 className="text-2xl font-black text-slate-100 mb-1 tracking-wide">
              GAME PAUSED
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Take a breath! Press ESC or choose an action.
            </p>

            <div className="space-y-2.5">
              <button
                id="btn-pause-resume"
                onClick={onResume}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4" />
                Resume Match
              </button>

              <button
                id="btn-pause-how-to-play"
                onClick={onOpenHowToPlay}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-sm border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                How to Play & Controls
              </button>

              <button
                id="btn-pause-restart"
                onClick={onRestart}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-sm border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                Restart Match
              </button>

              <button
                id="btn-pause-end-game"
                onClick={onEndGame}
                className="w-full py-2.5 px-4 bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 rounded-xl font-semibold text-sm border border-indigo-700/50 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4 text-indigo-400" />
                End Match & View Stats
              </button>

              <button
                id="btn-pause-main-menu"
                onClick={onMainMenu}
                className="w-full py-2.5 px-4 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl font-semibold text-sm border border-rose-800/40 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4 text-rose-400" />
                Return to Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match Results Modal */}
      {showResults && (
        <div
          id="results-modal-backdrop"
          className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            id="results-card"
            className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl text-white my-auto"
          >
            <div className="text-center mb-6">
              <span className="inline-block p-3 bg-amber-500/20 text-amber-400 rounded-2xl mb-3">
                <Award className="w-8 h-8" />
              </span>
              <h2 className="text-3xl font-black tracking-tight text-white">
                GAME RESULTS
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Here are the match highlights for all players!
              </p>
            </div>

            {/* Statistics Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 mb-6">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400">
                    <th className="py-3 px-3">Player</th>
                    <th className="py-3 px-2 text-center">Catches</th>
                    <th className="py-3 px-2 text-center">Baraf (❄)</th>
                    <th className="py-3 px-2 text-center">Pani (Rescues)</th>
                    <th className="py-3 px-2 text-center">Times Catcher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stats.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 flex items-center gap-2 font-semibold">
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                          style={{ backgroundColor: s.color }}
                        >
                          {s.playerNumber}
                        </span>
                        <span className="text-slate-100 truncate">{s.name}</span>
                      </td>
                      <td className="py-3 px-2 text-center font-mono font-bold text-rose-400">
                        {s.catchesMade}
                      </td>
                      <td className="py-3 px-2 text-center font-mono font-bold text-cyan-400">
                        {s.barafReceived}
                      </td>
                      <td className="py-3 px-2 text-center font-mono font-bold text-emerald-400">
                        {s.paniRescues}
                      </td>
                      <td className="py-3 px-2 text-center font-mono font-bold text-amber-400">
                        {s.timesBecameCatcher}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="btn-results-play-again"
                onClick={onPlayAgain}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
              <button
                id="btn-results-main-menu"
                onClick={onMainMenu}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-sm border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Home className="w-4 h-4" />
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
