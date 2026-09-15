import React from 'react';
import { PlayerRuntimeData } from '../types';

interface PlayerStatusPanelProps {
  players: PlayerRuntimeData[];
}

export const PlayerStatusPanel: React.FC<PlayerStatusPanelProps> = ({ players }) => {
  return (
    <div
      id="player-status-panel"
      className="absolute top-4 right-4 z-20 pointer-events-none select-none bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-3.5 shadow-2xl min-w-[260px] max-w-[320px] text-white"
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/50">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Player Status
        </span>
        <span className="text-[10px] text-cyan-400 font-medium">Baraf Pani</span>
      </div>

      <div className="space-y-1.5">
        {players.map((p) => {
          const isCatcher = p.state === 'CATCHER';
          const isFrozen = p.state === 'FROZEN';

          return (
            <div
              key={p.id}
              id={`status-row-${p.id}`}
              className={`flex items-center justify-between px-2 py-1.5 rounded-lg transition-all duration-200 ${
                isCatcher
                  ? 'bg-rose-950/50 border border-rose-500/40'
                  : isFrozen
                  ? 'bg-cyan-950/50 border border-cyan-500/40 animate-pulse'
                  : 'bg-slate-800/40 border border-slate-700/20'
              }`}
            >
              {/* Player Icon & Name */}
              <div className="flex items-center space-x-2 min-w-0 pr-2">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 text-white shadow-sm"
                  style={{ backgroundColor: p.color }}
                >
                  P{p.playerNumber}
                </span>
                <span className="text-xs font-semibold text-slate-100 truncate">
                  {p.name}
                </span>
              </div>

              {/* Status Badge & Baraf Indicator */}
              <div className="flex items-center space-x-2 shrink-0">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide ${
                    isCatcher
                      ? 'bg-rose-500 text-white'
                      : isFrozen
                      ? 'bg-cyan-500 text-slate-900'
                      : 'bg-slate-700/80 text-emerald-400'
                  }`}
                >
                  {p.state}
                </span>

                {/* Baraf Count - hidden for active catcher */}
                {!isCatcher ? (
                  <span
                    className={`text-xs font-mono font-bold flex items-center gap-0.5 ${
                      p.barafCount === 2
                        ? 'text-amber-400 font-extrabold'
                        : p.barafCount === 1
                        ? 'text-cyan-300'
                        : 'text-slate-400'
                    }`}
                  >
                    <span className="text-cyan-400 text-[11px]">❄</span>
                    {p.barafCount}/3
                  </span>
                ) : (
                  <span className="text-rose-400 text-xs font-mono font-bold">🎯 DEN</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
