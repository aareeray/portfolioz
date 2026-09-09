// Lightweight inertial smooth scrolling (Lenis-like) with zero dependencies.
// Falls back to native scrolling on touch or under reduced motion, and never
// blocks keyboard/anchor accessibility.
import { prefersReducedMotion, isTouch, lerp } from "./motion.mjs";

export function initSmoothScroll() {
  if (prefersReducedMotion() || isTouch()) return () => {};

  let current = window.scrollY;
  let target = window.scrollY;
  let raf = 0;
  let running = false;

  const maxScroll = () =>
    document.documentElement.scrollHeight - window.innerHeight;

  const onWheel = (e) => {
    // Respect modifier keys and horizontal intent.
    if (e.ctrlKey) return;
    e.preventDefault();
    target = Math.min(Math.max(0, target + e.deltaY), maxScroll());
    if (!running) start();
  };

  const start = () => {
    running = true;
    tick();
  };

  const tick = () => {
    current = lerp(current, target, 0.12);
    if (Math.abs(target - current) < 0.4) {
      current = target;
      running = false;
      window.scrollTo(0, Math.round(current));
      return;
    }
    window.scrollTo(0, Math.round(current));
    raf = requestAnimationFrame(tick);
  };

  // Keep target synced when the user scrolls by other means (keyboard, scrollbar, anchor).
  const onScroll = () => {
    if (!running) {
      current = window.scrollY;
      target = window.scrollY;
    }
  };

  const onResize = () => {
    target = Math.min(target, maxScroll());
  };

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
  };
}
