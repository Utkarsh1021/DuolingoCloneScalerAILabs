/**
 * Tiny procedural sound effects powered by the Web Audio API, so no audio
 * files are needed.
 *
 * Browsers block audio until the user interacts with the page. We unlock the
 * shared AudioContext on the first gesture (pointerdown/keydown/touchstart)
 * and resume it before scheduling tones so sounds always play.
 */

let ctx: AudioContext | null = null;
let unlocked = false;

function createContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!("AudioContext" in window) && !("webkitAudioContext" in window)) {
    return null;
  }
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  return new AC();
}

async function getContext(): Promise<AudioContext | null> {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = createContext();
  if (!ctx) return null;
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      return null;
    }
  }
  return ctx;
}

/** Call once per user gesture; safe to call many times. */
export function unlockAudio() {
  if (typeof window === "undefined" || unlocked || ctx) return;
  unlocked = true;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  if (AC) {
    ctx = new AC();
    void ctx.resume();
  }
}

/** Attach one-time gesture listeners so the first interaction enables audio. */
let listenersAttached = false;
export function initAudio() {
  if (typeof window === "undefined" || listenersAttached) return;
  listenersAttached = true;
  const unlock = () => unlockAudio();
  window.addEventListener("pointerdown", unlock, { capture: true });
  window.addEventListener("keydown", unlock, { capture: true });
  window.addEventListener("touchstart", unlock, { capture: true });
}

function tone(
  audio: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.25
) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, audio.currentTime + start);
  gain.gain.setValueAtTime(0.0001, audio.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(
    volume,
    audio.currentTime + start + 0.02
  );
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    audio.currentTime + start + duration
  );
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + duration + 0.05);
}

/** Bright, ascending "ding-ding" for correct answers. */
export async function playCorrectSound() {
  const audio = await getContext();
  if (!audio) return;
  tone(audio, 659.25, 0, 0.18, "triangle", 0.28); // E5
  tone(audio, 987.77, 0.09, 0.28, "triangle", 0.28); // B5
  tone(audio, 1318.51, 0.18, 0.4, "sine", 0.22); // E6
}

/** Quirky low "wah-wah" for wrong answers. */
export async function playWrongSound() {
  const audio = await getContext();
  if (!audio) return;
  tone(audio, 196, 0, 0.16, "sawtooth", 0.18); // G3
  tone(audio, 164.81, 0.14, 0.2, "sawtooth", 0.18); // E3
  tone(audio, 123.47, 0.28, 0.36, "triangle", 0.24); // B2
}