import {
  PlayerId,
  PlayerConfig,
  PlayerRuntimeData,
  PlayerStats,
  GameEventNotification,
} from '../types';
import { MAP_CONFIG } from './MapData';
import {
  collisionSystem,
  CATCH_RADIUS,
  RESCUE_RADIUS,
} from './CollisionSystem';
import { inputManager } from './InputManager';
import { soundManager } from '../audio/SoundManager';
import { GameWorld } from './GameWorld';

export const DEFAULT_PLAYER_CONFIGS: PlayerConfig[] = [
  {
    id: 'p1',
    playerNumber: 1,
    name: 'Aarav',
    color: '#ef4444', // Red
    secondaryColor: '#991b1b',
    lightColor: '#fca5a5',
    keysDescription: 'W A S D',
    keys: {
      up: ['KeyW', 'w'],
      down: ['KeyS', 's'],
      left: ['KeyA', 'a'],
      right: ['KeyD', 'd'],
    },
  },
  {
    id: 'p2',
    playerNumber: 2,
    name: 'Riya',
    color: '#3b82f6', // Blue
    secondaryColor: '#1d4ed8',
    lightColor: '#93c5fd',
    keysDescription: 'ARROW KEYS',
    keys: {
      up: ['ArrowUp'],
      down: ['ArrowDown'],
      left: ['ArrowLeft'],
      right: ['ArrowRight'],
    },
  },
  {
    id: 'p3',
    playerNumber: 3,
    name: 'Kabir',
    color: '#10b981', // Green
    secondaryColor: '#047857',
    lightColor: '#6ee7b7',
    keysDescription: 'I J K L',
    keys: {
      up: ['KeyI', 'i'],
      down: ['KeyK', 'k'],
      left: ['KeyJ', 'j'],
      right: ['KeyL', 'l'],
    },
  },
  {
    id: 'p4',
    playerNumber: 4,
    name: 'Sana',
    color: '#f59e0b', // Yellow / Amber
    secondaryColor: '#b45309',
    lightColor: '#fde68a',
    keysDescription: 'T F G H',
    keys: {
      up: ['KeyT', 't'],
      down: ['KeyG', 'g'],
      left: ['KeyF', 'f'],
      right: ['KeyH', 'h'],
    },
  },
  {
    id: 'p5',
    playerNumber: 5,
    name: 'Vihaan',
    color: '#a855f7', // Purple
    secondaryColor: '#7e22ce',
    lightColor: '#d8b4fe',
    keysDescription: 'NUMPAD 8 4 5 6',
    keys: {
      up: ['Numpad8', '8'],
      down: ['Numpad5', '5'],
      left: ['Numpad4', '4'],
      right: ['Numpad6', '6'],
    },
  },
];

export class GameManager {
  public players: PlayerRuntimeData[] = [];
  public stats: Map<PlayerId, PlayerStats> = new Map();
  public activeNotifications: GameEventNotification[] = [];

  private configs: PlayerConfig[] = [];
  private world: GameWorld | null = null;
  private isPaused = false;
  private isRunning = false;
  private lastFrameTime = 0;
  private animFrameId: number | null = null;

  // Transition & protection state
  private transitionUntil = 0;
  private onStateChangeCallback?: () => void;

  constructor() {}

