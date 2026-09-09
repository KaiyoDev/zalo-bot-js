# setWebhook

This page describes the `setWebhook()` function in `zalo-bot-js`, used to register a webhook URL so Zalo can send updates to your application.

If you are moving the bot to a production-style deployment or want push-based updates instead of polling, this is the function to use.

## Function signature

```ts
setWebhook(url: string, secretToken: string, options?: WebhookOptions): Promise<WebhookResult | undefined>
```

## When to use it

- deploy the bot with webhook delivery
- receive updates in real time
- protect the endpoint with a secret token
- check verification status immediately after registration

## Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `url` | `string` | Yes | Public HTTPS URL to receive webhook events |
| `secretToken` | `string` | Yes | Secret key (8–256 chars) sent in `X-Bot-Api-Secret-Token` header |
| `options` | `WebhookOptions` | No | Optional: `dropPendingUpdates`, `requestOptions` |

> ⚠️ The URL must be publicly accessible from the internet. `localhost`, `127.0.0.1`, private IPs (`192.168.x.x`, `10.x.x.x`), and Zalo internal domains will be rejected. Use a tunnel service like ngrok or Cloudflare Tunnel for local development.

## Return value

Returns `Promise<WebhookResult | undefined>`.

```ts
interface WebhookVerificationResult {
  ok: boolean;
  url: string;
  outcome: string;   // e.g. "webhook.ok"
  hint?: string;     // human-readable description
}

interface WebhookResult {
  url: string;
  updatedAt?: number;           // milliseconds timestamp
  verification?: WebhookVerificationResult;
  raw?: JsonObject;
}
```

The system automatically sends a verification request to your URL after saving. You get the result immediately without calling a separate test endpoint.

## Example

```ts
const result = await bot.setWebhook(
  "https://your-domain.example/webhook",
  "your-secret-token",
);

if (result?.verification?.ok) {
  console.log("✅ Webhook registered:", result.url);
} else {
  console.error("❌ Verification failed:", result?.verification?.hint);
}
```

## Webhook server example

```ts
import { createServer } from "node:http";
import { Bot } from "zalo-bot-js";

const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN! });
const secretToken = process.env.ZALO_WEBHOOK_SECRET!;

// Register webhook and verify
const result = await bot.setWebhook(
  process.env.ZALO_WEBHOOK_URL!,
  secretToken,
);
console.log("Verification:", result?.verification?.outcome);

const server = createServer(async (req, res) => {
  if (req.headers["x-bot-api-secret-token"] !== secretToken) {
    res.statusCode = 403;
    res.end("unauthorized");
    return;
  }

  let body = "";
  for await (const chunk of req) {
    body += chunk;
  }

  const payload = JSON.parse(body);
  await bot.processUpdate(payload);

  res.statusCode = 200;
  res.end("ok");
});

server.listen(3000);
```

## Compatibility alias

The SDK still keeps this alias:

```ts
await bot.setWebHook(url, { secret_token: secretToken });
```

If you are starting a new project, prefer `setWebhook()`.

## Practical notes

- `url` must be a public HTTPS URL that Zalo can reach
- the webhook URL is saved even if verification fails — you can re-test later with `getWebhookInfo()`
- always validate `X-Bot-Api-Secret-Token` header in your server
- when using webhook, you typically do not need to run polling at the same time

## Next

- See [getWebhookInfo](./get-webhook-info.md) to inspect the current webhook config.
- See [deleteWebhook](./delete-webhook.md) to remove the current webhook.
- See [processUpdate](./process-update.md) to handle incoming webhook payloads.

Last updated: April 5, 2026
