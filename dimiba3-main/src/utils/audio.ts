/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export function toggleSound(enabled: boolean) {
  soundEnabled = enabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playClickSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    // Sound suppressed by browser permissions or offline state
  }
}

export function playSuccessSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
    osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24); // C6

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime + 0.24);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}
}

export function playErrorSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
    osc.frequency.linearRampToValueAtTime(130, ctx.currentTime + 0.2); // slide down

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);

    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch (e) {}
}

export function playFanfareSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Play a lovely little major chord fanfare
    const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, G4, C5, E5
    const timings = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
    const durations = [0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.4];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + timings[idx]);
      
      gain.gain.setValueAtTime(0.08, now + timings[idx]);
      gain.gain.exponentialRampToValueAtTime(0.01, now + timings[idx] + durations[idx]);
      
      osc.start(now + timings[idx]);
      osc.stop(now + timings[idx] + durations[idx]);
    });
  } catch (e) {}
}
