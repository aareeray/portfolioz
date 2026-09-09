// Centralised motion tokens & helpers. All modules import from here so timing
// and easing live in one place (mirrors src/styles tokens; keep in sync).

export const motionTokens = {
  fast: 200,
  normal: 450,
  slow: 800,
};

export const easings = {
  outExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  outQuart: (t) => 1 - Math.pow(1 - t, 4),
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
};

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isTouch() {
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

export const lerp = (a, b, t) => a + (b - a) * t;

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
