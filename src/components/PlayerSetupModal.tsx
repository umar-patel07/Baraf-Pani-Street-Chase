import React, { useState } from 'react';
import { PlayerConfig } from '../types';
import { DEFAULT_PLAYER_CONFIGS } from '../game/GameManager';
import { soundManager } from '../audio/SoundManager';
import { ArrowRight, ArrowLeft, Play, Users, Keyboard, CheckCircle2 } from 'lucide-react';

interface PlayerSetupModalProps {
  onStartGame: (configs: PlayerConfig[]) => void;
  onCancel: () => void;
}

export const PlayerSetupModal: React.FC<PlayerSetupModalProps> = ({
  onStartGame,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [playerCount, setPlayerCount] = useState<3 | 4 | 5>(3);
  const [playerNames, setPlayerNames] = useState<string[]>([
    'Aarav',
    'Riya',
    'Kabir',
    'Sana',
    'Vihaan',
  ]);

  const handleSelectCount = (count: 3 | 4 | 5) => {
    soundManager.playClick();
    setPlayerCount(count);
    setStep(2);
  };

  const handleNameChange = (index: number, val: string) => {
    const updated = [...playerNames];
    updated[index] = val;
    setPlayerNames(updated);
  };

  const handleProceedToConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    setStep(3);
  };

  const handleFinalStart = () => {
    soundManager.playClick();
    const finalConfigs: PlayerConfig[] = [];
    for (let i = 0; i < playerCount; i++) {
      const base = DEFAULT_PLAYER_CONFIGS[i];
      finalConfigs.push({
        ...base,
        name: playerNames[i]?.trim() || base.name,
      });
    }
    onStartGame(finalConfigs);
  };

  return (
    <div
      id="setup-modal-backdrop"
      className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="setup-modal-card"
        className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-white my-auto"
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Game Setup
            </span>
            <span className="text-xs text-slate-500">• Step {step} of 3</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  step === s ? 'bg-cyan-400 w-5' : step > s ? 'bg-slate-500' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Select Player Count */}
        {step === 1 && (
          <div id="setup-step-1" className="text-center animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white mb-1">HOW MANY PLAYERS?</h2>
            <p className="text-xs text-slate-400 mb-6">
              All players share one keyboard. Pick the number of competitors.
            </p>

            <div className="space-y-3 mb-6">
              {[3, 4, 5].map((num) => (
                <button
                  key={num}
                  id={`btn-select-players-${num}`}
                  onClick={() => handleSelectCount(num as 3 | 4 | 5)}
                  className="w-full py-4 px-6 bg-slate-800/80 hover:bg-cyan-950/50 text-slate-100 hover:text-cyan-200 rounded-2xl border border-slate-700/80 hover:border-cyan-500/60 font-black text-lg transition-all flex items-center justify-between cursor-pointer active:scale-98 shadow-md"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-700/80 flex items-center justify-center text-sm font-bold text-cyan-300">
                      {num}
                    </span>
                    <span>{num} PLAYERS</span>
                  </span>
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                </button>
              ))}
            </div>

            <button
              id="btn-step1-cancel"
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-slate-200 font-semibold cursor-pointer"
            >
              Cancel and Return to Menu
            </button>
          </div>
        )}

        {/* STEP 2: Enter Player Names */}
        {step === 2 && (
          <form
            id="setup-step-2"
            onSubmit={handleProceedToConfirmation}
            className="animate-in fade-in duration-200"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-white mb-1">ENTER PLAYER NAMES</h2>
              <p className="text-xs text-slate-400">
                Custom names for each player ({playerCount} players active).
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {Array.from({ length: playerCount }).map((_, idx) => {
                const cfg = DEFAULT_PLAYER_CONFIGS[idx];
                return (
                  <div
                    key={cfg.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50"
                  >
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 shadow"
                      style={{ backgroundColor: cfg.color }}
                    >
                      P{idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                        Player {idx + 1}
                      </label>
                      <input
                        type="text"
                        id={`input-player-name-${idx + 1}`}
                        required
                        maxLength={16}
                        value={playerNames[idx]}
                        onChange={(e) => handleNameChange(idx, e.target.value)}
                        placeholder={cfg.name}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-semibold focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                id="btn-step2-back"
                onClick={() => setStep(1)}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="submit"
                id="btn-step2-continue"
                className="flex-1 py-3 px-4 bg-cyan-600 hover:bg-cyan-500 font-bold text-sm rounded-xl text-white shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Continue to Controls</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Control Confirmation Screen */}
        {step === 3 && (
          <div id="setup-step-3" className="animate-in fade-in duration-200">
            <div className="text-center mb-5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <Keyboard className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-white mb-1">KEYBOARD ASSIGNMENTS</h2>
              <p className="text-xs text-slate-400">
                Confirm your positions on the keyboard before starting!
              </p>
            </div>

            <div className="space-y-2.5 mb-6 max-h-64 overflow-y-auto pr-1">
              {Array.from({ length: playerCount }).map((_, idx) => {
                const cfg = DEFAULT_PLAYER_CONFIGS[idx];
                const name = playerNames[idx]?.trim() || cfg.name;
                const isStartingCatcher = idx === 0;

                return (
                  <div
                    key={cfg.id}
                    id={`confirm-player-${idx + 1}`}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      isStartingCatcher
                        ? 'bg-rose-950/40 border-rose-500/40'
                        : 'bg-slate-800/40 border-slate-700/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 shadow"
                        style={{ backgroundColor: cfg.color }}
                      >
                        P{idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-100">{name}</span>
                          {isStartingCatcher && (
                            <span className="text-[10px] bg-rose-500 text-white font-black px-1.5 py-0.5 rounded tracking-wide">
                              STARTS AS CATCHER
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {isStartingCatcher ? 'Hunts all other players' : 'Free player (Escape & rescue)'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block font-mono font-bold text-xs bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-cyan-300 shadow-inner">
                        {cfg.keysDescription}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-center mb-6">
              <span className="text-xs font-extrabold text-rose-400 uppercase tracking-wide flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                PLAYER 1 STARTS AS CATCHER
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                id="btn-step3-back"
                onClick={() => setStep(2)}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                id="btn-step3-start-game"
                onClick={handleFinalStart}
                className="flex-1 py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-black text-sm rounded-xl text-white shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>START GAME</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
