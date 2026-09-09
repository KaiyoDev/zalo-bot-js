# startPolling

This page describes the `startPolling()`, `stopPolling()`, and `isPolling()` functions in `zalo-bot-js`, used to run the bot in polling mode.

If you want the SDK to fetch updates continuously without webhook infrastructure, this is the main runtime API to use.

## Function signatures

```ts
startPolling(options?: PollingOptions): Promise<void>
```

```ts
stopPolling(): void
```

```ts
isPolling(): boolean
```

## When to use polling

- local development
- environments without a public webhook URL
- quick bot testing before production deployment

## Example

```ts
import { Bot } from "zalo-bot-js";

const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN! });

bot.on("text", async (message) => {
  await bot.sendMessage(message.chat.id, `You said: ${message.text}`);
});

await bot.startPolling({
  timeoutSeconds: 30,
});
```

## Useful options

- `timeoutSeconds`
- `retryDelayMs`
- `allowedUpdates`
- `onUpdate`

## Practical notes

- `startPolling()` internally calls `initialize()`
- the SDK automatically manages update offsets while polling
- if you need full manual control, use [getUpdates](./get-updates.md)

## Next

- See [getUpdates](./get-updates.md) for manual polling.
- See [processUpdate](./process-update.md) to understand how each update is handled.

Last updated: April 5, 2026