  public init(
    configs: PlayerConfig[],
    world: GameWorld,
    onStateChange: () => void
  ) {
    this.configs = configs;
    this.world = world;
    this.onStateChangeCallback = onStateChange;

    // Initialize stats
    this.stats.clear();
    configs.forEach((cfg) => {
      this.stats.set(cfg.id, {
        id: cfg.id,
        name: cfg.name,
        playerNumber: cfg.playerNumber,
        color: cfg.color,
        catchesMade: 0,
        barafReceived: 0,
        paniRescues: 0,
        timesBecameCatcher: cfg.id === 'p1' ? 1 : 0,
      });
    });

    // Initialize runtime players
    this.players = configs.map((cfg, idx) => {
      const isCatcher = idx === 0; // Player 1 starts as Catcher
      const spawn = isCatcher
        ? MAP_CONFIG.catcherSpawn
        : MAP_CONFIG.playerSpawns[idx % MAP_CONFIG.playerSpawns.length];

      return {
        id: cfg.id,
        playerNumber: cfg.playerNumber,
        name: cfg.name,
        color: cfg.color,
        secondaryColor: cfg.secondaryColor,
        state: isCatcher ? 'CATCHER' : 'FREE',
        barafCount: 0,
        x: spawn.x,
        z: spawn.z,
        rotation: isCatcher ? Math.PI : 0, // Catcher faces north into playground, free players face south
        vx: 0,
        vz: 0,
        isMoving: false,
        invulnerableUntil: 0,
      };
    });

    this.world.initPlayerModels(this.configs);
    inputManager.startListening();

    // Start introductory sequence
    this.startIntroSequence();
  }

  private startIntroSequence() {
    this.transitionUntil = Date.now() + 1600;

    this.addNotification({
      id: 'ready_note',
      type: 'READY',
      primaryText: 'READY?',
      secondaryText: `🎯 ${this.players[0].name.toUpperCase()} (P1) IS CATCHER! Keys: W A S D`,
      color: '#ef4444',
      duration: 1200,
      timestamp: Date.now(),
    });

    setTimeout(() => {
      soundManager.playRunWhistle();
      this.addNotification({
        id: 'run_note',
        type: 'RUN',
        primaryText: 'RUN / BHAGO!',
        secondaryText: 'Catcher hunts from bottom middle! Escape and rescue teammates!',
        color: '#22c55e',
        duration: 1400,
        timestamp: Date.now(),
      });
    }, 1200);
  }

  public start() {
    this.isRunning = true;
    this.isPaused = false;
    this.lastFrameTime = performance.now();
    this.gameLoop(this.lastFrameTime);
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
    this.lastFrameTime = performance.now();
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    inputManager.stopListening();
  }

