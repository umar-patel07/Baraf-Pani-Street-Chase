import React from 'react';
import { X, Sparkles, ShieldAlert, HeartHandshake, RotateCw, Keyboard } from 'lucide-react';
import { soundManager } from '../audio/SoundManager';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const handleClose = () => {
    soundManager.playClick();
    onClose();
  };

  return (
    <div
      id="how-to-play-backdrop"
      className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="how-to-play-card"
        className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl text-white my-auto max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                HOW TO PLAY BARAF PANI
              </h2>
              <p className="text-xs text-slate-400">
                Traditional street party game reimagined for 3–5 keyboard players
              </p>
            </div>
          </div>
          <button
            id="btn-close-how-to-play"
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300 mb-6">
          {/* Rule 1: The Catcher */}
          <div className="p-4 rounded-2xl bg-rose-950/25 border border-rose-500/30 flex gap-3.5">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-rose-300 text-sm mb-1">
                1. The Catcher (Denner)
              </h3>
              <p className="text-slate-300 leading-relaxed">
                One player starts as the Catcher, identified by a glowing inverted triangle over their head.
                The Catcher’s mission is to chase and tag the Free players around the playground.
              </p>
            </div>
          </div>

          {/* Rule 2: Baraf & Freezing */}
          <div className="p-4 rounded-2xl bg-cyan-950/25 border border-cyan-500/30 flex gap-3.5">
            <span className="text-cyan-400 text-lg font-bold shrink-0">❄</span>
            <div>
              <h3 className="font-bold text-cyan-300 text-sm mb-1">
                2. Baraf (Freezing)
              </h3>
              <p className="text-slate-300 leading-relaxed">
                When the Catcher tags a free player, they shout <strong>BARAF!</strong> The player is encased in ice and completely immobilized.
                The Catcher cannot increase Baraf on an already frozen player.
              </p>
            </div>
          </div>

          {/* Rule 3: Pani & Rescue */}
          <div className="p-4 rounded-2xl bg-emerald-950/25 border border-emerald-500/30 flex gap-3.5">
            <HeartHandshake className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-emerald-300 text-sm mb-1">
                3. Pani (Rescue)
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Any Free teammate can rescue a frozen player simply by touching them.
                This triggers <strong>PANI!</strong>, shattering the ice and restoring their full movement!
              </p>
            </div>
          </div>

          {/* Rule 4: The 3rd Baraf / Catcher Rotation */}
          <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-500/30 flex gap-3.5">
            <RotateCw className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-300 text-sm mb-1">
                4. Third Baraf & New Catcher System
              </h3>
              <p className="text-slate-300 leading-relaxed">
                If the same player accumulates <strong>3 Baraf (3/3)</strong>, they lose the current cycle and automatically become the <strong>NEW CATCHER</strong>!
                Their count resets to 0/3, they spawn at the central catcher position, the previous catcher becomes a free player, and the chase continues seamlessly forever without a timer!
              </p>
            </div>
          </div>

          {/* Controls Summary Table */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-2 mb-3">
              <Keyboard className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">Keyboard Controls (1 Keyboard)</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-rose-400 font-bold">Player 1:</span> W A S D
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-blue-400 font-bold">Player 2:</span> Arrow Keys (↑ ↓ ← →)
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-emerald-400 font-bold">Player 3:</span> I J K L
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-amber-400 font-bold">Player 4:</span> T F G H
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800 sm:col-span-2">
                <span className="text-purple-400 font-bold">Player 5:</span> Numpad 8 4 5 6 (or regular 8 4 5 6)
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            id="btn-how-to-play-got-it"
            onClick={handleClose}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold text-sm shadow-lg transition cursor-pointer"
          >
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
