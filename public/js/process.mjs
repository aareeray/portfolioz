// Accessible expandable process list. Progressive enhancement: without JS the
// panels are already readable (max-height animates, but content is in the DOM).

export function initProcess() {
  const items = Array.from(document.querySelectorAll("[data-process-item]"));
  const cleanups = [];

  for (const item of items) {
    const toggle = item.querySelector("[data-process-toggle]");
    const panel = item.querySelector(".process-item__panel");
    if (!toggle || !panel) continue;

    const set = (open) => {
      item.dataset.open = String(open);
      toggle.setAttribute("aria-expanded", String(open));
      panel.style.maxHeight = open ? `${panel.scrollHeight}px` : "0px";
    };
    set(false);

    const onClick = () => set(item.dataset.open !== "true");
    toggle.addEventListener("click", onClick);
    cleanups.push(() => toggle.removeEventListener("click", onClick));
  }

  return () => cleanups.forEach((fn) => fn());
}
