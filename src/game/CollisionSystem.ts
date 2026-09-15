import { Obstacle } from '../types';
import { MAP_CONFIG, MAP_OBSTACLES } from './MapData';

export const PLAYER_COLLISION_RADIUS = 0.85;
export const CATCH_RADIUS = 1.95;
export const RESCUE_RADIUS = 2.0;

export class CollisionSystem {
  private obstacles: Obstacle[];

  constructor(obstacles: Obstacle[] = MAP_OBSTACLES) {
    this.obstacles = obstacles;
  }

  /**
   * Resolves player position against map boundaries and static obstacles.
   * Allows smooth sliding along obstacle edges.
   */
  public resolvePlayerMovement(
    currentX: number,
    currentZ: number,
    targetX: number,
    targetZ: number,
    radius: number = PLAYER_COLLISION_RADIUS
  ): { x: number; z: number } {
    let newX = targetX;
    let newZ = targetZ;

    // 1. Map boundaries check
    const clampedX = Math.max(MAP_CONFIG.minX + radius, Math.min(MAP_CONFIG.maxX - radius, newX));
    const clampedZ = Math.max(MAP_CONFIG.minZ + radius, Math.min(MAP_CONFIG.maxZ - radius, newZ));
    newX = clampedX;
    newZ = clampedZ;

    // 2. Resolve X movement first (axis-separated resolution for smooth wall slide)
    let testX = newX;
    let testZ = currentZ;

    for (const obs of this.obstacles) {
      if (this.checkCircleObstacleOverlap(testX, testZ, radius, obs)) {
        // Collided on X axis: keep currentX
        testX = currentX;
        break;
      }
    }

    // 3. Resolve Z movement next
    testZ = newZ;
    for (const obs of this.obstacles) {
      if (this.checkCircleObstacleOverlap(testX, testZ, radius, obs)) {
        // Collided on Z axis: keep currentZ
        testZ = currentZ;
        break;
      }
    }

    // 4. Double check combined position
    for (const obs of this.obstacles) {
      if (this.checkCircleObstacleOverlap(testX, testZ, radius, obs)) {
        // Push slightly away from obstacle center
        const dx = testX - obs.x;
        const dz = testZ - obs.z;
        const dist = Math.hypot(dx, dz) || 0.001;
        const pushDist = 0.05;
        testX += (dx / dist) * pushDist;
        testZ += (dz / dist) * pushDist;
      }
    }

    return { x: testX, z: testZ };
  }

  /**
   * Circle vs Obstacle (Box or Circle)
   */
  public checkCircleObstacleOverlap(
    cx: number,
    cz: number,
    cr: number,
    obs: Obstacle
  ): boolean {
    if (obs.radius) {
      // Circular obstacle (fountain, tree trunk)
      const distSq = (cx - obs.x) ** 2 + (cz - obs.z) ** 2;
      const totalR = cr + obs.radius;
      return distSq < totalR * totalR;
    }

    // Rotated or Axis-Aligned Box
    const halfW = obs.width / 2;
    const halfD = obs.depth / 2;

    if (!obs.rotation) {
      // Standard AABB closest point
      const closestX = Math.max(obs.x - halfW, Math.min(obs.x + halfW, cx));
      const closestZ = Math.max(obs.z - halfD, Math.min(obs.z + halfD, cz));

      const distX = cx - closestX;
      const distZ = cz - closestZ;
      return distX * distX + distZ * distZ < cr * cr;
    } else {
      // Transform circle into box's local space
      const cos = Math.cos(-obs.rotation);
      const sin = Math.sin(-obs.rotation);
      const relX = cx - obs.x;
      const relZ = cz - obs.z;
      const localX = relX * cos - relZ * sin;
      const localZ = relX * sin + relZ * cos;

      const closestX = Math.max(-halfW, Math.min(halfW, localX));
      const closestZ = Math.max(-halfD, Math.min(halfD, localZ));

      const distX = localX - closestX;
      const distZ = localZ - closestZ;
      return distX * distX + distZ * distZ < cr * cr;
    }
  }

  /**
   * Checks whether line of sight between (x1, z1) and (x2, z2) is blocked by any solid obstacle.
   * Ray-marching / segment intersection with obstacles.
   */
  public hasLineOfSight(x1: number, z1: number, x2: number, z2: number): boolean {
    const totalDist = Math.hypot(x2 - x1, z2 - z1);
    if (totalDist < 0.1) return true;

    // Step every 0.5 units along the ray
    const steps = Math.ceil(totalDist / 0.5);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const sampleX = x1 + (x2 - x1) * t;
      const sampleZ = z1 + (z2 - z1) * t;

      for (const obs of this.obstacles) {
        // If ray goes through obstacle core (smaller collision check)
        if (this.checkPointInsideObstacle(sampleX, sampleZ, obs)) {
          return false; // Vision / collision is blocked!
        }
      }
    }
    return true;
  }

  private checkPointInsideObstacle(px: number, pz: number, obs: Obstacle): boolean {
    if (obs.radius) {
      const distSq = (px - obs.x) ** 2 + (pz - obs.z) ** 2;
      return distSq < obs.radius * obs.radius;
    }

    const halfW = obs.width / 2;
    const halfD = obs.depth / 2;

    if (!obs.rotation) {
      return (
        px >= obs.x - halfW &&
        px <= obs.x + halfW &&
        pz >= obs.z - halfD &&
        pz <= obs.z + halfD
      );
    } else {
      const cos = Math.cos(-obs.rotation);
      const sin = Math.sin(-obs.rotation);
      const relX = px - obs.x;
      const relZ = pz - obs.z;
      const localX = relX * cos - relZ * sin;
      const localZ = relX * sin + relZ * cos;
      return (
        localX >= -halfW &&
        localX <= halfW &&
        localZ >= -halfD &&
        localZ <= halfD
      );
    }
  }

  /**
   * Soft player-to-player push to prevent stacking
   */
  public resolvePlayerOverlap(
    p1: { x: number; z: number },
    p2: { x: number; z: number },
    minDist: number = PLAYER_COLLISION_RADIUS * 1.8
  ): { dx1: number; dz1: number; dx2: number; dz2: number } {
    const dx = p2.x - p1.x;
    const dz = p2.z - p1.z;
    const dist = Math.hypot(dx, dz);

    if (dist > 0 && dist < minDist) {
      const overlap = (minDist - dist) * 0.5;
      const nx = dx / dist;
      const nz = dz / dist;
      return {
        dx1: -nx * overlap * 0.5,
        dz1: -nz * overlap * 0.5,
        dx2: nx * overlap * 0.5,
        dz2: nz * overlap * 0.5,
      };
    }
    return { dx1: 0, dz1: 0, dx2: 0, dz2: 0 };
  }
}

export const collisionSystem = new CollisionSystem();
