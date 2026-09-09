# setWebhook

Trang này mô tả hàm `setWebhook()` trong `zalo-bot-js`, dùng để đăng ký URL webhook để Zalo gửi update tới ứng dụng của bạn.

Nếu bạn đang chuyển bot sang mô hình production hoặc muốn nhận update theo kiểu push thay vì polling, đây là hàm cần dùng.

## Chữ ký hàm

```ts
setWebhook(url: string, secretToken: string, options?: WebhookOptions): Promise<WebhookResult | undefined>
```

## Khi nào nên dùng

- triển khai bot bằng webhook
- nhận update theo thời gian thực
- bảo vệ endpoint bằng secret token
- kiểm tra trạng thái verification ngay sau khi đăng ký

## Tham số

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `url` | `string` | Có | URL public HTTPS để nhận webhook |
| `secretToken` | `string` | Có | Secret key (8–256 ký tự) gửi trong header `X-Bot-Api-Secret-Token` |
| `options` | `WebhookOptions` | Không | Tùy chọn: `dropPendingUpdates`, `requestOptions` |

> ⚠️ URL phải có thể truy cập được từ internet công khai. Các địa chỉ như `localhost`, `127.0.0.1`, IP nội bộ (`192.168.x.x`, `10.x.x.x`) sẽ bị từ chối. Nếu đang phát triển local, hãy dùng tunnel như ngrok hoặc Cloudflare Tunnel.

## Giá trị trả về

Hàm trả về `Promise<WebhookResult | undefined>`.

```ts
interface WebhookVerificationResult {
  ok: boolean;
  url: string;
  outcome: string;   // ví dụ "webhook.ok"
  hint?: string;     // mô tả chi tiết
}

interface WebhookResult {
  url: string;
  updatedAt?: number;           // timestamp ms
  verification?: WebhookVerificationResult;
  raw?: JsonObject;
}
```

Hệ thống tự động gửi request xác thực tới URL của bạn sau khi lưu. Bạn nhận được kết quả ngay lập tức mà không cần gọi API riêng.

## Ví dụ tối thiểu

```ts
const result = await bot.setWebhook(
  "https://your-domain.example/webhook",
  "your-secret-token",
);

if (result?.verification?.ok) {
  console.log("✅ Webhook hoạt động:", result.url);
} else {
  console.error("❌ Verification thất bại:", result?.verification?.hint);
}
```

## Ví dụ kết hợp với server webhook

```ts
import { createServer } from "node:http";
import { Bot } from "zalo-bot-js";

const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN! });
const secretToken = process.env.ZALO_WEBHOOK_SECRET!;

// Đăng ký webhook
const result = await bot.setWebhook(
  process.env.ZALO_WEBHOOK_URL!,
  secretToken,
);
console.log("Kết quả xác thực:", result?.verification?.outcome);

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

## Alias tương thích

SDK vẫn giữ alias:

```ts
await bot.setWebHook(url, { secret_token: secretToken });
```

Nếu bắt đầu project mới, nên ưu tiên dùng `setWebhook()`.

## Lưu ý thực tế

- `url` phải là public URL mà Zalo có thể gọi tới
- webhook URL vẫn được lưu ngay cả khi verification thất bại — có thể gọi lại `getWebhookInfo()` để test sau
- luôn kiểm tra header `X-Bot-Api-Secret-Token` trong server của bạn
- khi đã dùng webhook, thường không cần chạy polling song song

## Kế tiếp

- Xem [getWebhookInfo](./get-webhook-info.md) để kiểm tra cấu hình webhook.
- Xem [deleteWebhook](./delete-webhook.md) nếu bạn muốn gỡ webhook hiện tại.
- Xem [processUpdate](./process-update.md) để xử lý payload nhận được từ webhook.

Cập nhật lần cuối: 05/04/2026
