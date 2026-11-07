import { Verso } from '../types';

/**
 * Web Audio Engine for Ketu Candomblé Rhythms (Atabaques: Rum, Rumpi, Lé & Agogô)
 * plus Web Speech Yoruba pronunciation & real audio playback with 0.5x, 0.75x, 1x and looping.
 */

class KetuAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private playbackRate = 1.0;
  private currentVerseIndex = 0;
  private loopVerse = false;
  private audioEl: HTMLAudioElement | null = null;
  private rhythmTimer: number | null = null;
  private onVerseChangeCallback?: (index: number) => void;
  private onStateChangeCallback?: (playing: boolean) => void;
  private activeVerses: Verso[] = [];
  private activeToque: string = 'Ijexá';

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Synthesize an Atabaque hit (Rum = deep resonant bass, Rumpi = mid tone, Lé = sharp high slap)
  private playDrumHit(type: 'rum' | 'rumpi' | 'le' | 'agogo_low' | 'agogo_high', time: number) {
    try {
      const ctx = this.getAudioContext();

      if (type === 'agogo_low' || type === 'agogo_high') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(type === 'agogo_high' ? 880 : 587.33, time);
        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.16);
        return;
      }

      // Drum membranes (Rum / Rumpi / Lé)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      let freq = 120;
      let decay = 0.28;
      let filterFreq = 300;

      if (type === 'rum') {
        freq = 65;
        decay = 0.35;
        filterFreq = 220;
      } else if (type === 'rumpi') {
        freq = 140;
        decay = 0.22;
        filterFreq = 480;
      } else {
        // Lé
        freq = 240;
        decay = 0.14;
        filterFreq = 800;
      }

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 1.5, time);
      osc.frequency.exponentialRampToValueAtTime(freq, time + 0.05);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq, time);

      gain.gain.setValueAtTime(type === 'rum' ? 0.4 : 0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + decay + 0.05);
    } catch {
      // AudioContext fallback
    }
  }

  // Play a rhythm bar
  private triggerRhythmMeasure(toque: string) {
    const ctx = this.getAudioContext();
    const now = ctx.currentTime;
    const baseStep = 0.18 / this.playbackRate;

    // Ketu Atabaque patterns
    if (toque === 'Ijexá') {
      // Cadence: Agogo: 1, 2.5, 3, 4.5. Rumpi: 1.5, 3.5. Rum: 1, 3
      this.playDrumHit('agogo_high', now);
      this.playDrumHit('rum', now);
      this.playDrumHit('agogo_low', now + baseStep);
      this.playDrumHit('rumpi', now + baseStep * 1.5);
      this.playDrumHit('agogo_high', now + baseStep * 2);
      this.playDrumHit('rum', now + baseStep * 2);
      this.playDrumHit('le', now + baseStep * 3);
    } else if (toque === 'Bravum') {
      // Rapid warrior pattern
      this.playDrumHit('agogo_high', now);
      this.playDrumHit('rum', now);
      this.playDrumHit('le', now + baseStep * 0.7);
      this.playDrumHit('rumpi', now + baseStep * 1.4);
      this.playDrumHit('rum', now + baseStep * 2.1);
      this.playDrumHit('agogo_low', now + baseStep * 2.1);
    } else if (toque === 'Alujá') {
      // Xangô's majesty
      this.playDrumHit('rum', now);
      this.playDrumHit('rum', now + baseStep * 0.5);
      this.playDrumHit('agogo_high', now + baseStep * 1);
      this.playDrumHit('rumpi', now + baseStep * 1.5);
      this.playDrumHit('rum', now + baseStep * 2);
    } else {
      // Standard Ilú / Xirê
      this.playDrumHit('agogo_high', now);
      this.playDrumHit('rum', now);
      this.playDrumHit('le', now + baseStep);
      this.playDrumHit('rumpi', now + baseStep * 1.5);
      this.playDrumHit('rum', now + baseStep * 2);
    }
  }

  // Speak a verse line with Web Speech API for pronunciation guidance
  private speakVerse(verse: Verso) {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    // Use the phonetic guide which is tuned for Brazilian Portuguese readers of Yoruba!
    const textToSpeak = verse.pronuncia || verse.ioruba;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9 * this.playbackRate;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (!this.isPlaying) return;

      const verseDurationMs = Math.max(2200, (textToSpeak.length * 110) / this.playbackRate);

      setTimeout(() => {
        if (!this.isPlaying) return;

        if (this.loopVerse) {
          // Loop current verse
          this.speakVerse(this.activeVerses[this.currentVerseIndex]);
        } else {
          // Advance to next verse
          const nextIndex = this.currentVerseIndex + 1;
          if (nextIndex < this.activeVerses.length) {
            this.currentVerseIndex = nextIndex;
            this.onVerseChangeCallback?.(this.currentVerseIndex);
            this.speakVerse(this.activeVerses[this.currentVerseIndex]);
          } else {
            // Finished all verses, loop back to start
            this.currentVerseIndex = 0;
            this.onVerseChangeCallback?.(0);
            this.speakVerse(this.activeVerses[0]);
          }
        }
      }, verseDurationMs * 0.3);
    };

    window.speechSynthesis.speak(utterance);
  }

  public playCantiga({
    verses,
    toque,
    audioUrl,
    startIndex = 0,
    onVerseChange,
    onStateChange,
  }: {
    verses: Verso[];
    toque: string;
    audioUrl?: string;
    startIndex?: number;
    onVerseChange?: (index: number) => void;
    onStateChange?: (playing: boolean) => void;
  }) {
    this.stop();
    this.activeVerses = verses;
    this.activeToque = toque;
    this.currentVerseIndex = startIndex;
    this.onVerseChangeCallback = onVerseChange;
    this.onStateChangeCallback = onStateChange;
    this.isPlaying = true;
    this.onStateChangeCallback?.(true);
    this.onVerseChangeCallback?.(this.currentVerseIndex);

    if (audioUrl) {
      // Real recorded audio file attached by house administrator!
      if (!this.audioEl) {
        this.audioEl = new Audio();
      }
      this.audioEl.src = audioUrl;
      this.audioEl.playbackRate = this.playbackRate;
      this.audioEl.play().catch(() => {
        // Fallback to internal synth if audio file cannot be loaded
        this.startSyntheticPlayback();
      });

      this.audioEl.onended = () => {
        if (this.loopVerse) {
          this.audioEl?.play();
        } else {
          this.stop();
        }
      };
    } else {
      // Authentic Ketu rhythm synth + pronunciation
      this.startSyntheticPlayback();
    }
  }

  private startSyntheticPlayback() {
    this.getAudioContext();

    // Rhythmic Atabaque loop timer
    const intervalMs = Math.max(500, 1100 / this.playbackRate);
    this.triggerRhythmMeasure(this.activeToque);

    this.rhythmTimer = window.setInterval(() => {
      if (this.isPlaying) {
        this.triggerRhythmMeasure(this.activeToque);
      }
    }, intervalMs);

    // Speak initial verse
    if (this.activeVerses[this.currentVerseIndex]) {
      this.speakVerse(this.activeVerses[this.currentVerseIndex]);
    }
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else if (this.activeVerses.length > 0) {
      this.isPlaying = true;
      this.onStateChangeCallback?.(true);
      if (this.audioEl && this.audioEl.src) {
        this.audioEl.play().catch(() => {});
      } else {
        this.startSyntheticPlayback();
      }
    }
  }

  public pause() {
    this.isPlaying = false;
    this.onStateChangeCallback?.(false);
    if (this.rhythmTimer) {
      clearInterval(this.rhythmTimer);
      this.rhythmTimer = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.audioEl) {
      this.audioEl.pause();
    }
  }

  public stop() {
    this.pause();
    this.currentVerseIndex = 0;
    this.onVerseChangeCallback?.(0);
  }

  public setRate(rate: number) {
    this.playbackRate = rate;
    if (this.audioEl) {
      this.audioEl.playbackRate = rate;
    }
    // Restart active rhythm timer if playing
    if (this.isPlaying && !this.audioEl?.src) {
      if (this.rhythmTimer) clearInterval(this.rhythmTimer);
      const intervalMs = Math.max(500, 1100 / this.playbackRate);
      this.rhythmTimer = window.setInterval(() => {
        if (this.isPlaying) {
          this.triggerRhythmMeasure(this.activeToque);
        }
      }, intervalMs);
    }
  }

  public setVerse(index: number) {
    if (index >= 0 && index < this.activeVerses.length) {
      this.currentVerseIndex = index;
      this.onVerseChangeCallback?.(index);
      if (this.isPlaying && (!this.audioEl || !this.audioEl.src)) {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        this.speakVerse(this.activeVerses[this.currentVerseIndex]);
      }
    }
  }

  public toggleLoopVerse() {
    this.loopVerse = !this.loopVerse;
    return this.loopVerse;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getPlaybackRate(): number {
    return this.playbackRate;
  }

  public getIsLooping(): boolean {
    return this.loopVerse;
  }

  public getCurrentVerseIndex(): number {
    return this.currentVerseIndex;
  }

  // Play single feedback sound effect for exercise correctness
  public playChime(success: boolean) {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      if (success) {
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      } else {
        osc.frequency.setValueAtTime(311.13, now); // Eb4
        osc.frequency.setValueAtTime(277.18, now + 0.12); // Db4
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // Audio effect fallback
    }
  }
}

export const ketuAudio = new KetuAudioEngine();
