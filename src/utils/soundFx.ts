type EffectVoice = 'pulse' | 'scatter' | 'rail';

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playTone(
    freq: number,
    duration = 0.14,
    type: OscillatorType = 'sine',
    volume = 0.08,
    delay = 0
  ): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playLaser(weapon: EffectVoice = 'pulse', distant = false): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const vol = distant ? 0.025 : 0.095;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (weapon === 'rail') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1480, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.26);
      gain.gain.setValueAtTime(vol * 1.15, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.29);
      this.playTone(92, 0.18, 'triangle', vol * 0.9, 0.01);
    } else if (weapon === 'scatter') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(760, now);
      osc.frequency.exponentialRampToValueAtTime(190, now + 0.14);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.17);
      this.playTone(540, 0.1, 'square', vol * 0.35, 0.02);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1060, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.11);
      gain.gain.setValueAtTime(vol * 0.85, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    }
  }

  public playHitMarker(eliminated = false): void {
    if (eliminated) {
      this.playTone(880, 0.09, 'triangle', 0.1);
      this.playTone(1318.5, 0.14, 'triangle', 0.11, 0.055);
      this.playTone(1760, 0.2, 'sine', 0.09, 0.11);
    } else {
      this.playTone(1180, 0.065, 'triangle', 0.085);
    }
  }

  public playDamageTaken(): void {
    this.playTone(135, 0.15, 'sawtooth', 0.08);
    this.playTone(95, 0.18, 'triangle', 0.09, 0.03);
  }

  public playJumpPad(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.22);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playReload(): void {
    this.playTone(360, 0.07, 'sine', 0.05);
    this.playTone(540, 0.09, 'triangle', 0.06, 0.09);
    this.playTone(720, 0.1, 'sine', 0.06, 0.18);
  }

  public playMove(): void {
    this.playTone(320, 0.08, 'triangle', 0.07);
    this.playTone(480, 0.07, 'sine', 0.04, 0.03);
  }

  public playCapture(): void {
    this.playTone(220, 0.14, 'sawtooth', 0.06);
    this.playTone(140, 0.18, 'triangle', 0.08, 0.04);
  }

  public playCatch(): void {
    this.playTone(587.33, 0.1, 'sine', 0.07);
    this.playTone(880, 0.14, 'sine', 0.07, 0.05);
  }

  public playMiss(): void {
    this.playTone(170, 0.18, 'sawtooth', 0.06);
    this.playTone(125, 0.22, 'triangle', 0.05, 0.06);
  }

  public playGiftFanfare(rarity: 'Standard' | 'Signature' | 'Mythic'): void {
    if (rarity === 'Mythic') {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((n, idx) => this.playTone(n, 0.35, 'triangle', 0.07, idx * 0.065));
    } else if (rarity === 'Signature') {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((n, idx) => this.playTone(n, 0.26, 'sine', 0.07, idx * 0.06));
    } else {
      this.playTone(523.25, 0.18, 'sine', 0.07);
      this.playTone(783.99, 0.22, 'sine', 0.06, 0.06);
    }
  }

  public playBeat(accent = false): void {
    this.playTone(accent ? 660 : 440, 0.09, 'sine', accent ? 0.08 : 0.04);
  }

  public playEngineStart(): void {
    this.playTone(180, 0.08, 'sawtooth', 0.06);
    this.playTone(260, 0.1, 'triangle', 0.07, 0.06);
    this.playTone(390, 0.16, 'sine', 0.08, 0.13);
  }

  public playFuelLow(): void {
    this.playTone(580, 0.08, 'square', 0.045);
    this.playTone(460, 0.09, 'square', 0.04, 0.09);
  }

  public playGameOver(): void {
    this.playTone(300, 0.14, 'sawtooth', 0.075);
    this.playTone(220, 0.18, 'sawtooth', 0.075, 0.12);
    this.playTone(135, 0.28, 'triangle', 0.085, 0.26);
  }

  public playVictory(): void {
    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((freq, i) => this.playTone(freq, 0.42, 'triangle', 0.07, i * 0.08));
  }
}

export const soundFx = new SoundEngine();
