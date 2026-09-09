// Cinematic-but-fast page transitions. Intercepts same-origin navigations,
// plays a short cover animation, then navigates. Disabled under reduced motion
// (falls back to instant native navigation) and for modified clicks.
import { prefersReducedMotion } from "./motion.mjs";

export function initTransitions() {
  const cover = document.querySelector("[data-transition]");
  if (!cover || prefersReducedMotion()) return () => {};

  // Reveal-in on load (cover starts covering, then lifts).
  cover.dataset.state = "in";
  requestAnimationFrame(() => {
    cover.dataset.state = "idle";
  });

  const isInternal = (a) => {
    if (!a) return false;
    if (a.target === "_blank" || a.hasAttribute("download")) return false;
    if (
      a.getAttribute("rel") === "noopener noreferrer" &&
      a.hostname !== window.location.hostname
    )
      return false;
    const href = a.getAttribute("href") || "";
    if (
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    )
      return false;
    return a.hostname === window.location.hostname;
  };

  const onClick = (e) => {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    )
      return;
    const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
    if (!isInternal(a)) return;
    const url = a.href;
    if (url === window.location.href) return;
    e.preventDefault();
    cover.dataset.state = "out";
    window.setTimeout(() => {
      window.location.href = url;
    }, 380);
  };

  // Restore on back/forward (pageshow fires from bfcache).
  const onPageShow = () => {
    cover.dataset.state = "idle";
  };

  document.addEventListener("click", onClick);
  window.addEventListener("pageshow", onPageShow);

  return () => {
    document.removeEventListener("click", onClick);
    window.removeEventListener("pageshow", onPageShow);
  };
}