  private gameLoop = (time: number) => {
    if (!this.isRunning) return;

    const delta = Math.min((time - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = time;

    if (!this.isPaused) {
      this.update(delta);
    }

    if (this.world) {
      this.world.update(delta, this.players);
    }

    this.animFrameId = requestAnimationFrame(this.gameLoop);
  };

  private update(delta: number) {
    const now = Date.now();
    const isInTransition = now < this.transitionUntil;

    // Clean up expired notifications
    this.activeNotifications = this.activeNotifications.filter(
      (n) => now - n.timestamp < n.duration
    );

    // 1. Process player movements
    this.players.forEach((player) => {
      // Frozen players cannot move
      if (player.state === 'FROZEN') {
        player.vx = 0;
        player.vz = 0;
        player.isMoving = false;
        return;
      }

      // During start/new-catcher transition, movement is temporarily locked or slow
      if (isInTransition) {
        player.vx = 0;
        player.vz = 0;
        player.isMoving = false;
        return;
      }

      const input = inputManager.getPlayerMovement(player.id);
      player.isMoving = input.x !== 0 || input.z !== 0;

      // Speed tuning: Catcher has slight tactical advantage, standard free players are agile
      const topSpeed = player.state === 'CATCHER' ? 14.8 : 13.8;
      const acceleration = 65;
      const friction = 28;

      if (player.isMoving) {
        // Accelerate
        player.vx += input.x * acceleration * delta;
        player.vz += input.z * acceleration * delta;

        // Cap to top speed
        const currentSpeed = Math.hypot(player.vx, player.vz);
        if (currentSpeed > topSpeed) {
          player.vx = (player.vx / currentSpeed) * topSpeed;
          player.vz = (player.vz / currentSpeed) * topSpeed;
        }

        // Smoothly rotate facing direction
        const targetAngle = Math.atan2(input.x, input.z);
        // Angular difference with wrap
        let diff = targetAngle - player.rotation;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        player.rotation += diff * Math.min(1, delta * 14);

        // Footsteps sound
        soundManager.playFootstep(player.id);
      } else {
        // Decelerate with friction
        const speed = Math.hypot(player.vx, player.vz);
        if (speed > 0.05) {
          const drop = friction * delta;
          const newSpeed = Math.max(0, speed - drop);
          player.vx = (player.vx / speed) * newSpeed;
          player.vz = (player.vz / speed) * newSpeed;
        } else {
          player.vx = 0;
          player.vz = 0;
        }
      }

      // Resolve movement with obstacles and boundaries
      const targetX = player.x + player.vx * delta;
      const targetZ = player.z + player.vz * delta;

      const resolved = collisionSystem.resolvePlayerMovement(
        player.x,
        player.z,
        targetX,
        targetZ
      );

      player.x = resolved.x;
      player.z = resolved.z;
    });

    // 2. Soft Player-to-Player Separation
    for (let i = 0; i < this.players.length; i++) {
      for (let j = i + 1; j < this.players.length; j++) {
        const p1 = this.players[i];
        const p2 = this.players[j];
        const push = collisionSystem.resolvePlayerOverlap(p1, p2);
        p1.x += push.dx1;
        p1.z += push.dz1;
        p2.x += push.dx2;
        p2.z += push.dz2;
      }
    }

    // 3. Gameplay Logic: Catcher catching Free Players & Free players rescuing Frozen Players
    if (!isInTransition) {
      this.checkCatchAndRescueInteractions();
    }

    // Trigger UI updates
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback();
    }
  }

  private checkCatchAndRescueInteractions() {
    const catcher = this.players.find((p) => p.state === 'CATCHER');
    if (!catcher) return;

    const now = Date.now();

    // --- A. PANI RESCUES (Free player touches Frozen teammate) ---
    // Process rescues first so an incoming rescue has priority
    const freePlayers = this.players.filter((p) => p.state === 'FREE');
    const frozenPlayers = this.players.filter((p) => p.state === 'FROZEN');

    frozenPlayers.forEach((frozenPlayer) => {
      // Find closest free player within rescue radius and with line of sight
      for (const rescuer of freePlayers) {
        const dist = Math.hypot(rescuer.x - frozenPlayer.x, rescuer.z - frozenPlayer.z);
        if (dist <= RESCUE_RADIUS) {
          // Line of sight check to ensure not rescuing through a thick wall or car
          if (collisionSystem.hasLineOfSight(rescuer.x, rescuer.z, frozenPlayer.x, frozenPlayer.z)) {
            // SUCCESSFUL RESCUE!
            this.handlePaniRescue(rescuer, frozenPlayer);
            break; // Already rescued, stop checking for this frozen player
          }
        }
      }
    });

    // --- B. BARAF CATCHES (Catcher touches Free player) ---
    // Re-evaluate free players (excluding those who just got rescued with invulnerability)
    const catchablePlayers = this.players.filter(
      (p) => p.state === 'FREE' && (p.invulnerableUntil || 0) <= now
    );

    for (const target of catchablePlayers) {
      const dist = Math.hypot(catcher.x - target.x, catcher.z - target.z);
      if (dist <= CATCH_RADIUS) {
        // Line-of-sight check: prevent catching through cars, walls, crates
        if (collisionSystem.hasLineOfSight(catcher.x, catcher.z, target.x, target.z)) {
          this.handleBarafCatch(catcher, target);
          break; // One catch per tick to avoid simultaneous double catches
        }
      }
    }
  }

  private handleBarafCatch(catcher: PlayerRuntimeData, victim: PlayerRuntimeData) {
    // Record catch stat
    const catcherStat = this.stats.get(catcher.id);
    if (catcherStat) catcherStat.catchesMade++;

    const victimStat = this.stats.get(victim.id);
    if (victimStat) victimStat.barafReceived++;

    // Increment victim's Baraf count
    victim.barafCount += 1;

    // Check if player reached 3rd Baraf
    if (victim.barafCount >= 3) {
      // 3RD BARAF REACHED -> VICTIM BECOMES NEW CATCHER!
      this.handleThirdBarafNewCatcher(catcher, victim);
    } else {
      // Regular 1st or 2nd Baraf -> Player freezes
      victim.state = 'FROZEN';
      victim.frozenTimestamp = Date.now();
      victim.vx = 0;
      victim.vz = 0;

      soundManager.playBaraf();

      this.addNotification({
        id: `baraf_${Date.now()}`,
        type: 'BARAF',
        primaryText: 'BARAF!',
        secondaryText: `${victim.name} is Frozen (${victim.barafCount}/3 Baraf)`,
        color: '#38bdf8',
        duration: 1600,
        timestamp: Date.now(),
      });
    }
  }

  private handlePaniRescue(rescuer: PlayerRuntimeData, saved: PlayerRuntimeData) {
    // Record rescue stat
    const rescuerStat = this.stats.get(rescuer.id);
    if (rescuerStat) rescuerStat.paniRescues++;

    // Unfreeze player
    saved.state = 'FREE';
    saved.frozenTimestamp = undefined;
    // Give brief 0.8s grace period to prevent immediate re-catch
    saved.invulnerableUntil = Date.now() + 800;

    soundManager.playPani();
    if (this.world) {
      this.world.triggerPaniShatter(saved.id);
    }

    this.addNotification({
      id: `pani_${Date.now()}`,
      type: 'PANI',
      primaryText: 'PANI!',
      secondaryText: `${rescuer.name} rescued ${saved.name}!`,
      color: '#06b6d4',
      duration: 1500,
      timestamp: Date.now(),
    });
  }

  private handleThirdBarafNewCatcher(oldCatcher: PlayerRuntimeData, newCatcher: PlayerRuntimeData) {
    soundManager.playThirdBaraf();

    // 1. Update stats
    const newCatcherStat = this.stats.get(newCatcher.id);
    if (newCatcherStat) newCatcherStat.timesBecameCatcher++;

    // 2. Roles swap
    oldCatcher.state = 'FREE';
    oldCatcher.invulnerableUntil = Date.now() + 2000; // Protection from immediate tag

    newCatcher.state = 'CATCHER';
    newCatcher.barafCount = 0; // Reset baraf count to 0/3

    // 3. Move new catcher to designated Catcher starting position (bottom middle)
    newCatcher.x = MAP_CONFIG.catcherSpawn.x;
    newCatcher.z = MAP_CONFIG.catcherSpawn.z;
    newCatcher.vx = 0;
    newCatcher.vz = 0;
    newCatcher.rotation = Math.PI; // Face north into playground

    // 4. Set transition period
    this.transitionUntil = Date.now() + 2200;

    // 5. Notifications
    this.addNotification({
      id: `third_baraf_${Date.now()}`,
      type: 'THIRD_BARAF',
      primaryText: 'THIRD BARAF!',
      secondaryText: `${newCatcher.name} caught 3 times!`,
      color: '#ef4444',
      duration: 1200,
      timestamp: Date.now(),
    });

    setTimeout(() => {
      soundManager.playNewCatcherFanfare();
      this.addNotification({
        id: `new_catcher_${Date.now()}`,
        type: 'NEW_CATCHER',
        primaryText: 'NEW CATCHER!',
        secondaryText: `${newCatcher.name.toUpperCase()} IS NOW HUNTING!`,
        color: '#f59e0b',
        duration: 1000,
        timestamp: Date.now(),
      });
    }, 1100);

    setTimeout(() => {
      soundManager.playRunWhistle();
      this.addNotification({
        id: `run_${Date.now()}`,
        type: 'RUN',
        primaryText: 'RUN!',
        secondaryText: 'Escape the new Catcher!',
        color: '#22c55e',
        duration: 1200,
        timestamp: Date.now(),
      });
    }, 2000);
  }

  private addNotification(notification: GameEventNotification) {
    // Keep max 2 active notifications to prevent clutter
    this.activeNotifications = [...this.activeNotifications.slice(-1), notification];
  }

  public restartMatch() {
    if (!this.world) return;
    this.init(this.configs, this.world, this.onStateChangeCallback || (() => {}));
    this.start();
  }
}

export const gameManager = new GameManager();
