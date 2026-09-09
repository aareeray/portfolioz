/**
 * In-memory token-bucket rate limiter keyed by IP. Suitable for a single-instance
 * deployment; swap for a shared store (Redis) behind this interface if scaling out.
 */
interface Bucket {
  tokens: number;
  updatedAt: number;
}

export class RateLimiter {
  private buckets = new Map<string, Bucket>();
  private max: number;
  private windowMs: number;

  constructor(max: number, windowMs: number) {
    this.max = max;
    this.windowMs = windowMs;
  }

  /** Returns true if the request is allowed (and consumes a token). */
  take(key: string, now: number = Date.now()): boolean {
    const refillRate = this.max / this.windowMs; // tokens per ms
    const bucket = this.buckets.get(key) ?? {
      tokens: this.max,
      updatedAt: now,
    };
    const elapsed = now - bucket.updatedAt;
    bucket.tokens = Math.min(this.max, bucket.tokens + elapsed * refillRate);
    bucket.updatedAt = now;
    if (bucket.tokens < 1) {
      this.buckets.set(key, bucket);
      return false;
    }
    bucket.tokens -= 1;
    this.buckets.set(key, bucket);
    return true;
  }

  /** Periodic cleanup to bound memory. */
  sweep(now: number = Date.now()): void {
    for (const [key, bucket] of this.buckets) {
      if (now - bucket.updatedAt > this.windowMs * 2) this.buckets.delete(key);
    }
  }
}
