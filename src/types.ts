export type PlayerId = 'p1' | 'p2' | 'p3' | 'p4' | 'p5';

export type PlayerState = 'FREE' | 'FROZEN' | 'CATCHER';

export interface PlayerConfig {
  id: PlayerId;
  playerNumber: number;
  name: string;
  color: string;
  secondaryColor: string;
  lightColor: string;
  keysDescription: string;
  keys: {
    up: string[];
    down: string[];
    left: string[];
    right: string[];
  };
}

export interface PlayerRuntimeData {
  id: PlayerId;
  playerNumber: number;
  name: string;
  color: string;
  secondaryColor: string;
  state: PlayerState;
  barafCount: number; // 0, 1, 2, 3
  x: number;
  z: number;
  rotation: number;
  vx: number;
  vz: number;
  isMoving: boolean;
  frozenTimestamp?: number;
  invulnerableUntil?: number;
}

export interface PlayerStats {
  id: PlayerId;
  name: string;
  playerNumber: number;
  color: string;
  catchesMade: number;
  barafReceived: number;
  paniRescues: number;
  timesBecameCatcher: number;
}

export type GameScreen = 'MENU' | 'SETUP' | 'PLAYING' | 'PAUSED' | 'RESULTS';

export interface Obstacle {
  id: string;
  type: 'box' | 'car' | 'fountain' | 'wall' | 'tree' | 'bench' | 'pole';
  x: number;
  z: number;
  width: number;
  depth: number;
  radius?: number; // for circular obstacles (fountain, trees)
  rotation?: number;
  color?: string;
  height?: number;
}

export interface GameEventNotification {
  id: string;
  type: 'BARAF' | 'PANI' | 'THIRD_BARAF' | 'NEW_CATCHER' | 'READY' | 'RUN';
  primaryText: string;
  secondaryText?: string;
  color: string;
  duration: number; // in ms
  timestamp: number;
}
