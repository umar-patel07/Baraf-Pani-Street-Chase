import React, { useRef, useEffect } from 'react';
import { PlayerRuntimeData } from '../types';
import { MAP_CONFIG, MAP_OBSTACLES } from '../game/MapData';

interface MinimapProps {
  players: PlayerRuntimeData[];
}

export const Minimap: React.FC<MinimapProps> = ({ players }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Padding inside minimap
    const pad = 12;
    const mapW = MAP_CONFIG.width;
    const mapD = MAP_CONFIG.depth;

    // Scale factors from world coords to canvas coords
    const scaleX = (width - pad * 2) / mapW;
    const scaleZ = (height - pad * 2) / mapD;

    const toCanvasX = (wx: number) => pad + (wx - MAP_CONFIG.minX) * scaleX;
    const toCanvasZ = (wz: number) => pad + (wz - MAP_CONFIG.minZ) * scaleZ;

    // 1. Draw Map Background & Boundary
    ctx.fillStyle = '#1e293b'; // Slate background
    ctx.fillRect(pad, pad, width - pad * 2, height - pad * 2);

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

    // Subtle cross-roads
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, height / 2);
    ctx.lineTo(width - pad, height / 2);
    ctx.moveTo(width / 2, pad);
    ctx.lineTo(width / 2, height - pad);
    ctx.stroke();

    // Orientation Labels
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('▲ NORTH', width / 2, pad - 3);
    ctx.fillText('▼ SOUTH (CATCHER)', width / 2, height - 2);

    // 2. Draw Obstacles
    MAP_OBSTACLES.forEach((obs) => {
      const cx = toCanvasX(obs.x);
      const cz = toCanvasZ(obs.z);

      if (obs.type === 'fountain') {
        // Central Fountain
        const r = (obs.radius || 3.5) * scaleX;
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(cx, cz, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (obs.type === 'car') {
        // Cars
        const w = obs.width * scaleX;
        const d = obs.depth * scaleZ;
        ctx.fillStyle = obs.color || '#3b82f6';
        ctx.fillRect(cx - w / 2, cz - d / 2, w, d);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - w / 2, cz - d / 2, w, d);
      } else if (obs.type === 'box') {
        // Crates
        const w = obs.width * scaleX;
        const d = obs.depth * scaleZ;
        ctx.fillStyle = '#b45309';
        ctx.fillRect(cx - w / 2, cz - d / 2, w, d);
      } else if (obs.type === 'wall') {
        // Walls
        const w = obs.width * scaleX;
        const d = obs.depth * scaleZ;
        ctx.fillStyle = '#9333ea';
        ctx.fillRect(cx - w / 2, cz - d / 2, w, d);
      } else if (obs.type === 'tree') {
        // Trees
        const r = (obs.radius || 1.3) * scaleX;
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(cx, cz, r, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === 'bench') {
        const w = obs.width * scaleX;
        const d = obs.depth * scaleZ;
        ctx.fillStyle = '#78350f';
        ctx.fillRect(cx - w / 2, cz - d / 2, w, d);
      }
    });

    // 3. Draw Players
    players.forEach((p) => {
      const px = toCanvasX(p.x);
      const pz = toCanvasZ(p.z);
      const isCatcher = p.state === 'CATCHER';
      const isFrozen = p.state === 'FROZEN';

      if (isCatcher) {
        // Catcher: Pulsing Red Radar Ring
        const pulse = Math.sin(Date.now() * 0.008) * 2;
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.beginPath();
        ctx.arc(px, pz, 11 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Inverted Triangle indicator on minimap
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(px - 6, pz - 6);
        ctx.lineTo(px + 6, pz - 6);
        ctx.lineTo(px, pz + 6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎯 CATCHER', px, pz - 8);
      } else if (isFrozen) {
        // Frozen Player: Cyan icy diamond
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(px, pz, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#a5f3fc';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Free Player: Distinct Color Dot with white outline
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, pz, 5.0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });
  }, [players]);

  return (
    <div
      id="minimap-container"
      className="absolute bottom-4 right-4 z-20 pointer-events-none select-none bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-2.5 shadow-2xl"
    >
      <div className="flex items-center justify-between px-1 mb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Radar Map
        </span>
        <span className="text-[9px] text-slate-500 font-mono">1:1 LIVE</span>
      </div>
      <canvas
        id="minimap-canvas"
        ref={canvasRef}
        width={190}
        height={150}
        className="rounded-lg block"
      />
    </div>
  );
};
