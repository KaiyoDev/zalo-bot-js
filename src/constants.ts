export const BASE_URL = "https://bot-api.zapps.me";

export const DEFAULT_POLL_TIMEOUT_SECONDS = 30;
export const DEFAULT_RETRY_DELAY_MS = 1000;

export const ChatAction = {
  TYPING: "typing",
} as const;

export type ChatAction = (typeof ChatAction)[keyof typeof ChatAction];
