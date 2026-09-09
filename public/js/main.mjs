// Entry point. Initialises each enhancement module defensively so a failure in
// one never blocks the others. All modules are progressive enhancements over
// fully server-rendered HTML.
import { initCursor } from "./cursor.mjs";
import { initSmoothScroll } from "./smoothScroll.mjs";
import { initReveal } from "./reveal.mjs";
import { initMenu } from "./menu.mjs";
import { initClock } from "./time.mjs";
import { initCopy } from "./copy.mjs";
import { initContact } from "./contact.mjs";
import { initTransitions } from "./transition.mjs";
import { initProcess } from "./process.mjs";
import { initExperiments } from "./experiments.mjs";
import { initAudio } from "./audio.mjs";

const teardowns = [];

function safe(name, fn) {
  try {
    const cleanup = fn();
    if (typeof cleanup === "function") teardowns.push(cleanup);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`[init:${name}] failed`, err);
  }
}

function boot() {
  safe("clock", initClock);
  safe("reveal", initReveal);
  safe("menu", initMenu);
  safe("copy", initCopy);
  safe("contact", initContact);
  safe("process", initProcess);
  safe("cursor", initCursor);
  safe("smoothScroll", initSmoothScroll);
  safe("transitions", initTransitions);
  safe("experiments", initExperiments);
  safe("audio", initAudio);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

// Clean up listeners/animations on unload to avoid leaks.
window.addEventListener("pagehide", () => {
  while (teardowns.length) {
    const fn = teardowns.pop();
    try {
      fn();
    } catch {
      /* ignore */
    }
  }
});

// Back-to-top control.
document.addEventListener("click", (e) => {
  const btn =
    e.target instanceof Element ? e.target.closest("[data-back-to-top]") : null;
  if (btn) window.scrollTo({ top: 0, behavior: "smooth" });
});
