// Custom cursor with smooth interpolation and centralised state.
// Disabled on touch/coarse pointers and under reduced motion.
import { prefersReducedMotion, isTouch, lerp } from "./motion.mjs";

export function initCursor() {
  if (isTouch() || prefersReducedMotion()) return () => {};

  const root = document.querySelector("[data-cursor-root]");
  const label = document.querySelector("[data-cursor-label]");
  if (!root) return () => {};

  document.body.classList.add("has-custom-cursor");

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let x = targetX;
  let y = targetY;
  let raf = 0;
  let visible = false;

  const onMove = (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!visible) {
      visible = true;
      root.dataset.hidden = "false";
    }
  };
  const onLeave = () => {
    visible = false;
    root.dataset.hidden = "true";
  };

  // Delegate hover state via data-cursor attributes.
  const onOver = (e) => {
    const el =
      e.target instanceof Element ? e.target.closest("[data-cursor]") : null;
    if (el) {
      const state = el.getAttribute("data-cursor") || "hover";
      root.dataset.state = state;
      if (state === "view" && label)
        label.textContent = el.getAttribute("data-cursor-label") || "View";
    } else {
      root.dataset.state = "default";
    }
  };

  const tick = () => {
    x = lerp(x, targetX, 0.18);
    y = lerp(y, targetY, 0.18);
    root.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    raf = requestAnimationFrame(tick);
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerover", onOver, { passive: true });
  window.addEventListener("mouseout", (e) => {
    if (!e.relatedTarget) onLeave();
  });
  window.addEventListener("blur", onLeave);
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerover", onOver);
    document.body.classList.remove("has-custom-cursor");
  };
}
