import { PlayerId } from '../types';

export interface PlayerDirection {
  x: number;
  z: number;
}

export class InputManager {
  private activeKeys: Set<string> = new Set();
  private isListening = false;

  private onKeyDown = (e: KeyboardEvent) => {
    // Normalize key codes
    const code = e.code;
    const key = e.key;

    // Prevent default scroll actions for game navigation keys
    if (
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(key) ||
      ['Numpad8', 'Numpad5', 'Numpad4', 'Numpad6'].includes(code)
    ) {
      e.preventDefault();
    }

    this.activeKeys.add(code.toLowerCase());
    this.activeKeys.add(key.toLowerCase());
  };

  private onKeyUp = (e: KeyboardEvent) => {
    const code = e.code.toLowerCase();
    const key = e.key.toLowerCase();
    this.activeKeys.delete(code);
    this.activeKeys.delete(key);
  };

  private onBlur = () => {
    // Clear all keys when window loses focus to prevent sticky inputs
    this.activeKeys.clear();
  };

  public startListening() {
    if (this.isListening) return;
    window.addEventListener('keydown', this.onKeyDown, { passive: false });
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    this.isListening = true;
  }

  public stopListening() {
    if (!this.isListening) return;
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.activeKeys.clear();
    this.isListening = false;
  }

  public resetKeys() {
    this.activeKeys.clear();
  }

  /**
   * Returns normalized (x, z) movement vector for a given player based on their assigned keys.
   */
  public getPlayerMovement(playerId: PlayerId): PlayerDirection {
    let dx = 0;
    let dz = 0;

    switch (playerId) {
      case 'p1': // WASD
        if (this.isKeyHeld('keyw', 'w')) dz -= 1;
        if (this.isKeyHeld('keys', 's')) dz += 1;
        if (this.isKeyHeld('keya', 'a')) dx -= 1;
        if (this.isKeyHeld('keyd', 'd')) dx += 1;
        break;

      case 'p2': // Arrow Keys
        if (this.isKeyHeld('arrowup')) dz -= 1;
        if (this.isKeyHeld('arrowdown')) dz += 1;
        if (this.isKeyHeld('arrowleft')) dx -= 1;
        if (this.isKeyHeld('arrowright')) dx += 1;
        break;

      case 'p3': // IJKL
        if (this.isKeyHeld('keyi', 'i')) dz -= 1;
        if (this.isKeyHeld('keyk', 'k')) dz += 1;
        if (this.isKeyHeld('keyj', 'j')) dx -= 1;
        if (this.isKeyHeld('keyl', 'l')) dx += 1;
        break;

      case 'p4': // TFGH
        if (this.isKeyHeld('keyt', 't')) dz -= 1;
        if (this.isKeyHeld('keyg', 'g')) dz += 1;
        if (this.isKeyHeld('keyf', 'f')) dx -= 1;
        if (this.isKeyHeld('keyh', 'h')) dx += 1;
        break;

      case 'p5': // Numpad 8 5 4 6 (with digits 8 5 4 6 fallback for laptops)
        if (this.isKeyHeld('numpad8', 'digit8', '8')) dz -= 1;
        if (this.isKeyHeld('numpad5', 'digit5', '5')) dz += 1;
        if (this.isKeyHeld('numpad4', 'digit4', '4')) dx -= 1;
        if (this.isKeyHeld('numpad6', 'digit6', '6')) dx += 1;
        break;
    }

    if (dx !== 0 && dz !== 0) {
      // Normalize diagonal speed
      const len = Math.hypot(dx, dz);
      dx /= len;
      dz /= len;
    }

    return { x: dx, z: dz };
  }

  private isKeyHeld(...keys: string[]): boolean {
    return keys.some(k => this.activeKeys.has(k.toLowerCase()));
  }
}

export const inputManager = new InputManager();
