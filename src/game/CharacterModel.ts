import * as THREE from 'three';
import { PlayerId, PlayerState } from '../types';

export class CharacterModel {
  public group: THREE.Group;
  public playerId: PlayerId;
  public baseColor: string;
  public secondaryColor: string;
  public playerNumber: number;
  public playerName: string;

  // Body parts for animation
  private bodyMesh!: THREE.Mesh;
  private headMesh!: THREE.Mesh;
  private capMesh!: THREE.Mesh;
  private leftArm!: THREE.Group;
  private rightArm!: THREE.Group;
  private leftLeg!: THREE.Group;
  private rightLeg!: THREE.Group;
  private eyeLeft!: THREE.Mesh;
  private eyeRight!: THREE.Mesh;
  private smileMesh!: THREE.Mesh;

  // Catcher visual marker & ground aura
  private catcherMarker!: THREE.Group;
  private markerCone!: THREE.Mesh;
  private markerRing!: THREE.Mesh;
  private catcherGroundRing!: THREE.Mesh;

  // Overhead Nametag Billboard
  private nametagSprite!: THREE.Sprite;
  private nametagCanvas!: HTMLCanvasElement;
  private nametagTexture!: THREE.CanvasTexture;
  private lastRenderedState: string = '';
  private lastRenderedBaraf: number = -1;

  // Ice block & freeze aura
  private iceCage!: THREE.Group;
  private iceCrystalMeshes: THREE.Mesh[] = [];

  // Particle systems for effects
  private frostParticles!: THREE.Points;
  private splashParticles!: THREE.Points;
  private dustParticles!: THREE.Points;

  // Animation state
  private walkCycleTime = 0;
  private idleBounceTime = Math.random() * Math.PI * 2;
  private isFrozenVisual = false;
  private isCatcherVisual = false;
  private freezeScale = 0;
  private shatterTime = -1;

  constructor(
    playerId: PlayerId,
    playerNumber: number,
    baseColor: string,
    secondaryColor: string,
    playerName: string = ''
  ) {
    this.playerId = playerId;
    this.playerNumber = playerNumber;
    this.baseColor = baseColor;
    this.secondaryColor = secondaryColor;
    this.playerName = playerName || `Player ${playerNumber}`;

    this.group = new THREE.Group();
    // Scale characters up so they are clearly visible across the playground
    this.group.scale.set(1.4, 1.4, 1.4);

    this.buildCharacterMesh();
    this.buildNametagSprite();
    this.buildCatcherMarker();
    this.buildIceCage();
    this.buildParticleEffects();
  }

