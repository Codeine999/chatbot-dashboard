/**
 * Notifications arrive from a socket push, not a click, so browsers treat
 * playback as unprompted autoplay and suspend it until a real user gesture
 * happens on the page. We keep one shared AudioContext and resume it on the
 * first click/keydown/touch anywhere, so it's already unlocked by the time
 * a notification actually needs to play.
 */
let sharedContext: AudioContext | null = null;
let unlockListenersAttached = false;

function getAudioContextClass(): typeof AudioContext | undefined {
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  );
}

function getSharedContext(): AudioContext | null {
  if (sharedContext) return sharedContext;

  const AudioContextClass = getAudioContextClass();
  if (!AudioContextClass) return null;

  sharedContext = new AudioContextClass();
  attachUnlockListeners(sharedContext);
  return sharedContext;
}

function attachUnlockListeners(ctx: AudioContext): void {
  if (unlockListenersAttached) return;
  unlockListenersAttached = true;

  const unlock = () => {
    if (ctx.state === "suspended") void ctx.resume();
  };

  ["click", "keydown", "touchstart"].forEach((event) =>
    window.addEventListener(event, unlock, { passive: true })
  );
}

export async function playNotificationSound(): Promise<void> {
  const ctx = getSharedContext();
  if (!ctx) {
    console.warn("Notification sound: Web Audio API is not available.");
    return;
  }

  try {
    if (ctx.state === "suspended") await ctx.resume();

    if (ctx.state !== "running") {
      console.warn(
        `Notification sound: AudioContext is "${ctx.state}" — browser is blocking playback until the user interacts with the page.`
      );
      return;
    }

    const startAt = ctx.currentTime;
    const duration = 0.35;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 1046.5; // C6 — a bright, gentle "ting"

    // Soft attack, smooth exponential decay so it reads as a chime, not a beep.
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.12, startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration);
  } catch (error) {
    console.warn("Notification sound failed to play:", error);
  }
}
