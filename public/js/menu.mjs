// Mobile overlay menu: open/close, focus trap, Esc to close, body scroll lock,
// and a scroll-aware header that hides on scroll-down / shows on scroll-up.

export function initMenu() {
  const header = document.querySelector(".site-header");
  const overlay = document.querySelector(
    "[data-open]#menu-overlay, .menu-overlay",
  );
  const openBtn = document.querySelector("[data-menu-open]");
  const closeBtn = document.querySelector("[data-menu-close]");
  const links = overlay ? overlay.querySelectorAll("[data-menu-link]") : [];

  let lastFocused = null;

  const focusable = () =>
    overlay
      ? Array.from(
          overlay.querySelectorAll("a[href], button:not([disabled])"),
        ).filter((el) => el.offsetParent !== null)
      : [];

  const open = () => {
    if (!overlay) return;
    lastFocused = document.activeElement;
    overlay.dataset.open = "true";
    overlay.setAttribute("aria-hidden", "false");
    if (openBtn) openBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    const first = focusable()[0];
    if (first) first.focus();
    document.addEventListener("keydown", onKey);
  };

  const close = () => {
    if (!overlay) return;
    overlay.dataset.open = "false";
    overlay.setAttribute("aria-hidden", "true");
    if (openBtn) openBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKey);
    if (lastFocused && typeof lastFocused.focus === "function")
      lastFocused.focus();
  };

  const onKey = (e) => {
    if (e.key === "Escape") {
      close();
      return;
    }
    if (e.key === "Tab") {
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  if (openBtn) openBtn.addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", close);
  links.forEach((l) => l.addEventListener("click", close));

  // Scroll-aware header.
  let lastY = window.scrollY;
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (header && overlay?.dataset.open !== "true") {
        if (y > lastY && y > 120) header.dataset.hidden = "true";
        else header.dataset.hidden = "false";
      }
      lastY = y;
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  return () => {
    if (openBtn) openBtn.removeEventListener("click", open);
    if (closeBtn) closeBtn.removeEventListener("click", close);
    document.removeEventListener("keydown", onKey);
    window.removeEventListener("scroll", onScroll);
    document.body.style.overflow = "";
  };
}
