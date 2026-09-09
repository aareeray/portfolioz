// Accessible ambient-audio toggle. Never autoplays. Persists preference in
// localStorage. Uses the Web Audio API to synthesise a soft tone bed so no
// audio asset is bundled (swap for a real source via [data-audio-src]).

const STORAGE_KEY = "pf_audio_enabled";

export function initAudio() {
  const toggle = document.querySelector("[data-audio-toggle]");
  if (!toggle) return () => {};

  let ctx = null;
  let gain = null;
  let nodes = [];
  let enabled = false;

  const setState = (on) => {
    enabled = on;
    toggle.setAttribute("aria-pressed", String(on));
    try {
      localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const startTone = () => {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);
    // Two detuned sines for a soft pad.
    [110, 110.4].forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      osc.start();
      nodes.push(osc);
    });
    gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 1.2);
  };

  const stopTone = () => {
    if (!ctx || !gain) return;
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
    setTimeout(() => {
      nodes.forEach((n) => {
        try {
          n.stop();
        } catch {
          /* ignore */
        }
      });
      nodes = [];
      if (ctx) ctx.close();
      ctx = null;
      gain = null;
    }, 500);
  };

  const onClick = () => {
    if (enabled) {
      setState(false);
      stopTone();
    } else {
      setState(true);
      startTone();
    }
  };

  toggle.addEventListener("click", onClick);
  // Reflect stored preference in the UI, but require a user gesture to actually
  // start audio (browser policy + accessibility).
  try {
    if (localStorage.getItem(STORAGE_KEY) === "1")
      toggle.setAttribute("aria-pressed", "true");
  } catch {
    /* ignore */
  }

  return () => {
    toggle.removeEventListener("click", onClick);
    stopTone();
  };
}
