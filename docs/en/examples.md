# Examples and tests

This page focuses on practical bot examples in the repo, including polling for fast local development and webhook delivery for HTTPS-based deployments.

If you want a bot example that already includes commands such as `/start`, `/ping`, `/help`, and a `hello` text reply, begin with the files in `examples/`.

## Polling bot example with built-in commands

Reference file: `examples/polling.ts`

This example is a good fit when:

- you are developing locally
- you do not have a webhook URL yet
- you want to test `message`, `text`, and `onText` handlers quickly

The sample bot currently includes:

- `hello`: replies with a greeting
- `/start`: sends a short introduction
- `/ping`: replies with `pong`
- `/help`: shows the built-in test commands

Run:

```bash
npm run test:hello-bot
```

## Webhook bot example with built-in commands

Reference file: `examples/webhook.ts`

This example is a good fit when:

- you already have a public HTTPS URL
- you want push-based update delivery instead of polling
- you are preparing a longer-running deployment

The webhook sample currently includes:

- `hello`: replies to plain text
- `/start`: confirms the command was received through webhook
- `/ping`: replies with `pong tu webhook`
- `/help`: shows the available test commands

## When to choose polling or webhook

Choose polling when:

- you are working locally
- you want the fastest debug loop
- you do not have public infrastructure yet

Choose webhook when:

- you already have a public HTTPS endpoint
- you want a production-style update flow
- you want to integrate with a real server deployment

## Webhook setup step by step

### Step 1: Create the bot

To create a Zalo Bot, follow the guide in [Getting started](./getting-started.md). After creating the bot, you will have the `ZALO_BOT_TOKEN` needed for API integration.

### Step 2: Set up webhook delivery

You need a server with an HTTPS domain to register a webhook endpoint. You can use:

- Ngrok for local development: `ngrok http 3000`
- Render, Railway, Vercel, or any platform that supports HTTPS

After you have a public URL, prepare `.env`:

```dotenv
ZALO_BOT_TOKEN=your_zalo_bot_token_here
ZALO_WEBHOOK_URL=https://your-public-domain.example/webhook
ZALO_WEBHOOK_SECRET=replace-with-a-random-secret
```

### Step 3: Run the webhook server

The file `examples/webhook.ts` starts a server at:

- `http://localhost:3000/webhook`

Once the server is listening, the example automatically calls `setWebHook()` using `ZALO_WEBHOOK_URL`.

### Step 4: Validate the secret token

The sample webhook checks the header:

- `x-bot-api-secret-token`

If it does not match `ZALO_WEBHOOK_SECRET`, the request is rejected with status `403`.

### Step 5: Send test messages

After the webhook is registered successfully, send one of the following:

- `hello`
- `/start`
- `/ping`
- `/help`

If the bot replies correctly, it means:

- the webhook received the update successfully
- the payload was parsed through `processUpdate()`
- the event listeners and text handlers are working as expected

## Token test

Reference file: `test/check-token.ts`

Run:

```bash
npm run test:token
```

This script only focuses on token verification and bot profile.This is the first step you should run when you have just configured `.env`.

## Hello bot test

Reference file: `test/hello-bot.ts`

Run:

```bash
npm run test:hello-bot
```

The bot will reply with:

- `/start`
- `hello`

This script is useful when you want to confirm at the same time:

- valid token
- polling works
- handler match is correct
- bot sent reply successfully

## Useful scripts

- `npm run build`
- `npm run check`
- `npm run test`
- `npm run docs:dev`
- `npm run docs:build`
- `npm run docs:preview`

## Suggested workflow

1. configure `.env`
2. run `npm run test:token`
3. run `npm run test:hello-bot`
4. start with `examples/polling.ts` if you are still working locally
5. move to `examples/webhook.ts` once you have a public HTTPS endpoint and want webhook delivery