  private buildCharacterMesh() {
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xffd1a4,
      roughness: 0.6,
      metalness: 0.05,
    });

    const outfitMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.baseColor),
      roughness: 0.4,
      metalness: 0.1,
    });

    const pantsMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.secondaryColor),
      roughness: 0.6,
    });

    const shoesMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
    });

    // Torso / Jersey (stylized rounded cylinder)
    const torsoGeo = new THREE.CylinderGeometry(0.48, 0.42, 0.9, 16);
    this.bodyMesh = new THREE.Mesh(torsoGeo, outfitMat);
    this.bodyMesh.position.y = 1.05;
    this.bodyMesh.castShadow = true;
    this.bodyMesh.receiveShadow = true;
    this.group.add(this.bodyMesh);

    // Number Badge on Jersey
    const badgeGeo = new THREE.CircleGeometry(0.18, 16);
    const badgeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
    badgeMesh.position.set(0, 1.15, 0.49);
    this.group.add(badgeMesh);

    // Head
    const headGeo = new THREE.SphereGeometry(0.44, 20, 20);
    this.headMesh = new THREE.Mesh(headGeo, skinMat);
    this.headMesh.position.y = 1.8;
    this.headMesh.castShadow = true;
    this.group.add(this.headMesh);

    // Stylish Cap / Hair
    const capGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.22, 16);
    const capMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.baseColor).lerp(new THREE.Color(0x111827), 0.2),
      roughness: 0.4,
    });
    this.capMesh = new THREE.Mesh(capGeo, capMat);
    this.capMesh.position.set(0, 1.95, 0);

    // Cap Visor
    const visorGeo = new THREE.BoxGeometry(0.5, 0.06, 0.35);
    const visorMesh = new THREE.Mesh(visorGeo, capMat);
    visorMesh.position.set(0, 1.9, 0.42);
    visorMesh.rotation.x = 0.15;
    this.group.add(this.capMesh);
    this.group.add(visorMesh);

    // Expressive Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const eyeGeo = new THREE.SphereGeometry(0.08, 12, 12);
    eyeGeo.scale(1, 1.4, 0.6);

    this.eyeLeft = new THREE.Mesh(eyeGeo, eyeMat);
    this.eyeLeft.position.set(-0.16, 1.84, 0.38);

    const pupilLeft = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), pupilMat);
    pupilLeft.position.set(-0.14, 1.86, 0.42);

    this.eyeRight = new THREE.Mesh(eyeGeo, eyeMat);
    this.eyeRight.position.set(0.16, 1.84, 0.38);

    const pupilRight = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), pupilMat);
    pupilRight.position.set(0.18, 1.86, 0.42);

    this.group.add(this.eyeLeft);
    this.group.add(pupilLeft);
    this.group.add(this.eyeRight);
    this.group.add(pupilRight);

    // Smile
    const smileGeo = new THREE.TorusGeometry(0.09, 0.02, 8, 12, Math.PI);
    const smileMat = new THREE.MeshBasicMaterial({ color: 0x991b1b });
    this.smileMesh = new THREE.Mesh(smileGeo, smileMat);
    this.smileMesh.position.set(0, 1.72, 0.41);
    this.smileMesh.rotation.z = Math.PI;
    this.group.add(this.smileMesh);

    // Limbs - Left & Right Arms
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.55, 1.35, 0);
    const armGeo = new THREE.CapsuleGeometry(0.12, 0.42, 8, 8);
    const armMeshL = new THREE.Mesh(armGeo, outfitMat);
    armMeshL.position.y = -0.22;
    armMeshL.castShadow = true;
    this.leftArm.add(armMeshL);
    this.group.add(this.leftArm);

    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.55, 1.35, 0);
    const armMeshR = new THREE.Mesh(armGeo, outfitMat);
    armMeshR.position.y = -0.22;
    armMeshR.castShadow = true;
    this.rightArm.add(armMeshR);
    this.group.add(this.rightArm);

    // Limbs - Left & Right Legs
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.24, 0.65, 0);
    const legGeo = new THREE.CapsuleGeometry(0.14, 0.45, 8, 8);
    const legMeshL = new THREE.Mesh(legGeo, pantsMat);
    legMeshL.position.y = -0.22;
    legMeshL.castShadow = true;
    this.leftLeg.add(legMeshL);

    const shoeGeo = new THREE.BoxGeometry(0.24, 0.16, 0.38);
    const shoeMeshL = new THREE.Mesh(shoeGeo, shoesMat);
    shoeMeshL.position.set(0, -0.5, 0.06);
    this.leftLeg.add(shoeMeshL);
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.24, 0.65, 0);
    const legMeshR = new THREE.Mesh(legGeo, pantsMat);
    legMeshR.position.y = -0.22;
    legMeshR.castShadow = true;
    this.rightLeg.add(legMeshR);

    const shoeMeshR = new THREE.Mesh(shoeGeo, shoesMat);
    shoeMeshR.position.set(0, -0.5, 0.06);
    this.rightLeg.add(shoeMeshR);
    this.group.add(this.rightLeg);
  }

  private buildNametagSprite() {
    this.nametagCanvas = document.createElement('canvas');
    this.nametagCanvas.width = 300;
    this.nametagCanvas.height = 80;

    this.renderNametagTexture('FREE', 0);

    this.nametagTexture = new THREE.CanvasTexture(this.nametagCanvas);
    this.nametagTexture.minFilter = THREE.LinearFilter;
    this.nametagTexture.magFilter = THREE.LinearFilter;

    const spriteMat = new THREE.SpriteMaterial({
      map: this.nametagTexture,
      transparent: true,
      depthTest: false,
    });

    this.nametagSprite = new THREE.Sprite(spriteMat);
    this.nametagSprite.scale.set(3.0, 0.8, 1);
    this.nametagSprite.position.set(0, 3.0, 0);
    this.group.add(this.nametagSprite);
  }

  public renderNametagTexture(state: string, barafCount: number) {
    if (!this.nametagCanvas) return;
    const ctx = this.nametagCanvas.getContext('2d');
    if (!ctx) return;

    this.lastRenderedState = state;
    this.lastRenderedBaraf = barafCount;

    const w = this.nametagCanvas.width;
    const h = this.nametagCanvas.height;

    ctx.clearRect(0, 0, w, h);

    const isCatcher = state === 'CATCHER';
    const isFrozen = state === 'FROZEN';

    // Rounded background card
    const rad = 18;
    ctx.beginPath();
    ctx.roundRect(6, 6, w - 12, h - 12, rad);

    if (isCatcher) {
      ctx.fillStyle = 'rgba(24, 10, 16, 0.92)';
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.stroke();
    } else if (isFrozen) {
      ctx.fillStyle = 'rgba(8, 28, 44, 0.92)';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.fill();
      ctx.strokeStyle = this.baseColor;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Player Number Badge circle
    const badgeX = 32;
    const badgeY = h / 2;
    const badgeR = 20;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
    ctx.fillStyle = this.baseColor;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`P${this.playerNumber}`, badgeX, badgeY);

    // Player Name
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(this.playerName, 62, 34);

    // Status Pill
    const pillX = 62;
    const pillY = 46;
    const pillW = isCatcher ? 180 : isFrozen ? 160 : 100;
    const pillH = 22;

    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 6);

    if (isCatcher) {
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎯 CATCHER (DEN)', pillX + pillW / 2, pillY + 12);
    } else if (isFrozen) {
      ctx.fillStyle = '#0284c7';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`❄ FROZEN (${barafCount}/3)`, pillX + pillW / 2, pillY + 12);
    } else {
      ctx.fillStyle = '#10b981';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`FREE (${barafCount}/3)`, pillX + pillW / 2, pillY + 12);
    }

    if (this.nametagTexture) {
      this.nametagTexture.needsUpdate = true;
    }
  }

  private buildCatcherMarker() {
    this.catcherMarker = new THREE.Group();
    this.catcherMarker.position.y = 4.1; // Positioned cleanly above nametag

    // Glowing inverted cone / pyramid pointing down
    const coneGeo = new THREE.ConeGeometry(0.48, 0.8, 4);
    const coneMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xff2222,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.3,
    });
    this.markerCone = new THREE.Mesh(coneGeo, coneMat);
    this.markerCone.rotation.x = Math.PI; // Inverted pointing down!
    this.catcherMarker.add(this.markerCone);

    // Neon Halo Ring underneath
    const ringGeo = new THREE.TorusGeometry(0.65, 0.06, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff4444,
    });
    this.markerRing = new THREE.Mesh(ringGeo, ringMat);
    this.markerRing.rotation.x = Math.PI / 2;
    this.markerRing.position.y = -0.45;
    this.catcherMarker.add(this.markerRing);

    this.catcherMarker.visible = false;
    this.group.add(this.catcherMarker);

    // Ground Hunter Aura Ring beneath feet
    const groundRingGeo = new THREE.RingGeometry(1.1, 1.35, 32);
    const groundRingMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    this.catcherGroundRing = new THREE.Mesh(groundRingGeo, groundRingMat);
    this.catcherGroundRing.rotation.x = -Math.PI / 2;
    this.catcherGroundRing.position.y = 0.04;
    this.catcherGroundRing.visible = false;
    this.group.add(this.catcherGroundRing);
  }

  private buildIceCage() {
    this.iceCage = new THREE.Group();
    this.iceCage.position.y = 1.1;

    // Stylized Faceted Translucent Ice Prism
    const iceGeo = new THREE.CylinderGeometry(0.85, 0.95, 2.3, 7, 2);
    const iceMat = new THREE.MeshPhysicalMaterial({
      color: 0x67e8f9,
      transmission: 0.7,
      opacity: 0.85,
      transparent: true,
      roughness: 0.15,
      ior: 1.31, // Ice IOR
      emissive: 0x06b6d4,
      emissiveIntensity: 0.35,
    });
    const mainIce = new THREE.Mesh(iceGeo, iceMat);
    this.iceCage.add(mainIce);

    // Floating sharp ice shard spikes around
    const shardGeo = new THREE.ConeGeometry(0.2, 0.65, 5);
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0xa5f3fc,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.5,
      roughness: 0.2,
    });

    for (let i = 0; i < 6; i++) {
      const shard = new THREE.Mesh(shardGeo, shardMat);
      const angle = (i / 6) * Math.PI * 2;
      shard.position.set(Math.cos(angle) * 0.9, (i % 2) * 0.5 - 0.4, Math.sin(angle) * 0.9);
      shard.rotation.z = Math.cos(angle) * 0.4;
      shard.rotation.x = Math.sin(angle) * 0.4;
      this.iceCage.add(shard);
      this.iceCrystalMeshes.push(shard);
    }

    this.iceCage.scale.set(0.001, 0.001, 0.001);
    this.iceCage.visible = false;
    this.group.add(this.iceCage);
  }

  private buildParticleEffects() {
    // 1. Frost Particle Aura
    const frostCount = 45;
    const frostGeo = new THREE.BufferGeometry();
    const frostPos = new Float32Array(frostCount * 3);
    for (let i = 0; i < frostCount; i++) {
      frostPos[i * 3] = (Math.random() - 0.5) * 1.8;
      frostPos[i * 3 + 1] = Math.random() * 2.2;
      frostPos[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
    }
    frostGeo.setAttribute('position', new THREE.BufferAttribute(frostPos, 3));
    const frostMat = new THREE.PointsMaterial({
      color: 0x67e8f9,
      size: 0.16,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    this.frostParticles = new THREE.Points(frostGeo, frostMat);
    this.frostParticles.visible = false;
    this.group.add(this.frostParticles);

    // 2. Water Splash Burst Particles (Pani)
    const splashCount = 60;
    const splashGeo = new THREE.BufferGeometry();
    const splashPos = new Float32Array(splashCount * 3);
    splashGeo.setAttribute('position', new THREE.BufferAttribute(splashPos, 3));
    const splashMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.22,
      transparent: true,
      opacity: 0.9,
    });
    this.splashParticles = new THREE.Points(splashGeo, splashMat);
    this.splashParticles.visible = false;
    this.group.add(this.splashParticles);

    // 3. Footstep Dust
    const dustCount = 20;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xd6d3d1,
      size: 0.12,
      transparent: true,
      opacity: 0.5,
    });
    this.dustParticles = new THREE.Points(dustGeo, dustMat);
    this.group.add(this.dustParticles);
  }

  public triggerShatterEffect() {
    this.shatterTime = 0;
    this.splashParticles.visible = true;
    const pos = this.splashParticles.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length / 3; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.6;
      pos[i * 3 + 1] = 0.6 + Math.random() * 0.8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
    }
    this.splashParticles.geometry.attributes.position.needsUpdate = true;
  }

  public update(
    delta: number,
    state: PlayerState,
    isMoving: boolean,
    speed: number,
    barafCount: number = 0
  ) {
    this.isFrozenVisual = state === 'FROZEN';
    this.isCatcherVisual = state === 'CATCHER';

    // Update nametag sprite if status changed
    if (state !== this.lastRenderedState || barafCount !== this.lastRenderedBaraf) {
      this.renderNametagTexture(state, barafCount);
    }

    // Catcher Marker & Ground Aura Animation
    if (this.isCatcherVisual) {
      this.catcherMarker.visible = true;
      if (this.catcherGroundRing) {
        this.catcherGroundRing.visible = true;
        const pulse = 1 + Math.sin(Date.now() * 0.007) * 0.12;
        this.catcherGroundRing.scale.set(pulse, pulse, 1);
      }
      this.catcherMarker.rotation.y += delta * 3.2;
      this.markerCone.position.y = Math.sin(Date.now() * 0.005) * 0.15;
      this.markerRing.rotation.z += delta * 2;
    } else {
      this.catcherMarker.visible = false;
      if (this.catcherGroundRing) {
        this.catcherGroundRing.visible = false;
      }
    }

    // Ice Cage Animation
    if (this.isFrozenVisual) {
      this.iceCage.visible = true;
      this.frostParticles.visible = true;

      // Pop ice cage in smoothly
      this.freezeScale = THREE.MathUtils.lerp(this.freezeScale, 1.0, delta * 12);
      this.iceCage.scale.set(this.freezeScale, this.freezeScale, this.freezeScale);
      this.iceCage.rotation.y += delta * 0.4;

      // Subtle frozen shiver
      this.bodyMesh.position.x = (Math.random() - 0.5) * 0.03;
      this.bodyMesh.position.z = (Math.random() - 0.5) * 0.03;

      // Frost particles rising
      const frostPositions = this.frostParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < frostPositions.length / 3; i++) {
        frostPositions[i * 3 + 1] += delta * 0.8;
        if (frostPositions[i * 3 + 1] > 2.5) {
          frostPositions[i * 3 + 1] = 0.2;
        }
      }
      this.frostParticles.geometry.attributes.position.needsUpdate = true;
    } else {
      // Unfrozen
      this.frostParticles.visible = false;
      if (this.freezeScale > 0.05) {
        this.freezeScale = THREE.MathUtils.lerp(this.freezeScale, 0.0, delta * 15);
        this.iceCage.scale.set(this.freezeScale, this.freezeScale, this.freezeScale);
      } else {
        this.iceCage.visible = false;
      }
      this.bodyMesh.position.x = 0;
      this.bodyMesh.position.z = 0;
    }

    // Pani Shatter particle burst logic
    if (this.shatterTime >= 0) {
      this.shatterTime += delta;
      const splashPositions = this.splashParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < splashPositions.length / 3; i++) {
        splashPositions[i * 3] *= 1.08;
        splashPositions[i * 3 + 1] += (Math.random() - 0.3) * delta * 4;
        splashPositions[i * 3 + 2] *= 1.08;
      }
      this.splashParticles.geometry.attributes.position.needsUpdate = true;
      if (this.shatterTime > 0.6) {
        this.shatterTime = -1;
        this.splashParticles.visible = false;
      }
    }

    // Locomotion animations
    if (this.isFrozenVisual) {
      // Rigid frozen stance
      this.leftArm.rotation.x = -0.4;
      this.rightArm.rotation.x = 0.4;
      this.leftLeg.rotation.x = 0.2;
      this.rightLeg.rotation.x = -0.2;
    } else if (isMoving) {
      // Dynamic run cycle
      this.walkCycleTime += delta * (speed * 1.5 + 8.0);
      const legSwing = Math.sin(this.walkCycleTime) * 0.85;
      const armSwing = Math.sin(this.walkCycleTime) * 0.95;

      this.leftLeg.rotation.x = legSwing;
      this.rightLeg.rotation.x = -legSwing;
      this.leftArm.rotation.x = -armSwing;
      this.rightArm.rotation.x = armSwing;

      // Body bounce and forward lean
      this.bodyMesh.position.y = 1.05 + Math.abs(Math.sin(this.walkCycleTime)) * 0.12;
      this.bodyMesh.rotation.x = 0.15; // sprint lean
      this.headMesh.position.y = 1.8 + Math.abs(Math.sin(this.walkCycleTime)) * 0.08;
    } else {
      // Idle breathing bounce
      this.idleBounceTime += delta * 2.8;
      const idle = Math.sin(this.idleBounceTime) * 0.03;
      this.bodyMesh.position.y = 1.05 + idle;
      this.headMesh.position.y = 1.8 + idle * 0.6;
      this.bodyMesh.rotation.x = 0;

      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, delta * 8);
      this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0, delta * 8);
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, delta * 8);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, delta * 8);
    }
  }

  public setPosition(x: number, z: number, rotation: number) {
    this.group.position.set(x, 0, z);
    this.group.rotation.y = rotation;
  }
}
