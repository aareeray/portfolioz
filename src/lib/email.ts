/**
 * EmailService abstraction so the provider can be swapped from config.
 * Providers: `console` (default, dev-safe, logs to stdout) and `resend`
 * (requires network + RESEND_API_KEY at runtime).
 */
import { config } from "../config.ts";
import { logger } from "./logger.ts";

export interface EmailMessage {
  to: string;
  from: string;
  subject: string;
  text: string;
  replyTo?: string;
}

export interface EmailService {
  send(
    message: EmailMessage,
  ): Promise<{ ok: boolean; id?: string; error?: string }>;
}

class ConsoleEmailService implements EmailService {
  async send(message: EmailMessage) {
    logger.info("email.console", {
      to: message.to,
      from: message.from,
      subject: message.subject,
      replyTo: message.replyTo,
      preview: message.text.slice(0, 200),
    });
    return { ok: true, id: `console-${Date.now()}` };
  }
}

class ResendEmailService implements EmailService {
  private apiKey: string;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  async send(message: EmailMessage) {
    if (!this.apiKey)
      return { ok: false, error: "RESEND_API_KEY not configured" };
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: message.from,
          to: message.to,
          subject: message.subject,
          text: message.text,
          reply_to: message.replyTo,
        }),
      });
      if (!res.ok) {
        return { ok: false, error: `Resend responded ${res.status}` };
      }
      const data = (await res.json()) as { id?: string };
      return { ok: true, id: data.id };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "unknown error",
      };
    }
  }
}

let instance: EmailService | null = null;

export function getEmailService(): EmailService {
  if (instance) return instance;
  instance =
    config.email.provider === "resend"
      ? new ResendEmailService(config.email.resendApiKey)
      : new ConsoleEmailService();
  return instance;
}
