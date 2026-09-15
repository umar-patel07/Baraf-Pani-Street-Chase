# Baraf Pani: Street Chase

> **Run. Freeze. Rescue. Catch. Become the Catcher.**

Baraf Pani: Street Chase is a polished **3–5 player local multiplayer 3D party game** inspired by the traditional Indian/Pakistani street game "Baraf Pani."

Players share one keyboard and compete in a continuous chase across a detailed neighborhood playground. One player starts as the **Catcher**, while the remaining players run, dodge, hide, and rescue frozen teammates.

When a player is caught, they receive **Baraf** and become frozen. A teammate can rescue them with **Pani**. After receiving Baraf three times, that player becomes the **new Catcher**, their Baraf count resets, and the previous Catcher becomes a Free Player.

There is **no match timer**. The game continues through an endless cycle of catching, freezing, rescuing, and rotating the Catcher role.

---

## 🎮 Controls

| **Player** | **Forward** | **Backward** | **Left** | **Right** |
| ---------- | ----------- | ------------ | -------- | --------- |
| **Player 1** | `W` | `S` | `A` | `D` |
| **Player 2** | `↑` | `↓` | `←` | `→` |
| **Player 3** | `I` | `K` | `J` | `L` |
| **Player 4** | `T` | `G` | `F` | `H` |
| **Player 5** | `NUMPAD 8` | `NUMPAD 5` | `NUMPAD 4` | `NUMPAD 6` |

All players can move simultaneously.

For example, Player 1 can hold `W + D` while Player 2 holds `↑ + ←` and Player 3 moves at the same time.

Movement is real-time and never turn-based.

---

## ✨ Features

- 👥 **3–5 Player Local Multiplayer**: Multiple players share one keyboard and play simultaneously.
- 🎯 **Catcher & Free Player System**: One player hunts while the remaining players escape, dodge, hide, and rescue.
- 🧊 **Baraf Freeze System**: Catching a free player increases their Baraf count and temporarily freezes them.
- 💧 **Pani Rescue System**: Free players can rescue frozen teammates by touching them.
- 🔄 **Third Baraf Catcher Rotation**: A player's third Baraf turns them into the new Catcher instead of eliminating them.
- 🔴 **Visible Catcher Indicator**: A glowing red inverted triangle remains above the current Catcher's head.
- 📍 **Dedicated Catcher Spawn**: The Catcher starts at the designated bottom-center/bottom-middle position.
- 🗺️ **Real-Time Minimap**: A large bottom-right minimap displays players, major obstacles, the fountain, cars, and important structures.
- 🎥 **Dynamic Shared Camera**: The camera smoothly follows all active players and adjusts zoom based on player distance.
- 🏘️ **Detailed Neighborhood Playground**: A large environment designed specifically around chase, escape, dodging, and rescue gameplay.
- 🚗 **Interactive Obstacles**: Cars, boxes, walls, trees, benches, structures, and the central fountain create tactical routes.
- 🧑 **Stylized 3D Characters**: Distinct player appearances with unique colors, outfits, faces, and animations.
- 💨 **High-Quality VFX**: Ice, water, particles, impact effects, glow, and Catcher transitions enhance gameplay feedback.
- 🔊 **Professional Audio Feedback**: Footsteps, catching, Baraf, Pani, ice effects, menu actions, and Catcher transitions.
- 📊 **Player Statistics**: Tracks catches, Baraf received, Pani rescues, and times spent as Catcher.
- ⚡ **Responsive Input System**: Simultaneous keyboard input is designed to prevent conflicts between players.
- 🎨 **High-End Visual Direction**: Detailed stylized 3D environments, materials, lighting, shadows, particles, and polished UI.
- ⏱️ **No Match Timer**: The game has no time limit and continues until players choose to end the game.

---

## 🧠 Gameplay Mechanics

The game is built around three player states:

- **FREE**
- **FROZEN**
- **CATCHER**

The initial gameplay flow is:

```text
PLAYER 1 STARTS AS CATCHER
        ↓
PLAYER 1 SPAWNS AT BOTTOM-CENTER
        ↓
PLAYER 1 USES W/A/S/D
        ↓
ALL PLAYERS RUN
        ↓
CATCHER TOUCHES FREE PLAYER
        ↓
BARAF
        ↓
PLAYER BECOMES FROZEN
        ↓
FREE PLAYER TOUCHES FROZEN PLAYER
        ↓
PANI
        ↓
PLAYER BECOMES FREE AGAIN

👤 Author & Credits

Designed and developed with precision by:

Umar Patel
