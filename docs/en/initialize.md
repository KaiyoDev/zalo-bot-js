# initialize

This page describes the `initialize()` function in `zalo-bot-js`, used to initialize internal transports and validate the bot token before the runtime starts processing updates.

This function is useful when you want explicit lifecycle control instead of letting the SDK initialize implicitly during polling.

## Function signature

```ts
initialize(): Promise<void>
```

## What this function does

When called, the SDK will:

1. initialize internal transports
2. call `getMe()` to validate the token
3. store initialized state to avoid repeated setup

## When to use it

- fail early if the token is invalid
- initialize the bot before starting an HTTP server or worker
- separate app boot from update processing

## Example

```ts
import { Bot } from "zalo-bot-js";

const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN! });

async function main() {
  await bot.initialize();
  console.log("Bot is ready");
}

void main();
```

## Relationship with `getMe()`

`initialize()` uses `getMe()` internally to validate the token. If `getMe()` fails, `initialize()` also fails.

## Practical notes

- if you use `startPolling()`, the SDK will call `initialize()` for you
- if you manage the lifecycle explicitly, pair `initialize()` with [shutdown](./shutdown.md)

## Next

- See [shutdown](./shutdown.md) to close transports when the app stops.
- See [getMe](./get-me.md) to understand how token validation works.

Last updated: April 5, 2026
