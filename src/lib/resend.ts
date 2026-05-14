import { Resend } from "resend";
import { serverEnv } from "./env";

/**
 * Singleton Resend client.
 * Throws at first use if RESEND_API_KEY is not set — callers should be on server.
 */
let _client: Resend | null = null;

export function getResend() {
  if (!serverEnv.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY not configured");
  }
  if (!_client) {
    _client = new Resend(serverEnv.RESEND_API_KEY);
  }
  return _client;
}

/** Branded "from" with display name + default address. */
export const FROM_DEFAULT = `Equipo iActReady <${serverEnv.RESEND_FROM_DEFAULT}>`;
