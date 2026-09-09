# processUpdate

Trang này mô tả hàm `processUpdate()` trong `zalo-bot-js`, dùng để đưa một update vào hệ xử lý event của SDK.

Đây là hàm trung tâm trong mô hình webhook: ứng dụng HTTP nhận payload, sau đó chuyển payload vào `processUpdate()` để SDK parse và phát các listener phù hợp.

## Chữ ký hàm

```ts
processUpdate(update: Update | JsonObject): Promise<void>
```

## Khi nào nên dùng

- tích hợp webhook
- nhận payload JSON từ HTTP server rồi giao cho SDK xử lý
- đẩy `Update` đã parse sẵn vào hệ event

## Hàm này làm gì

Khi được gọi, SDK sẽ:

1. tự động phát hiện format payload (webhook mới hoặc polling cũ)
2. parse payload thành `Update` nếu cần
3. bỏ qua update không có `message`
4. cập nhật `nextUpdateOffset` nếu có `updateId`
5. phát listener cho từng `eventType`
6. chạy thêm các listener đã đăng ký qua `onText()`

## Định dạng payload webhook

Zalo gửi webhook payload theo cấu trúc:

```json
{
  "ok": true,
  "result": {
    "event_name": "message.text.received",
    "message": {
      "from": {
        "id": "user-id",
        "display_name": "Tên người dùng",
        "is_bot": false
      },
      "chat": {
        "id": "chat-id",
        "chat_type": "PRIVATE"
      },
      "text": "Xin chào",
      "message_id": "msg-id",
      "date": 1750316131602
    }
  }
}
```

Các sự kiện hỗ trợ:

| `event_name` | Mô tả |
|---|---|
| `message.text.received` | Nhận tin nhắn văn bản |
| `message.image.received` | Nhận tin nhắn hình ảnh |
| `message.sticker.received` | Nhận tin nhắn sticker |
| `message.voice.received` | Nhận tin nhắn thoại |
| `message.unsupported.received` | Tin nhắn chưa hỗ trợ xử lý |

## Ví dụ tối thiểu

```ts
await bot.processUpdate(payload);
```

## Ví dụ trong webhook server

```ts
import { createServer } from "node:http";
import { Bot } from "zalo-bot-js";

const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN! });
const WEBHOOK_SECRET = process.env.ZALO_WEBHOOK_SECRET!;

bot.on("text", async (message) => {
  await bot.sendMessage(message.chat.id, "Đã nhận update từ webhook.");
});

const server = createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/webhook") {
    res.statusCode = 404;
    res.end("not found");
    return;
  }

  // Xác thực secret token
  const secretToken = req.headers["x-bot-api-secret-token"];
  if (secretToken !== WEBHOOK_SECRET) {
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

## Quan hệ với event listener

`processUpdate()` là điểm bắt đầu của:

- `on("message")`
- `on("text")`
- `on("photo")`
- `on("sticker")`
- `on("voice")`
- `on("command")`
- `onText()`

Nói cách khác, nếu không có `processUpdate()` trong webhook flow, listener sẽ không được kích hoạt.

## Dữ liệu thực tế sau khi parse

Sau khi parse, callback của bạn làm việc với object kiểu SDK như:

- `message.chat.id`
- `message.messageId`
- `message.fromUser?.id`
- `message.text`
- `message.voiceUrl` (với tin nhắn thoại)
- `metadata.update.eventTypes`

Thay vì làm việc trực tiếp với raw JSON từ Bot API.

## Lưu ý thực tế

- update không có `message` sẽ bị bỏ qua
- webhook server nên tự xử lý xác thực request trước khi gọi hàm này
- nếu bạn đang dùng polling bằng `startPolling()`, SDK sẽ tự gọi `processUpdate()` nội bộ
- SDK tự động xử lý cả format webhook mới và format polling cũ

## Kế tiếp

- Xem [setWebhook](./set-webhook.md) để cấu hình webhook.
- Xem [on](./on.md) và [onText](./on-text.md) để đăng ký listener cho update đã parse.

Cập nhật lần cuối: 11/08/2026
