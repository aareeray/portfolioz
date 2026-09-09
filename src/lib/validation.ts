/**
 * A tiny Zod-inspired schema/validation library (zero dependencies).
 * Supports the subset needed by this app: strings (with constraints), numbers,
 * booleans, enums, optional/default, and objects. Returns a discriminated result.
 */

export interface ValidationIssue {
  path: string;
  message: string;
}

export type ParseResult<T> =
  { success: true; data: T } | { success: false; issues: ValidationIssue[] };

export abstract class Schema<T> {
  abstract _parse(
    value: unknown,
    path: string,
  ): { value?: T; issues: ValidationIssue[] };

  optional(): Schema<T | undefined> {
    return new OptionalSchema<T>(this);
  }

  default(value: T): Schema<T> {
    return new DefaultSchema<T>(this, value);
  }

  parse(value: unknown): ParseResult<T> {
    const res = this._parse(value, "");
    if (res.issues.length > 0) return { success: false, issues: res.issues };
    return { success: true, data: res.value as T };
  }
}

class OptionalSchema<T> extends Schema<T | undefined> {
  private inner: Schema<T>;
  constructor(inner: Schema<T>) {
    super();
    this.inner = inner;
  }
  _parse(value: unknown, path: string) {
    if (value === undefined || value === null || value === "") {
      return { value: undefined, issues: [] };
    }
    return this.inner._parse(value, path);
  }
}

class DefaultSchema<T> extends Schema<T> {
  private inner: Schema<T>;
  private fallback: T;
  constructor(inner: Schema<T>, fallback: T) {
    super();
    this.inner = inner;
    this.fallback = fallback;
  }
  _parse(value: unknown, path: string) {
    if (value === undefined || value === null || value === "") {
      return { value: this.fallback, issues: [] };
    }
    return this.inner._parse(value, path);
  }
}

interface StringOpts {
  min?: number;
  max?: number;
  email?: boolean;
  url?: boolean;
  regex?: { pattern: RegExp; message: string };
  trim?: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class StringSchema extends Schema<string> {
  private opts: StringOpts;
  constructor(opts: StringOpts = {}) {
    super();
    this.opts = opts;
  }
  min(n: number): StringSchema {
    return new StringSchema({ ...this.opts, min: n });
  }
  max(n: number): StringSchema {
    return new StringSchema({ ...this.opts, max: n });
  }
  email(): StringSchema {
    return new StringSchema({ ...this.opts, email: true });
  }
  url(): StringSchema {
    return new StringSchema({ ...this.opts, url: true });
  }
  regex(pattern: RegExp, message: string): StringSchema {
    return new StringSchema({ ...this.opts, regex: { pattern, message } });
  }
  trim(): StringSchema {
    return new StringSchema({ ...this.opts, trim: true });
  }
  _parse(value: unknown, path: string) {
    const issues: ValidationIssue[] = [];
    if (typeof value !== "string") {
      return { issues: [{ path, message: "Expected a string" }] };
    }
    let v = this.opts.trim === false ? value : value.trim();
    if (this.opts.min !== undefined && v.length < this.opts.min) {
      issues.push({
        path,
        message: `Must be at least ${this.opts.min} characters`,
      });
    }
    if (this.opts.max !== undefined && v.length > this.opts.max) {
      issues.push({
        path,
        message: `Must be at most ${this.opts.max} characters`,
      });
    }
    if (this.opts.email && !EMAIL_RE.test(v)) {
      issues.push({ path, message: "Must be a valid email address" });
    }
    if (this.opts.url) {
      try {
        // eslint-disable-next-line no-new
        new URL(v);
      } catch {
        issues.push({ path, message: "Must be a valid URL" });
      }
    }
    if (this.opts.regex && !this.opts.regex.pattern.test(v)) {
      issues.push({ path, message: this.opts.regex.message });
    }
    return { value: v, issues };
  }
}

class NumberSchema extends Schema<number> {
  private opts: { min?: number; max?: number; int?: boolean };
  constructor(opts: { min?: number; max?: number; int?: boolean } = {}) {
    super();
    this.opts = opts;
  }
  min(n: number): NumberSchema {
    return new NumberSchema({ ...this.opts, min: n });
  }
  max(n: number): NumberSchema {
    return new NumberSchema({ ...this.opts, max: n });
  }
  int(): NumberSchema {
    return new NumberSchema({ ...this.opts, int: true });
  }
  _parse(value: unknown, path: string) {
    const issues: ValidationIssue[] = [];
    const n = typeof value === "string" ? Number(value) : (value as number);
    if (typeof n !== "number" || Number.isNaN(n)) {
      return { issues: [{ path, message: "Expected a number" }] };
    }
    if (this.opts.int && !Number.isInteger(n)) {
      issues.push({ path, message: "Must be an integer" });
    }
    if (this.opts.min !== undefined && n < this.opts.min) {
      issues.push({ path, message: `Must be >= ${this.opts.min}` });
    }
    if (this.opts.max !== undefined && n > this.opts.max) {
      issues.push({ path, message: `Must be <= ${this.opts.max}` });
    }
    return { value: n, issues };
  }
}

class BooleanSchema extends Schema<boolean> {
  _parse(value: unknown, _path: string) {
    // Form checkboxes send "on"/"true"/"1" or are absent.
    const truthy =
      value === true || value === "on" || value === "true" || value === "1";
    const falsy =
      value === false ||
      value === "off" ||
      value === "false" ||
      value === "0" ||
      value === undefined ||
      value === null ||
      value === "";
    if (!truthy && !falsy) return { value: Boolean(value), issues: [] };
    return { value: truthy, issues: [] };
  }
}

class EnumSchema<T extends string> extends Schema<T> {
  private values: readonly T[];
  constructor(values: readonly T[]) {
    super();
    this.values = values;
  }
  _parse(value: unknown, path: string) {
    if (
      typeof value === "string" &&
      (this.values as readonly string[]).includes(value)
    ) {
      return { value: value as T, issues: [] };
    }
    return {
      issues: [{ path, message: `Must be one of: ${this.values.join(", ")}` }],
    };
  }
}

type Shape = Record<string, Schema<unknown>>;
type Infer<S extends Shape> = {
  [K in keyof S]: S[K] extends Schema<infer U> ? U : never;
};

class ObjectSchema<S extends Shape> extends Schema<Infer<S>> {
  private shape: S;
  constructor(shape: S) {
    super();
    this.shape = shape;
  }
  _parse(value: unknown, path: string) {
    const issues: ValidationIssue[] = [];
    if (typeof value !== "object" || value === null) {
      return {
        issues: [{ path: path || "(root)", message: "Expected an object" }],
      };
    }
    const record = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(this.shape)) {
      const childPath = path ? `${path}.${key}` : key;
      const res = this.shape[key]!._parse(record[key], childPath);
      issues.push(...res.issues);
      if (res.issues.length === 0) out[key] = res.value;
    }
    return { value: out as Infer<S>, issues };
  }
}

export const v = {
  string: (opts?: StringOpts) => new StringSchema(opts),
  number: () => new NumberSchema(),
  boolean: () => new BooleanSchema(),
  enum: <T extends string>(values: readonly T[]) => new EnumSchema<T>(values),
  object: <S extends Shape>(shape: S) => new ObjectSchema<S>(shape),
};

export type { Infer };
