// Ambient audio toggle using Web Audio API synthesizer
const STORAGE_KEY = "pf_audio_enabled";

export function initAudio() {
  const toggle = document.querySelector("[data-audio-toggle]");
  if (!toggle) return () => {};

  const labelSpan = toggle.querySelector(".audio-label");
  let ctx = null;
  let gain = null;
  let nodes = [];
  let enabled = false;

  const setState = (on) => {
    enabled = on;
    toggle.setAttribute("aria-pressed", String(on));
    if (on) {
      toggle.classList.add("is-playing");
      if (labelSpan) labelSpan.innerHTML = 'Audio <strong>On</strong>';
    } else {
      toggle.classList.remove("is-playing");
      if (labelSpan) labelSpan.innerHTML = 'Audio <strong>Off</strong>';
    }
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
    
    // Soft atmospheric chord (F major 7 / ambient drone)
    [174.61, 220.0, 261.63, 329.63].forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      osc.start();
      nodes.push(osc);
    });
    gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 1.2);
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

  return () => {
    toggle.removeEventListener("click", onClick);
    stopTone();
  };
}
