import { Obstacle } from '../types';

export const MAP_CONFIG = {
  width: 90,
  depth: 70,
  minX: -43,
  maxX: 43,
  minZ: -33,
  maxZ: 33,
  catcherSpawn: { x: 0, z: 22 }, // Bottom Middle of the playground on central path
  playerSpawns: [
    { x: -16, z: -18 }, // Top Left open lawn
    { x: 22, z: -10 },  // Top Right park
    { x: -24, z: 14 },  // Bottom Left open park
    { x: 22, z: 2 },    // Middle Right plaza
    { x: 0, z: -20 },   // Top Center path
  ],
};

export const MAP_OBSTACLES: Obstacle[] = [
  // 1. CENTRAL FOUNTAIN AREA
  {
    id: 'fountain_core',
    type: 'fountain',
    x: 0,
    z: 0,
    width: 7,
    depth: 7,
    radius: 3.5,
    height: 1.6,
  },

  // 2. PARKED CARS (Neighborhood vibe, creates great looping cover)
  // Bottom Right Parking Lot (2 cars)
  {
    id: 'car_blue_br',
    type: 'car',
    x: 24,
    z: 14,
    width: 3.6,
    depth: 6.4,
    rotation: 0,
    color: '#3b82f6', // blue sedan
    height: 1.8,
  },
  {
    id: 'car_red_br',
    type: 'car',
    x: 32,
    z: 14,
    width: 3.6,
    depth: 6.4,
    rotation: 0,
    color: '#ef4444', // red SUV
    height: 2.1,
  },
  // Top Left Parking/Street (2 cars)
  {
    id: 'car_yellow_tl',
    type: 'car',
    x: -25,
    z: -14,
    width: 6.4,
    depth: 3.6,
    rotation: Math.PI / 2,
    color: '#eab308', // taxi/yellow sedan
    height: 1.8,
  },
  {
    id: 'car_white_tl',
    type: 'car',
    x: -25,
    z: -22,
    width: 6.4,
    depth: 3.6,
    rotation: Math.PI / 2,
    color: '#f8fafc', // white van
    height: 2.2,
  },

  // 3. WOODEN CRATE STACKS (Good dodging alleys)
  // Center-Left crate stack
  {
    id: 'crate_cl_1',
    type: 'box',
    x: -12,
    z: 3,
    width: 3.0,
    depth: 3.0,
    height: 2.2,
    color: '#b45309',
  },
  {
    id: 'crate_cl_2',
    type: 'box',
    x: -12,
    z: 7,
    width: 2.5,
    depth: 2.5,
    height: 1.6,
    color: '#d97706',
  },
  // Center-Right crate stack
  {
    id: 'crate_cr_1',
    type: 'box',
    x: 13,
    z: -4,
    width: 3.2,
    depth: 3.2,
    height: 2.0,
    color: '#b45309',
  },
  {
    id: 'crate_cr_2',
    type: 'box',
    x: 17,
    z: -4,
    width: 2.6,
    depth: 2.6,
    height: 1.5,
    color: '#d97706',
  },
  // Top alley crates
  {
    id: 'crate_top_1',
    type: 'box',
    x: -7,
    z: -18,
    width: 3.0,
    depth: 3.0,
    height: 2.0,
    color: '#92400e',
  },
  {
    id: 'crate_bottom_1',
    type: 'box',
    x: 12,
    z: 22,
    width: 3.0,
    depth: 3.0,
    height: 1.8,
    color: '#b45309',
  },

  // 4. LOW BRICK WALLS (Creates chicane paths & tactical cover)
  // Left wall partition
  {
    id: 'wall_left_1',
    type: 'wall',
    x: -20,
    z: 6,
    width: 1.2,
    depth: 10.0,
    height: 1.4,
    color: '#a855f7',
  },
  // Right wall partition
  {
    id: 'wall_right_1',
    type: 'wall',
    x: 18,
    z: -18,
    width: 10.0,
    depth: 1.2,
    height: 1.4,
    color: '#a855f7',
  },
  // Bottom wall partition
  {
    id: 'wall_bottom_1',
    type: 'wall',
    x: -14,
    z: 22,
    width: 11.0,
    depth: 1.2,
    height: 1.4,
    color: '#a855f7',
  },

  // 5. PARK BENCHES
  {
    id: 'bench_center_n',
    type: 'bench',
    x: 0,
    z: -7.5,
    width: 4.2,
    depth: 1.4,
    height: 0.9,
    color: '#78350f',
  },
  {
    id: 'bench_center_s',
    type: 'bench',
    x: 0,
    z: 7.5,
    width: 4.2,
    depth: 1.4,
    height: 0.9,
    color: '#78350f',
  },
  {
    id: 'bench_west',
    type: 'bench',
    x: -8,
    z: 0,
    width: 1.4,
    depth: 4.2,
    height: 0.9,
    color: '#78350f',
  },
  {
    id: 'bench_east',
    type: 'bench',
    x: 8,
    z: 0,
    width: 1.4,
    depth: 4.2,
    height: 0.9,
    color: '#78350f',
  },

  // 6. SHADE TREES (Round foliage & collision trunk)
  {
    id: 'tree_tl',
    type: 'tree',
    x: -34,
    z: -5,
    width: 3.0,
    depth: 3.0,
    radius: 1.3,
    height: 7.0,
  },
  {
    id: 'tree_tr',
    type: 'tree',
    x: 35,
    z: -12,
    width: 3.0,
    depth: 3.0,
    radius: 1.3,
    height: 7.0,
  },
  {
    id: 'tree_bl',
    type: 'tree',
    x: -34,
    z: 18,
    width: 3.0,
    depth: 3.0,
    radius: 1.3,
    height: 7.0,
  },
  {
    id: 'tree_br',
    type: 'tree',
    x: 36,
    z: 26,
    width: 3.0,
    depth: 3.0,
    radius: 1.3,
    height: 7.0,
  },
  {
    id: 'tree_top_c',
    type: 'tree',
    x: 12,
    z: -26,
    width: 3.0,
    depth: 3.0,
    radius: 1.3,
    height: 7.0,
  },
  {
    id: 'tree_bot_c',
    type: 'tree',
    x: -24,
    z: 28,
    width: 3.0,
    depth: 3.0,
    radius: 1.3,
    height: 7.0,
  },

  // 7. PLAYGROUND POLES & KIOSK / GAZEBO CORNER
  {
    id: 'gazebo_kiosk',
    type: 'wall',
    x: 32,
    z: -24,
    width: 6.0,
    depth: 5.0,
    height: 3.2,
    color: '#f97316',
  },
  {
    id: 'snack_shack',
    type: 'wall',
    x: -33,
    z: -26,
    width: 7.0,
    depth: 4.5,
    height: 3.0,
    color: '#0284c7',
  },
];
