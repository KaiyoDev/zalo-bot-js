export class ZaloError extends Error {
  constructor(message: string) {
    super(ZaloError.normalizeMessage(message));
    this.name = new.target.name;
  }

  private static normalizeMessage(message: string): string {
    return message
      .replace(/^Error:\s*/i, "")
      .replace(/^\[Error\]:\s*/i, "")
      .replace(/^Bad Request:\s*/i, "");
  }
}

export class Forbidden extends ZaloError {}

export class InvalidToken extends ZaloError {
  constructor(message = "Invalid token") {
    super(message);
  }
}

export class NetworkError extends ZaloError {}

export class BadRequest extends NetworkError {}

export class TimedOut extends NetworkError {
  constructor(message = "Timed out") {
    super(message);
  }
}

export class ChatMigrated extends ZaloError {
  constructor(public readonly newChatId: number) {
    super(`Group migrated to supergroup. New chat id: ${newChatId}`);
  }
}

export class RetryAfter extends ZaloError {
  constructor(public readonly retryAfter: number) {
    super(`Flood control exceeded. Retry in ${retryAfter} seconds`);
  }
}

export class Conflict extends ZaloError {}
