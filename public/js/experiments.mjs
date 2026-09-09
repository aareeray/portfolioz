// Playground experiments. Each runs in isolation inside a try/catch so one
// failing experiment can never break the page (error boundary pattern).
import { prefersReducedMotion } from "./motion.mjs";

export function initExperiments() {
  if (prefersReducedMotion()) return () => {};
  const cards = Array.from(document.querySelectorAll("[data-experiment]"));
  const cleanups = [];

  for (const card of cards) {
    try {
      const type = card.getAttribute("data-experiment");
      if (type === "interactive") cleanups.push(magneticHover(card));
    } catch (err) {
      // Isolate: mark and continue.
      card.setAttribute("data-experiment-error", "true");
      // eslint-disable-next-line no-console
      console.warn(
        "experiment failed:",
        card.getAttribute("data-experiment-slug"),
        err,
      );
    }
  }

  return () => cleanups.forEach((fn) => fn && fn());
}

// A subtle magnetic hover on the media element.
function magneticHover(card) {
  const media = card.querySelector(".media");
  if (!media) return () => {};
  let raf = 0;

  const onMove = (e) => {
    const rect = card.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      media.style.transform = `translate(${relX * 12}px, ${relY * 12}px) scale(1.03)`;
    });
  };
  const onLeave = () => {
    cancelAnimationFrame(raf);
    media.style.transform = "";
  };

  card.addEventListener("pointermove", onMove);
  card.addEventListener("pointerleave", onLeave);
  return () => {
    cancelAnimationFrame(raf);
    card.removeEventListener("pointermove", onMove);
    card.removeEventListener("pointerleave", onLeave);
  };
}
