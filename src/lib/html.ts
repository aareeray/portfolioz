/**
 * Minimal, safe HTML templating.
 * `html` tagged template escapes all interpolated values by default, preventing XSS.
 * Use `raw()` to intentionally inline already-safe HTML (e.g. composed fragments).
 */

const ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[&<>"']/g, (c) => ESCAPE_MAP[c] ?? c);
}

/** Escape a value for use inside a double-quoted HTML attribute. */
export function escapeAttr(value: unknown): string {
  return escapeHtml(value);
}

/** A marker wrapper for pre-trusted HTML that must not be re-escaped. */
export class RawHtml {
  readonly value: string;
  constructor(value: string) {
    this.value = value;
  }
  toString(): string {
    return this.value;
  }
}

export function raw(value: string): RawHtml {
  return new RawHtml(value);
}

function render(value: unknown): string {
  if (value === null || value === undefined || value === false) return "";
  if (value instanceof RawHtml) return value.value;
  if (Array.isArray(value)) return value.map(render).join("");
  return escapeHtml(value);
}

/** Tagged template that returns RawHtml so composed fragments nest safely. */
export function html(
  strings: TemplateStringsArray,
  ...values: unknown[]
): RawHtml {
  let out = "";
  for (let i = 0; i < strings.length; i += 1) {
    out += strings[i];
    if (i < values.length) out += render(values[i]);
  }
  return new RawHtml(out);
}

/** Conditionally render a fragment. */
export function when(
  condition: unknown,
  fragment: () => RawHtml | string,
): RawHtml {
  return condition ? raw(String(fragment())) : raw("");
}

/** Build a `class="..."` attribute string from truthy entries. */
export function classes(
  ...names: Array<string | false | null | undefined>
): string {
  return names.filter(Boolean).join(" ");
}
