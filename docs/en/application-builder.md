# ApplicationBuilder

This page describes `ApplicationBuilder` in `zalo-bot-js`, which is used to configure and create `Application` in builder style.

This is the right choice if you want to organize your bot in a handler-based style instead of a pure event listener with `Bot`.

## Role

`ApplicationBuilder` helps you:

- place tokens
- set `baseUrl` if needed
- make `Application` complete with `build()`

## For example

```ts
import { ApplicationBuilder } from "zalo-bot-js";

const app = new ApplicationBuilder()
  .token(process.env.ZALO_BOT_TOKEN!)
  .build();
```

## Main functions

### `token(token: string): this`

Set up bot token for application.

### `baseUrl(baseUrl: string): this`

Set a custom `baseUrl` if you don't want to use the default.

### `build(): Application`

Create instance `Application`.

If the token is not set, this function will throw an error.

## When should you use it?

- you want to write a bot using `CommandHandler` and `MessageHandler`
- you want a structure close to a traditional bot framework
- You want to clearly separate the app configuration part and the update handling part

## Next

- See [Application](./application.md) to see how the app operates the handler.
- See [CommandHandler](./command-handler.md) to handle handler-based commands.

Last updated: April 5, 2026
