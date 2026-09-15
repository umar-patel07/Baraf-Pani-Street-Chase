import * as THREE from 'three';
import { MAP_CONFIG, MAP_OBSTACLES } from './MapData';
import { CharacterModel } from './CharacterModel';
import { PlayerConfig, PlayerRuntimeData } from '../types';

export class GameWorld {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private container: HTMLElement;

  // Characters
  private characterModels: Map<string, CharacterModel> = new Map();

  // Fountain water particles
  private fountainSpray!: THREE.Points;
  private fountainSprayGeo!: THREE.BufferGeometry;

  // Environment elements
  private lamppostLights: THREE.PointLight[] = [];

  // Camera settings
  private cameraTarget = new THREE.Vector3(0, 0, 6);
  private cameraDistance = 30;
  private targetCameraDistance = 30;
  private minCameraDist = 20;
  private maxCameraDist = 44;

  // Animation frame
  private isDestroyed = false;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdbeafe); // Soft sky blue
    this.scene.fog = new THREE.FogExp2(0xdbeafe, 0.009);

    // 2. Camera setup
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.5, 300);
    this.camera.position.set(0, 32, 34);
    this.camera.lookAt(0, 0, 6);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;

    container.appendChild(this.renderer.domElement);

    // 4. Lighting
    this.setupLighting();

    // 5. Environment
    this.buildGround();
    this.buildObstacles();
    this.buildFountain();
    this.buildPerimeterDecoration();

    // 6. Handle resize
    window.addEventListener('resize', this.onWindowResize);
  }

  private setupLighting() {
    // Warm Sun Directional Light
    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.6);
    sunLight.position.set(35, 60, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 130;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 45;
    sunLight.shadow.camera.bottom = -45;
    sunLight.shadow.bias = -0.0004;
    this.scene.add(sunLight);

    // Hemisphere sky/ground bounce
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0xfef08a, 0.65);
    this.scene.add(hemiLight);

    // Ambient fill
    const ambLight = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(ambLight);
  }

  private buildGround() {
    // Main Grass & Courtyard Surface
    const groundGeo = new THREE.PlaneGeometry(MAP_CONFIG.width + 16, MAP_CONFIG.depth + 16, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x65a30d, // Lush neighborhood park grass
      roughness: 0.85,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Paved Central Plaza (Cobblestone / Stone circle around fountain)
    const plazaGeo = new THREE.CylinderGeometry(14, 14, 0.08, 36);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.7,
    });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.set(0, 0.04, 0);
    plaza.receiveShadow = true;
    this.scene.add(plaza);

    // Connecting Pathway Strips
    const pathMat = new THREE.MeshStandardMaterial({
      color: 0xfcd34d, // warm sandstone walk
      roughness: 0.8,
    });

    // Horizontal cross path
    const pathH = new THREE.Mesh(new THREE.BoxGeometry(70, 0.05, 4.5), pathMat);
    pathH.position.set(0, 0.03, 0);
    pathH.receiveShadow = true;
    this.scene.add(pathH);

    // Vertical cross path
    const pathV = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.05, 54), pathMat);
    pathV.position.set(0, 0.03, 0);
    pathV.receiveShadow = true;
    this.scene.add(pathV);

    // Parking Lot Asphalt (Bottom Right)
    const parkingGeo = new THREE.BoxGeometry(18, 0.06, 16);
    const parkingMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // asphalt
      roughness: 0.8,
    });
    const parkingLot = new THREE.Mesh(parkingGeo, parkingMat);
    parkingLot.position.set(28, 0.03, 16);
    parkingLot.receiveShadow = true;
    this.scene.add(parkingLot);

    // Parking Bays White Lines
    for (let i = 0; i < 3; i++) {
      const lineGeo = new THREE.BoxGeometry(0.2, 0.07, 7.5);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const lineMesh = new THREE.Mesh(lineGeo, lineMat);
      lineMesh.position.set(20 + i * 8, 0.04, 14);
      this.scene.add(lineMesh);
    }
  }

  private buildObstacles() {
    MAP_OBSTACLES.forEach((obs) => {
      if (obs.type === 'fountain') return; // Handled separately

      if (obs.type === 'car') {
        this.buildCar(obs.x, obs.z, obs.width, obs.depth, obs.rotation || 0, obs.color || '#3b82f6');
      } else if (obs.type === 'box') {
        this.buildCrate(obs.x, obs.z, obs.width, obs.depth, obs.height || 2, obs.color || '#b45309');
      } else if (obs.type === 'bench') {
        this.buildBench(obs.x, obs.z, obs.width, obs.depth, obs.rotation || 0);
      } else if (obs.type === 'wall') {
        this.buildWall(obs.x, obs.z, obs.width, obs.depth, obs.height || 1.4, obs.color || '#9333ea');
      } else if (obs.type === 'tree') {
        this.buildTree(obs.x, obs.z, obs.height || 7);
      }
    });
  }

  private buildCar(x: number, z: number, width: number, depth: number, rotation: number, color: string) {
    const carGroup = new THREE.Group();
    carGroup.position.set(x, 0, z);
    carGroup.rotation.y = rotation;

    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.25,
      metalness: 0.65,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.1,
      metalness: 0.9,
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.7,
    });
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.8,
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      metalness: 0.8,
    });

    // Lower Chassis
    const lowerGeo = new THREE.BoxGeometry(width * 0.95, 0.85, depth * 0.95);
    const lowerMesh = new THREE.Mesh(lowerGeo, bodyMat);
    lowerMesh.position.y = 0.65;
    lowerMesh.castShadow = true;
    lowerMesh.receiveShadow = true;
    carGroup.add(lowerMesh);

    // Cabin / Roof
    const cabinGeo = new THREE.BoxGeometry(width * 0.84, 0.75, depth * 0.55);
    const cabinMesh = new THREE.Mesh(cabinGeo, glassMat);
    cabinMesh.position.set(0, 1.35, -depth * 0.05);
    cabinMesh.castShadow = true;
    carGroup.add(cabinMesh);

    // Car Roof panel
    const roofGeo = new THREE.BoxGeometry(width * 0.82, 0.08, depth * 0.52);
    const roofMesh = new THREE.Mesh(roofGeo, bodyMat);
    roofMesh.position.set(0, 1.74, -depth * 0.05);
    carGroup.add(roofMesh);

    // 4 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.32, 16);
    wheelGeo.rotateZ(Math.PI / 2);

    const wheelX = width * 0.46;
    const wheelZ = depth * 0.3;
    const wheelY = 0.36;

    [
      [-wheelX, wheelZ],
      [wheelX, wheelZ],
      [-wheelX, -wheelZ],
      [wheelX, -wheelZ],
    ].forEach(([wx, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(wx, wheelY, wz);
      wheel.castShadow = true;
      carGroup.add(wheel);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.33, 12), rimMat);
      rim.rotation.z = Math.PI / 2;
      rim.position.set(wx, wheelY, wz);
      carGroup.add(rim);
    });

    // Headlights (glowing yellow-white)
    const headGeo = new THREE.BoxGeometry(0.55, 0.22, 0.08);
    const headMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const headL = new THREE.Mesh(headGeo, headMat);
    headL.position.set(-width * 0.32, 0.75, depth * 0.48);
    const headR = new THREE.Mesh(headGeo, headMat);
    headR.position.set(width * 0.32, 0.75, depth * 0.48);
    carGroup.add(headL);
    carGroup.add(headR);

    // Tail lights (red)
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const tailL = new THREE.Mesh(headGeo, tailMat);
    tailL.position.set(-width * 0.32, 0.75, -depth * 0.48);
    const tailR = new THREE.Mesh(headGeo, tailMat);
    tailR.position.set(width * 0.32, 0.75, -depth * 0.48);
    carGroup.add(tailL);
    carGroup.add(tailR);

    this.scene.add(carGroup);
  }

  private buildCrate(x: number, z: number, width: number, depth: number, height: number, color: string) {
    const crateGroup = new THREE.Group();
    crateGroup.position.set(x, height / 2, z);

    const woodMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.75,
      metalness: 0.05,
    });

    const boxGeo = new THREE.BoxGeometry(width, height, depth);
    const boxMesh = new THREE.Mesh(boxGeo, woodMat);
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;
    crateGroup.add(boxMesh);

    // Cross-brace slats for authentic wooden cargo crate look
    const braceMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color).lerp(new THREE.Color(0x3f1d0b), 0.3),
      roughness: 0.8,
    });
    const trimH = new THREE.Mesh(new THREE.BoxGeometry(width * 1.01, 0.12, depth * 1.01), braceMat);
    crateGroup.add(trimH);

    this.scene.add(crateGroup);
  }

  private buildBench(x: number, z: number, width: number, depth: number, rotation: number) {
    const benchGroup = new THREE.Group();
    benchGroup.position.set(x, 0, z);
    benchGroup.rotation.y = rotation;

    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x9a3412,
      roughness: 0.6,
    });
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      metalness: 0.8,
      roughness: 0.3,
    });

    // Seat Slats
    const seatGeo = new THREE.BoxGeometry(width, 0.08, depth * 0.85);
    const seatMesh = new THREE.Mesh(seatGeo, woodMat);
    seatMesh.position.y = 0.52;
    seatMesh.castShadow = true;
    benchGroup.add(seatMesh);

    // Backrest
    const backGeo = new THREE.BoxGeometry(width, 0.38, 0.08);
    const backMesh = new THREE.Mesh(backGeo, woodMat);
    backMesh.position.set(0, 0.82, -depth * 0.36);
    backMesh.castShadow = true;
    benchGroup.add(backMesh);

    // Cast Iron Legs
    [-width * 0.38, width * 0.38].forEach((lx) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.52, depth * 0.8), metalMat);
      leg.position.set(lx, 0.26, 0);
      leg.castShadow = true;
      benchGroup.add(leg);
    });

    this.scene.add(benchGroup);
  }

  private buildWall(x: number, z: number, width: number, depth: number, height: number, color: string) {
    const wallGroup = new THREE.Group();
    wallGroup.position.set(x, height / 2, z);

    const brickMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.85,
    });
    const capMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.6,
    });

    const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), brickMat);
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    wallGroup.add(wallMesh);

    // Decorative Top Stone Cap
    const capMesh = new THREE.Mesh(new THREE.BoxGeometry(width + 0.25, 0.16, depth + 0.25), capMat);
    capMesh.position.y = height / 2 + 0.08;
    capMesh.castShadow = true;
    wallGroup.add(capMesh);

    this.scene.add(wallGroup);
  }

  private buildTree(x: number, z: number, height: number) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0, z);

    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x5c3a21,
      roughness: 0.9,
    });
    const leavesMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.7,
      flatShading: true,
    });
    const leavesHighlightMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.65,
      flatShading: true,
    });

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.5, 0.75, height * 0.45, 8);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = (height * 0.45) / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    // Tiered Stylized Low-Poly Foliage
    const f1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.4, 1), leavesMat);
    f1.position.y = height * 0.45 + 1.2;
    f1.castShadow = true;
    treeGroup.add(f1);

    const f2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.9, 1), leavesHighlightMat);
    f2.position.set(0.4, height * 0.45 + 2.5, -0.2);
    f2.castShadow = true;
    treeGroup.add(f2);

    const f3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.3, 1), leavesMat);
    f3.position.set(-0.3, height * 0.45 + 3.4, 0.3);
    f3.castShadow = true;
    treeGroup.add(f3);

    this.scene.add(treeGroup);
  }

  private buildFountain() {
    const fountainGroup = new THREE.Group();
    fountainGroup.position.set(0, 0, 0);

    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0xcfd8dc,
      roughness: 0.5,
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x90a4ae,
      roughness: 0.4,
    });
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.6,
      transparent: true,
      opacity: 0.88,
    });

    // Outer Stone Basin Wall
    const basinGeo = new THREE.CylinderGeometry(3.5, 3.8, 1.1, 32);
    const basin = new THREE.Mesh(basinGeo, stoneMat);
    basin.position.y = 0.55;
    basin.castShadow = true;
    basin.receiveShadow = true;
    fountainGroup.add(basin);

    // Decorative Molded Basin Rim
    const rim = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.22, 12, 32), rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 1.1;
    rim.castShadow = true;
    fountainGroup.add(rim);

    // Pool Water Surface
    const water = new THREE.Mesh(new THREE.CircleGeometry(3.4, 32), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.95;
    fountainGroup.add(water);

    // Center Tier 1 Column
    const col1 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 1.4, 16), stoneMat);
    col1.position.y = 1.4;
    col1.castShadow = true;
    fountainGroup.add(col1);

    // Center Tier 2 Upper Basin
    const basin2 = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.2, 0.45, 24), stoneMat);
    basin2.position.y = 2.1;
    basin2.castShadow = true;
    fountainGroup.add(basin2);

    // Center Spout Spire
    const spout = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.9, 16), rimMat);
    spout.position.y = 2.75;
    fountainGroup.add(spout);

    this.scene.add(fountainGroup);

    // Animated Fountain Spray Particles
    const sprayCount = 120;
    this.fountainSprayGeo = new THREE.BufferGeometry();
    const sprayPos = new Float32Array(sprayCount * 3);
    for (let i = 0; i < sprayCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 2.2;
      sprayPos[i * 3] = Math.cos(angle) * radius;
      sprayPos[i * 3 + 1] = 1.2 + Math.random() * 2.6;
      sprayPos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    this.fountainSprayGeo.setAttribute('position', new THREE.BufferAttribute(sprayPos, 3));
    const sprayMat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 0.2,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    this.fountainSpray = new THREE.Points(this.fountainSprayGeo, sprayMat);
    this.fountainSpray.position.set(0, 0, 0);
    this.scene.add(this.fountainSpray);
  }

  private buildPerimeterDecoration() {
    // Street Lampposts in corners
    const postCoords = [
      [-22, -18],
      [22, -18],
      [-22, 18],
      [22, 18],
    ];

    postCoords.forEach(([px, pz]) => {
      const postGroup = new THREE.Group();
      postGroup.position.set(px, 0, pz);

      const metalMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.3,
      });
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 5.2, 12), metalMat);
      pole.position.y = 2.6;
      pole.castShadow = true;
      postGroup.add(pole);

      // Lantern Glass & Bulb
      const lanternGeo = new THREE.DodecahedronGeometry(0.42);
      const lanternMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      const lantern = new THREE.Mesh(lanternGeo, lanternMat);
      lantern.position.y = 5.2;
      postGroup.add(lantern);

      // Warm Point light
      const pLight = new THREE.PointLight(0xfef08a, 0.8, 18, 1.5);
      pLight.position.set(0, 5.1, 0);
      postGroup.add(pLight);
      this.lamppostLights.push(pLight);

      this.scene.add(postGroup);
    });

    // Perimeter boundary hedges
    const hedgeMat = new THREE.MeshStandardMaterial({
      color: 0x166534,
      roughness: 0.8,
    });

    // Top and Bottom Hedges
    const topHedge = new THREE.Mesh(new THREE.BoxGeometry(MAP_CONFIG.width + 4, 1.8, 1.8), hedgeMat);
    topHedge.position.set(0, 0.9, MAP_CONFIG.minZ - 1.2);
    topHedge.castShadow = true;
    this.scene.add(topHedge);

    const botHedge = new THREE.Mesh(new THREE.BoxGeometry(MAP_CONFIG.width + 4, 1.8, 1.8), hedgeMat);
    botHedge.position.set(0, 0.9, MAP_CONFIG.maxZ + 1.2);
    botHedge.castShadow = true;
    this.scene.add(botHedge);

    // Left and Right Hedges
    const leftHedge = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, MAP_CONFIG.depth + 4), hedgeMat);
    leftHedge.position.set(MAP_CONFIG.minX - 1.2, 0.9, 0);
    leftHedge.castShadow = true;
    this.scene.add(leftHedge);

    const rightHedge = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, MAP_CONFIG.depth + 4), hedgeMat);
    rightHedge.position.set(MAP_CONFIG.maxX + 1.2, 0.9, 0);
    rightHedge.castShadow = true;
    this.scene.add(rightHedge);
  }

  public initPlayerModels(players: PlayerConfig[]) {
    // Clear any existing models
    this.characterModels.forEach((model) => {
      this.scene.remove(model.group);
    });
    this.characterModels.clear();

    players.forEach((p) => {
      const model = new CharacterModel(p.id, p.playerNumber, p.color, p.secondaryColor, p.name);
      this.characterModels.set(p.id, model);
      this.scene.add(model.group);
    });
  }

  public triggerPaniShatter(playerId: string) {
    const model = this.characterModels.get(playerId);
    if (model) {
      model.triggerShatterEffect();
    }
  }

  public update(delta: number, playerRuntime: PlayerRuntimeData[]) {
    // 1. Update Character Models
    playerRuntime.forEach((p) => {
      const model = this.characterModels.get(p.id);
      if (model) {
        model.setPosition(p.x, p.z, p.rotation);
        const speed = Math.hypot(p.vx, p.vz);
        model.update(delta, p.state, p.isMoving, speed, p.barafCount);
      }
    });

    // 2. Animate Fountain Water Jets
    if (this.fountainSprayGeo) {
      const pos = this.fountainSprayGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < pos.length / 3; i++) {
        pos[i * 3 + 1] -= delta * 2.8;
        if (pos[i * 3 + 1] < 0.9) {
          pos[i * 3 + 1] = 3.2 + Math.random() * 1.2;
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * 2.2;
          pos[i * 3] = Math.cos(angle) * r;
          pos[i * 3 + 2] = Math.sin(angle) * r;
        }
      }
      this.fountainSprayGeo.attributes.position.needsUpdate = true;
    }

    // 3. Shared Camera tracking all active players
    this.updateSharedCamera(delta, playerRuntime);

    // 4. Render frame
    this.renderer.render(this.scene, this.camera);
  }

  private updateSharedCamera(delta: number, players: PlayerRuntimeData[]) {
    if (players.length === 0) return;

    // Calculate bounding box of active players
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;

    players.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.z < minZ) minZ = p.z;
      if (p.z > maxZ) maxZ = p.z;
    });

    // Center point of players
    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;

    // Clamp camera target within playground bounds (including bottom middle spawn)
    const clampedCenterX = Math.max(-28, Math.min(28, centerX));
    const clampedCenterZ = Math.max(-18, Math.min(24, centerZ));

    // Smoothly lerp camera focus
    this.cameraTarget.x = THREE.MathUtils.lerp(this.cameraTarget.x, clampedCenterX, delta * 3.5);
    this.cameraTarget.z = THREE.MathUtils.lerp(this.cameraTarget.z, clampedCenterZ, delta * 3.5);

    // Calculate spread distance to adapt zoom
    const spanX = maxX - minX;
    const spanZ = maxZ - minZ;
    const maxSpan = Math.max(spanX, spanZ * 1.1);

    // Dynamic zoom based on player spread
    this.targetCameraDistance = THREE.MathUtils.clamp(
      24 + maxSpan * 0.58,
      this.minCameraDist,
      this.maxCameraDist
    );

    this.cameraDistance = THREE.MathUtils.lerp(this.cameraDistance, this.targetCameraDistance, delta * 3.0);

    // Position camera with high-angle tactical party view
    const angleRad = Math.PI / 4.1;
    const camY = this.cameraDistance * Math.sin(angleRad);
    const camZ = this.cameraTarget.z + this.cameraDistance * Math.cos(angleRad);

    this.camera.position.x = this.cameraTarget.x;
    this.camera.position.y = camY;
    this.camera.position.z = camZ;
    this.camera.lookAt(this.cameraTarget.x, 0, this.cameraTarget.z);
  }

  private onWindowResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public destroy() {
    this.isDestroyed = true;
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.dispose();
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
