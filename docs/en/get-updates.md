# getUpdates

This page describes the `getUpdates()` and `getUpdate()` functions in `zalo-bot-js`, used to retrieve updates from the Bot API in a manual polling flow.

If you need full control over the polling loop, offset handling, or timeout values instead of using `startPolling()`, these functions are the right tools.

## Function signatures

```ts
getUpdates(
  params?: {
    offset?: number;
    limit?: number;
    timeout?: number;
    allowedUpdates?: string[];
  },
  options?: RequestOptions,
): Promise<Update[]>
```

```ts
getUpdate(
  params?: {
    offset?: number;
    limit?: number;
    timeout?: number;
    allowedUpdates?: string[];
  },
  options?: RequestOptions,
): Promise<Update | undefined>
```

## Difference between `getUpdates()` and `getUpdate()`

- `getUpdates()` returns a list of `Update[]`
- `getUpdate()` is a thin helper that returns the first item from `getUpdates()`

## When to use them

- build your own polling loop
- debug the update flow
- control `offset`, `timeout`, and `limit` manually

## Example with `getUpdates()`

```ts
import { Bot } from "zalo-bot-js";

const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN! });

async function main() {
  const updates = await bot.getUpdates({
    timeout: 30,
    limit: 10,
  });

  for (const update of updates) {
    console.log({
      updateId: update.updateId,
      eventTypes: update.eventTypes,
      text: update.message?.text ?? null,
    });
  }
}

void main();
```

## Example with `getUpdate()`

```ts
const update = await bot.getUpdate({ timeout: 30 });

if (update?.message) {
  console.log(update.message.text);
}
```

## Relationship with `startPolling()`

`startPolling()` uses `getUpdates()` internally to receive updates continuously.

## Practical notes

- if you write manual polling, update `offset` to avoid re-reading old updates
- `eventTypes` are derived by the SDK from message content, such as `message`, `text`, `command`, `photo`, and `sticker`

## Next

- See [processUpdate](./process-update.md) if you want to feed payloads into the SDK event system.
- See [startPolling](./start-polling.md) if you want the built-in polling runtime.

Last updated: April 5, 2026
