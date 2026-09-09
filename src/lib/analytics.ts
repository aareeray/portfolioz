/**
 * Privacy-conscious analytics abstraction. Only meaningful events are tracked.
 * Providers: `none` (no-op) and `log` (structured log). Swap for a real provider
 * by adding a class that implements AnalyticsProvider.
 */
import { config } from "../config.ts";
import { logger } from "./logger.ts";

export type AnalyticsEvent =
  | { name: "project_viewed"; slug: string }
  | { name: "contact_submitted"; source: string | null }
  | { name: "external_project_clicked"; slug: string }
  | { name: "showreel_started" };

export interface AnalyticsProvider {
  track(event: AnalyticsEvent): void;
}

class NoopAnalytics implements AnalyticsProvider {
  track(): void {}
}

class LogAnalytics implements AnalyticsProvider {
  track(event: AnalyticsEvent): void {
    logger.info("analytics", { event });
  }
}

let instance: AnalyticsProvider | null = null;

export function getAnalytics(): AnalyticsProvider {
  if (instance) return instance;
  instance =
    config.analytics.provider === "log"
      ? new LogAnalytics()
      : new NoopAnalytics();
  return instance;
}
