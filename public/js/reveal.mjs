// Scroll-triggered reveals via IntersectionObserver. Also lazy-loads videos and
// staggers hero title lines. Reduced-motion shows everything immediately.
import { prefersReducedMotion } from "./motion.mjs";

export function initReveal() {
  const reduced = prefersReducedMotion();

  // Hero title line reveal (transform handled in CSS via .is-visible on parent).
  const lines = document.querySelectorAll("[data-reveal-line]");
  lines.forEach((line, i) => {
    if (reduced) return;
    line.style.transform = "translateY(105%)";
    line.style.transition = `transform 800ms cubic-bezier(0.16,1,0.3,1) ${i * 90}ms`;
  });
  requestAnimationFrame(() => {
    lines.forEach((line) => {
      line.style.transform = "translateY(0)";
    });
  });

  const els = document.querySelectorAll("[data-reveal]");
  if (reduced || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
  );
  els.forEach((el) => observer.observe(el));

  // Lazy-load videos when near viewport.
  const videos = document.querySelectorAll("[data-smart-video]");
  const vObserver = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const video = entry.target;
        const source = video.querySelector("source[data-src]");
        if (source && !source.src) {
          source.src = source.getAttribute("data-src");
          video.load();
          video.play().catch(() => {});
        }
        obs.unobserve(video);
      }
    },
    { rootMargin: "200px" },
  );
  videos.forEach((v) => vObserver.observe(v));

  return () => {
    observer.disconnect();
    vObserver.disconnect();
  };
}
