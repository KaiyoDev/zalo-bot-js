# getMe

This page describes the `getMe()` function in `zalo-bot-js`, used to retrieve the current bot profile and validate that the token is working correctly.

This is the function you should call early when booting the app or when you want to verify environment configuration.

## Function signature

```ts
getMe(options?: RequestOptions): Promise<User>
```

## When to use it

- validate the token during startup
- confirm that the bot can reach the API
- retrieve bot profile information for debugging or admin tools

## Return value

The function returns `Promise<User>`.

When successful, you receive a parsed `User` model instance.

## Example

```ts
import { Bot } from "zalo-bot-js";

const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN! });

async function main() {
  const me = await bot.getMe();
  console.log(me);
}

void main();
```

## Relationship with `initialize()`

Internally, `initialize()` calls `getMe()` to validate the token.

## Error handling

Common failures include:

- invalid token
- API response cannot be parsed into a `User`
- network or timeout failure

## Next

- See [getUpdates](./get-updates.md) if you want to read updates manually.
- See [startPolling](./start-polling.md) if you want the SDK to receive updates continuously.

Last updated: April 5, 2026
