// Live local time. Updates once per second, only inside dedicated [data-clock]
// nodes, using a single shared interval (no full-site re-render).

export function initClock() {
  const clocks = Array.from(document.querySelectorAll("[data-clock]"));
  if (clocks.length === 0) return () => {};

  const update = () => {
    const now = new Date();
    for (const el of clocks) {
      const tz = el.getAttribute("data-timezone") || undefined;
      try {
        el.textContent = new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: tz,
        }).format(now);
      } catch {
        el.textContent = new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(now);
      }
    }
  };

  update();
  const id = setInterval(update, 1000);
  return () => clearInterval(id);
}
