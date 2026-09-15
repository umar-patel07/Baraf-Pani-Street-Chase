// Web Audio API Procedural Sound Synthesizer for Baraf Pani

class SoundManager {
  private ctx: AudioContext | null = null;
  private sfxVolume = 0.8;
  private isMuted = false;
  private lastFootstepTime: { [key: string]: number } = {};

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  public getVolume(): number {
    return this.sfxVolume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public playClick() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Audio context might fail on uninitiated interaction
    }
  }

  public playBaraf() {
    // Crisp icy crystal freeze sound + descending whoosh
    if (this.isMuted || this.sfxVolume <= 0) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // High crystalline tones
      [1400, 1850, 2200, 2800].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.03);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + idx * 0.03 + 0.35);

        gain.gain.setValueAtTime(0.2 * this.sfxVolume, now + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.03);
        osc.stop(now + idx * 0.03 + 0.45);
      });

      // Ice whoosh noise
      const bufferSize = this.ctx.sampleRate * 0.3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.1));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2500, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.3);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);
    } catch {
      // Ignored
    }
  }

  public playPani() {
    // Uplifting glass/ice shatter + sparkling water splash
    if (this.isMuted || this.sfxVolume <= 0) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Shatter chime chord: Major triad bursting upwards
      const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      chord.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 0.9, now + i * 0.02);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + i * 0.02 + 0.3);

        gain.gain.setValueAtTime(0.22 * this.sfxVolume, now + i * 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.02 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.02);
        osc.stop(now + i * 0.02 + 0.5);
      });

      // Water splash spray sound
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.8;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1500, now);
      filter.frequency.exponentialRampToValueAtTime(4500, now + 0.3);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);
    } catch {
      // Ignored
    }
  }

  public playThirdBaraf() {
    // Dramatic tension chord: player hit 3/3
    if (this.isMuted || this.sfxVolume <= 0) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Heavy low impact + alarm tone
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);

      gain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);

      // Warning chime
      [440, 554, 659, 880].forEach((freq, idx) => {
        if (!this.ctx) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, now + idx * 0.08);
        g.gain.setValueAtTime(0.25 * this.sfxVolume, now + idx * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
        o.connect(g);
        g.connect(this.ctx.destination);
        o.start(now + idx * 0.08);
        o.stop(now + idx * 0.08 + 0.45);
      });
    } catch {
      // Ignored
    }
  }

  public playNewCatcherFanfare() {
    // Energetic brass/horn flourish when roles swap
    if (this.isMuted || this.sfxVolume <= 0) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [392, 523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, now + i * 0.08);

        gain.gain.setValueAtTime(0.25 * this.sfxVolume, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.4);
      });
    } catch {
      // Ignored
    }
  }

  public playRunWhistle() {
    // High playful sports whistle ("RUN!")
    if (this.isMuted || this.sfxVolume <= 0) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2200, now);
      osc.frequency.setValueAtTime(2600, now + 0.08);
      osc.frequency.setValueAtTime(2400, now + 0.16);

      gain.gain.setValueAtTime(0.28 * this.sfxVolume, now);
      gain.gain.setValueAtTime(0.35 * this.sfxVolume, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Ignored
    }
  }

  public playFootstep(playerId: string) {
    if (this.isMuted || this.sfxVolume <= 0) return;
    const now = Date.now();
    if (this.lastFootstepTime[playerId] && now - this.lastFootstepTime[playerId] < 240) {
      return;
    }
    this.lastFootstepTime[playerId] = now;

    try {
      this.initContext();
      if (!this.ctx) return;
      const audioNow = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const pitch = 140 + Math.random() * 40;
      osc.frequency.setValueAtTime(pitch, audioNow);
      osc.frequency.exponentialRampToValueAtTime(60, audioNow + 0.04);

      gain.gain.setValueAtTime(0.06 * this.sfxVolume, audioNow);
      gain.gain.exponentialRampToValueAtTime(0.001, audioNow + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(audioNow);
      osc.stop(audioNow + 0.04);
    } catch {
      // Ignored
    }
  }
}

export const soundManager = new SoundManager();
