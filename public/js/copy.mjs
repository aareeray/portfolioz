// Copy-to-clipboard for the email affordance, with graceful fallback for
// browsers without the async Clipboard API.

export function initCopy() {
  const buttons = Array.from(document.querySelectorAll("[data-copy-email]"));
  const cleanups = [];

  for (const btn of buttons) {
    const email = btn.getAttribute("data-email") || "";
    const textEl = btn.querySelector("[data-copy-text]");
    const hintEl = btn.querySelector("[data-copy-hint]");
    const original = textEl ? textEl.textContent : "";
    let timer = 0;

    const onClick = async () => {
      const ok = await copyText(email);
      if (hintEl) hintEl.textContent = ok ? "Copied" : "Press ⌘/Ctrl+C";
      if (textEl && ok) textEl.textContent = "Copied ✓";
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (textEl) textEl.textContent = original;
        if (hintEl) hintEl.textContent = "Click to copy";
      }, 1600);
    };

    btn.addEventListener("click", onClick);
    cleanups.push(() => btn.removeEventListener("click", onClick));
  }

  return () => cleanups.forEach((fn) => fn());
}

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  // Legacy fallback.
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
