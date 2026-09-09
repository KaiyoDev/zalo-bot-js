# zalo-bot-js

![zalo-bot-js](image/zalo-bot-js.png)

`zalo-bot-js` là SDK TypeScript **không phụ thuộc thư viện bên thứ ba** dành cho Zalo Bot API, được thiết kế cho nhà phát triển Node.js muốn có một bot runtime gọn nhẹ với polling, webhook, event listeners và cấu trúc TypeScript chuẩn mực.

> 📖 [English README](./README.md) · [Tài liệu tiếng Việt](https://kaiyodev.github.io/zalo-bot-js/vi/) · [English Docs](https://kaiyodev.github.io/zalo-bot-js/en/)

---

## Tính năng chính

| Tính năng | Chi tiết |
|---|---|
| **Zero dependencies** | Không có runtime dependency — chỉ cần Node.js 18+ |
| **Polling** | `startPolling()` với long-polling, retry policy, timeout profiles |
| **Webhook** | `setWebhook()`, `testWebhook()`, xác thực token qua header |
| **Event listeners** | `on("message" \| "text" \| "photo" \| "sticker" \| "voice" \| "command")` |
| **Regex text matching** | `onText(/pattern/, callback)` với `offText()` |
| **Command handler** | `bot.command("/name", callback)` — case-insensitive, parse args tự động |
| **Handler-based API** | `ApplicationBuilder` + `CommandHandler` + `MessageHandler` + `filters` |
| **Gửi tin nhắn** | `sendMessage`, `sendPhoto`, `sendSticker`, `sendVoice`, `sendPhotos` (multi) |
| **Quản lý chat** | `banChatMember`, `promoteChatAdmin`, `setChatKeyboard`, v.v. |
| **File API** | `uploadFile`, `getFileInfo`, `getFileDownloadUrl` |
| **i18n** | Tiếng Việt (`vi`) và tiếng Anh (`en`) cho log/runtime messages |
| **Retry & Timeout** | Cấu hình được `maxAttempts`, `baseDelayMs`, `timeoutProfile`, request hooks |

---

## Cài đặt

```bash
npm i zalo-bot-js
```

### Biến môi trường

| Biến | Mục đích | Bắt buộc |
|---|---|---|
| `ZALO_BOT_TOKEN` | Bot token từ Zalo | ✅ |
| `ZALO_BOT_LANG` | Ngôn ngữ runtime (`vi` / `en`) | ❌ (mặc định: `vi`) |
| `ZALO_BOT_ADMIN_ID` | Admin ID để kiểm tra quyền | ❌ |

Tạo file `.env`:

```dotenv
ZALO_BOT_TOKEN=your_zalo_bot_token_here
ZALO_BOT_LANG=vi
ZALO_BOT_ADMIN_ID=your_zalo_account_id_here
```

---

## Bắt đầu nhanh

### Cách 1 — Event API (nhanh nhất)

```ts
import { Bot } from "zalo-bot-js";

const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN! });

bot.on("text", async (message) => {
  if (message.text && !message.text.startsWith("/")) {
    await bot.sendMessage(message.chat.id, `Bạn vừa nói: ${message.text}`);
  }
});

bot.onText(/\/start(?:\s+(.+))?/, async (message, match) => {
  const name = match[1]?.trim() ?? "bạn";
  await bot.sendMessage(message.chat.id, `Xin chào ${name}!`);
});

bot.command("ping", async (message) => {
  await bot.sendMessage(message.chat.id, "pong");
});

void bot.startPolling();
```

### Cách 2 — Handler-based API (tổ chức theo handler)

```ts
import { ApplicationBuilder, CommandHandler, MessageHandler, filters } from "zalo-bot-js";

const app = new ApplicationBuilder()
  .token(process.env.ZALO_BOT_TOKEN!)
  .build();

app.addHandler(new CommandHandler("start", async (update) => {
  await update.message?.replyText("Xin chào!");
}));

app.addHandler(new MessageHandler(filters.TEXT, async (update) => {
  const text = update.message?.text ?? "";
  if (!text.startsWith("/")) {
    await update.message?.replyText(`Bạn vừa nói: ${text}`);
  }
}));

void app.runPolling();
```

### Cách 3 — Webhook (production)

```ts
import { Bot } from "zalo-bot-js";

const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN! });

// Đăng ký webhook
await bot.setWebhook("https://your-domain.com/webhook", "my-secret-token");

// Xử lý payload từ Zalo
app.post("/webhook", async (req, res) => {
  const payload = req.body;
  await bot.processUpdate(payload);
  res.json({ ok: true });
});
```

---

## Admin

Admin là **tiện ích đọc** — SDK không quản lý lifecycle hay ghi file.

```ts
bot.on("text", async (message) => {
  if (!bot.isAdmin(message.fromUser?.id)) return; // phi admin bỏ qua
  await bot.sendMessage(message.chat.id, "Lệnh admin-only");
});
```

- `bot.getAdminId()` — trả về admin ID đã cấu hình hoặc `undefined`
- `bot.isAdmin(userId?)` — kiểm tra `userId === adminId`
- `message.admin` — `true` khi người gửi trùng admin ID

⚠️ Không có lệnh `/setadmin` tích hợp. Đặt `ZALO_BOT_ADMIN_ID` trong môi trường trước khi khởi động bot.

---

## API Surface

### Lifecycle

| Phương thức | Mô tả |
|---|---|
| `bot.initialize()` | Gọi `getMe()` để xác thực token |
| `bot.shutdown()` | Ngắt kết nối transport |
| `bot.getMe()` | Lấy thông tin bot từ Zalo API |

### Polling

| Phương thức | Mô tả |
|---|---|
| `bot.startPolling(options?)` | Bắt đầu long-polling loop |
| `bot.stopPolling()` | Dừng polling gracefully |
| `bot.isPolling()` | Trả về `true` nếu đang chạy |
| `bot.getPollingState()` | `"idle" \| "starting" \| "running" \| "stopping"` |

### Gửi tin nhắn

| Phương thức | Mô tả |
|---|---|
| `bot.sendMessage(chatId, text, opts?)` | Gửi văn bản, hỗ trợ `parse_mode` & `text_styles` |
| `bot.sendPhoto(chatId, caption, url, opts?)` | Gửi ảnh |
| `bot.sendPhotos(chatId, urls[], caption?, opts?)` | Gửi nhiều ảnh tuần tự (fallback album) |
| `bot.sendSticker(chatId, stickerId, opts?)` | Gửi sticker |
| `bot.sendVoice(chatId, voiceUrl, opts?)` | Gửi voice 1-1 (.aac) |
| `bot.sendChatAction(chatId, "typing")` | Gửi action typing |
| `bot.editMessageText(chatId, messageId, text)` | Sửa tin nhắn |
| `bot.deleteMessage(chatId, messageId)` | Xóa tin nhắn |
| `bot.pinMessage(chatId, messageId)` | Ghim tin nhắn |

### Webhook

| Phương thức | Mô tả |
|---|---|
| `bot.setWebhook(url, secretToken, opts?)` | Đăng ký webhook, trả về `WebhookResult` |
| `bot.deleteWebhook(opts?)` | Huỷ webhook |
| `bot.getWebhookInfo(opts?)` | Lấy thông tin webhook hiện tại |
| `bot.testWebhook(opts?)` | Kiểm tra webhook có reach được không |

### Event Listeners

```ts
bot.on("message", cb)       // mọi tin nhắn
bot.on("text", cb)          // tin nhắn text
bot.on("photo", cb)         // tin nhắn ảnh
bot.on("sticker", cb)       // tin nhắn sticker
bot.on("voice", cb)         // tin nhắn giọng nói
bot.on("command", cb)       // tin nhắn có command

bot.once(event, cb)         // chỉ chạy 1 lần
bot.off(event, cb)          // xoá listener

bot.onText(regex, cb)       // regex match trên text
bot.offText(regex, cb)      // xoá text listener

bot.command("/name", cb)    // command handler
bot.onError(handler)        // global error handler
```

### Handler-based API

```ts
ApplicationBuilder  // builder pattern tạo Application
  .token(token)
  .baseUrl(url)
  .build()          // → Application

filters.TEXT   // có text
filters.COMMAND // có command
filters.PHOTO  // có ảnh
filters.STICKER // có sticker
filters.ALL    // mọi update

// Chaining
filters.TEXT.and(filters.NOT_COMMAND)
filters.PHOTO.or(filters.STICKER)
```

### Message Helpers

```ts
message.replyText(text)
message.replyPhoto(photoUrl, caption?)
message.replySticker(stickerId)
message.replyAction(action)
message.replyVoice(voiceUrl)
```

---

## Models

| Model | Thuộc tính chính |
|---|---|
| `Message` | `messageId`, `date`, `chat.id`, `chat.type`, `text`, `photoUrl`, `sticker`, `voiceUrl`, `fromUser`, `admin` |
| `Update` | `updateId`, `message`, `command`, `eventTypes`, `hasEventType()`, `effectiveUser` |
| `User` | `id`, `displayName`, `accountName`, `isBot`, `canJoinGroups` |
| `Chat` | `id`, `type` |
| `WebhookInfo` | `url`, `updatedAt` |

---

## Transport & Resilience

- **Retry policy**: `maxAttempts`, `baseDelayMs`, `maxDelayMs`, `jitterRatio`, `retryOn`
- **Timeout profiles**: `short`, `standard`, `long_poll`
- **Request hooks**: `beforeRequest`, `afterResponse`
- **AbortController**: huỷ polling loop đang chạy giữa chừng

---

## Xử lý lỗi

SDK throw các lỗi kế thừa từ `ZaloError`:

| Error | Ý nghĩa |
|---|---|
| `InvalidToken` | Token không hợp lệ |
| `NetworkError` | Lỗi mạng / fetch thất bại |
| `TimedOut` | Request hết timeout |
| `BadRequest` | API trả 400 |
| `Forbidden` | API trả 403 |
| `Conflict` | Xung đột (webhook đang tồn tại) |
| `RetryAfter` | Cần retry sau N giây |
| `ZaloError` | Lỗi chung từ Zalo API |

---

## Kiểm tra cục bộ

```bash
npm run check        # TypeScript type check
npm run build        # compile ra dist/
npm run smoke        # kiểm tra exports
npm test             # full test suite
npm run test:bot-api # integration test với API thực
```

Script test cần token thật:

```bash
node --env-file=.env ./dist/test/check-token.js
node --env-file=.env ./dist/test/hello-bot.js
node --env-file=.env ./dist/test/event-debug.js
```

---

## Hạn chế hiện tại

- Chưa hỗ trợ multipart media upload
- Chưa có album send native một lệnh — dùng `sendPhotos()` làm fallback
- Chưa bundle framework adapter (Express, Fastify, Hono, …)

---

## Cấu trúc dự án

```
src/
  core/         Bot, Application, ApplicationBuilder, CallbackContext
  models/       User, Chat, Message, Update, WebhookInfo
  handlers/     CommandHandler, MessageHandler
  filters/      TEXT, COMMAND, PHOTO, STICKER, ALL (+ .and/.or/.not)
  request/      BaseRequest, FetchRequest
  i18n/         Tiếng Việt / English runtime messages
  errors/       ZaloError hierarchy
examples/       polling.ts, webhook.ts
test/           các script kiểm tra
docs/           VitePress documentation (vi/ en/)
```

---

## Tài nguyên

- 📖 [Tài liệu tiếng Việt](https://kaiyodev.github.io/zalo-bot-js/vi/)
- 📖 [English Documentation](https://kaiyodev.github.io/zalo-bot-js/en/)
- 📋 [API Reference (Vi)](https://kaiyodev.github.io/zalo-bot-js/vi/api-reference)
- 📋 [API Reference (En)](https://kaiyodev.github.io/zalo-bot-js/en/api-reference)
- 💻 [GitHub Repository](https://github.com/KaiyoDev/zalo-bot-js)

---

## Giấy phép

MIT License. Xem [LICENSE](./LICENSE) để biết thêm chi tiết.
