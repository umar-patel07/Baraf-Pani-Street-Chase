import React, { useState } from 'react';
import { X, Volume2, VolumeX, Sliders, Check } from 'lucide-react';
import { soundManager } from '../audio/SoundManager';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [volume, setVolume] = useState<number>(soundManager.getVolume() * 100);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    soundManager.setVolume(val / 100);
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    soundManager.playClick();
  };

  const handleClose = () => {
    soundManager.playClick();
    onClose();
  };

  return (
    <div
      id="settings-modal-backdrop"
      className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        id="settings-modal-card"
        className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-white my-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-slate-800 text-slate-300">
              <Sliders className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-white">SETTINGS</h2>
          </div>
          <button
            id="btn-close-settings"
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 mb-6">
          {/* Audio volume slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                <span>Sound Effects Volume</span>
              </label>
              <span className="text-xs font-mono font-bold text-slate-400">
                {isMuted ? 'MUTED' : `${Math.round(volume)}%`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="slider-volume"
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                disabled={isMuted}
                className="flex-1 accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40"
              />
              <button
                id="btn-toggle-mute"
                onClick={handleToggleMute}
                className={`p-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  isMuted
                    ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
            </div>
          </div>

          {/* Graphics Quality Info */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Graphics & Lighting
            </h4>
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span>Shadow Maps</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> High (2048 Soft)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Antialiasing</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> MSAA Enabled
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tone Mapping</span>
                <span className="text-emerald-400 font-semibold">ACES Filmic</span>
              </div>
            </div>
          </div>
        </div>

        <button
          id="btn-settings-save"
          onClick={handleClose}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-sm shadow transition cursor-pointer text-white"
        >
          Close Settings
        </button>
      </div>
    </div>
  );
};
