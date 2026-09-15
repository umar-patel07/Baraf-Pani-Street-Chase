import React from 'react';
import { Play, HelpCircle, Settings, LogOut, Users, Sparkles } from 'lucide-react';
import { soundManager } from '../audio/SoundManager';

interface MainMenuProps {
  onPlay: () => void;
  onHowToPlay: () => void;
  onSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onPlay,
  onHowToPlay,
  onSettings,
}) => {
  const handleAction = (cb: () => void) => {
    soundManager.playClick();
    cb();
  };

  return (
    <div
      id="main-menu-screen"
      className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-radial from-slate-900 via-slate-950 to-black text-white select-none overflow-hidden"
    >
      {/* Decorative ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Title & Tagline */}
      <div className="text-center mb-10 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold tracking-wider uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Local Keyboard Party Game</span>
        </div>

        <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight uppercase drop-shadow-2xl">
          <span className="text-cyan-400">BARAF</span>{' '}
          <span className="text-rose-500">PANI</span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-md mx-auto font-medium">
          3 to 5 players on 1 keyboard. One catcher hunts, free players freeze and rescue. 3 Baraf turns you into the new catcher!
        </p>
      </div>

      {/* Main Options */}
      <div className="w-full max-w-xs space-y-3 relative z-10">
        <button
          id="btn-menu-play"
          onClick={() => handleAction(onPlay)}
          className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
        >
          <Play className="w-6 h-6 fill-white" />
          <span>PLAY</span>
        </button>

        <button
          id="btn-menu-how-to-play"
          onClick={() => handleAction(onHowToPlay)}
          className="w-full py-3 px-5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold text-sm rounded-xl border border-slate-700/80 hover:border-slate-600 transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
        >
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>HOW TO PLAY</span>
        </button>

        <button
          id="btn-menu-settings"
          onClick={() => handleAction(onSettings)}
          className="w-full py-3 px-5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold text-sm rounded-xl border border-slate-700/80 hover:border-slate-600 transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>SETTINGS</span>
        </button>

        <button
          id="btn-menu-exit"
          onClick={() => {
            soundManager.playClick();
            window.location.reload();
          }}
          className="w-full py-2.5 px-4 bg-transparent hover:bg-slate-900/50 text-slate-500 hover:text-slate-300 font-semibold text-xs rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>RELOAD / EXIT</span>
        </button>
      </div>

      {/* Footer info */}
      <div className="absolute bottom-6 flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Users className="w-4 h-4 text-slate-400" />
        <span>Designed for 3–5 Players Sharing One Keyboard</span>
      </div>
    </div>
  );
};
