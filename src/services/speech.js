/**
 * Speech synthesis, Speech recognition, and synthesized Web Audio effects
 * for realistic hospital phone call simulation.
 */

// Web Audio sound synthesizer for realistic phone audio
class SoundEffects {
  constructor() {
    this.ctx = null;
  }

  initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Dial / Ringing tone
  playRingTone() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.frequency.value = 400; // 400Hz + 450Hz Indian ring tone standard
      osc2.frequency.value = 450;

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 1.2);
      osc2.stop(this.ctx.currentTime + 1.2);
    } catch (e) {
      console.warn("Audio ring tone error", e);
    }
  }

  // Call connected beep
  playConnectTone() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (e) {
      console.warn(e);
    }
  }

  // Barcode / QR scan beep
  playScanBeep() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1800, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {
      console.warn(e);
    }
  }

  // Success chime
  playSuccessChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const startTime = this.ctx.currentTime + idx * 0.09;
        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  // Emergency Siren Tone
  playEmergencyTone() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(650, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(900, this.ctx.currentTime + 0.25);
      osc.frequency.linearRampToValueAtTime(650, this.ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);
    } catch (e) {
      console.warn(e);
    }
  }
}

export const sfx = new SoundEffects();

// Browser Text-To-Speech (SpeechSynthesis) with Malayalam & English support
export function speakText(text, lang = 'en', onEnd = null) {
  // Support overload where lang is omitted: speakText(text, onEnd)
  if (typeof lang === 'function') {
    onEnd = lang;
    lang = 'en';
  }

  if (!('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const isMl = lang === 'ml' || /[\u0D00-\u0D7F]/.test(text);

  const voices = window.speechSynthesis.getVoices();

  if (isMl) {
    utterance.lang = "ml-IN";
    // Look for Malayalam voice on Android, Chrome, or Windows
    const mlVoice = voices.find(v => 
      v.lang.toLowerCase().includes("ml") || 
      v.name.toLowerCase().includes("malayalam") ||
      v.lang.toLowerCase().includes("mal")
    );
    if (mlVoice) {
      utterance.voice = mlVoice;
    }
    // Slower, respectful cadence for clear elderly comprehension
    utterance.rate = 0.90;
    utterance.pitch = 1.0;
  } else {
    utterance.lang = "en-IN";
    const inVoice = voices.find(v => 
      v.lang.includes("en-IN") || 
      v.name.includes("India") || 
      v.name.includes("Ravi") || 
      v.name.includes("Heera")
    );
    const enVoice = voices.find(v => v.lang.startsWith("en"));
    if (inVoice) {
      utterance.voice = inVoice;
    } else if (enVoice) {
      utterance.voice = enVoice;
    }
    utterance.rate = 0.98;
    utterance.pitch = 1.02;
  }

  if (onEnd) {
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Browser Speech-To-Text (SpeechRecognition) with Malayalam & English support
export function createSpeechRecognizer(lang = 'en', onResult = null, onError = null) {
  // Support overload where lang is omitted: createSpeechRecognizer(onResult, onError)
  if (typeof lang === 'function') {
    onError = onResult;
    onResult = lang;
    lang = 'en';
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = lang === 'ml' ? "ml-IN" : "en-IN";

  recognition.onresult = (event) => {
    if (event.results && event.results[0] && event.results[0][0]) {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    }
  };

  recognition.onerror = (event) => {
    if (onError) onError(event.error);
  };

  return recognition;
}
