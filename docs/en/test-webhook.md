# testWebhook

This page describes the `testWebhook()` function in `zalo-bot-js`, used to immediately verify whether the bot's current webhook URL is reachable and responding correctly from Zalo's servers.

Use this function after calling `setWebhook()` or whenever you suspect the bot is not receiving events, before contacting support.

## Function signature

```ts
testWebhook(): Promise<TestWebhookResult | undefined>
```

## When to use it

- diagnose webhook delivery issues
- verify webhook URL after deployment
- confirm endpoint is reachable from Zalo's infrastructure
- avoid contact support for webhook problems

## Return value

Returns `Promise<TestWebhookResult | undefined>`.

```ts
interface TestWebhookResult {
  ok: boolean;             // true if API call succeeded
  url: string;             // the webhook URL being tested
  outcome: string;         // classification code
  hint?: string;           // human-readable diagnostic message
}
```

## Outcome codes

| Outcome | Meaning |
|---|---|
| `webhook.ok` | Webhook URL responded successfully (2xx) |
| `webhook.http.403` | Webhook URL rejected with 403 (WAF/CDN block) |
| `webhook.http.404` | Webhook URL returned 404 (endpoint not deployed) |
| `webhook.http.5xx` | Server error on your side |
| `webhook.http.other` | Non-2xx response (e.g., redirect 3xx) |
| `webhook.err.tls` | TLS handshake failure (cert issue) |
| `webhook.err.dns` | DNS resolution failure |
| `webhook.err.timeout` | Webhook URL did not respond in time |
| `webhook.err.conn` | Connection failure from Zalo's side |
| `webhook.err.proxy` | Proxy connection failure |
| `webhook.err.blocked` | URL points to blocked address (localhost, internal IP, Zalo domain) |
| `webhook.err.other` | Unknown error |

## Example

```ts
const result = await bot.testWebhook();

if (result?.ok && result.outcome === "webhook.ok") {
  console.log("✅ Webhook is working:", result.url);
} else {
  console.error("❌ Webhook test failed:", result?.outcome, result?.hint);
}
```

## Rate limiting

This API is rate-limited per bot per day. When the limit is exceeded, the response returns `"ok": false` with error code `426`.

## Practical notes

- `result.ok` (outer) indicates the API call succeeded
- `result.outcome` tells you whether the webhook URL responded correctly
- the webhook URL is saved even if verification fails — you can call this again later
- do not call this in a tight loop; respect the daily rate limit

## Next

- See [setWebhook](./set-webhook.md) to register a webhook.
- See [getWebhookInfo](./get-webhook-info.md) to inspect the current webhook config.
- See [deleteWebhook](./delete-webhook.md) to remove the current webhook.

Last updated: September 7, 2026
