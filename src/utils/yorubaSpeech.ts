// Yoruba and Brazilian Liturgical Pronunciation Synthesizer for Ketu Candomblé

class YorubaSpeechSynthesizer {
  private isSpeaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioCtx: AudioContext | null = null;

  public playTermo(
    termo: string,
    pronunciaFonetica: string,
    slowSpeed = false,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    this.stop();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Clean phonetic guide or term for speech synthesis
      // In Ketu Candomblé in Brazil, phonetic guides (like 'Mô-dju-bá', 'Ah-ché') sound most authentic with pt-BR voice
      const textToSpeak = pronunciaFonetica ? pronunciaFonetica.replace(/-/g, ' ') : termo;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'pt-BR';
      utterance.rate = slowSpeed ? 0.65 : 0.85;
      utterance.pitch = 1.0;

      // Pick an optimal voice if available
      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find((v) => v.lang.startsWith('pt') || v.lang.includes('BR'));
      if (ptVoice) {
        utterance.voice = ptVoice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        onStart?.();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        onEnd?.();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.playFallbackChime();
        onEnd?.();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback bell chime
      this.playFallbackChime();
      onStart?.();
      setTimeout(() => {
        onEnd?.();
      }, 800);
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  private playFallbackChime() {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, this.audioCtx.currentTime); // Solfeggio 528Hz sacred chime
      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.8);
    } catch {
      // Audio not permitted or supported
    }
  }
}

export const yorubaSpeech = new YorubaSpeechSynthesizer();
