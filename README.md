# zalo-bot-js

SDK TypeScript cho Zalo Bot API với event listeners, long polling, webhook helpers, và log đa ngôn ngữ qua `ZALO_BOT_LANG`.

[Docs public](https://kaiyodev.github.io/zalo-bot-js) | [Tài liệu tiếng Việt](docs/vi/index.md) | [English docs](docs/en/index.md)

## Tổng quan

`zalo-bot-js` cung cấp phần lõi đủ dùng để xây bot Zalo bằng Node.js:

- khởi tạo bot từ token
- lắng nghe event như `message`, `text`, `photo`, `sticker`
- nhận update bằng polling hoặc webhook
- gửi text/photo/sticker/chat action
- xử lý text bằng regex với `bot.onText(...)`
- hỗ trợ test thật bằng `.env`

## Tính năng hiện có

- `bot.on(event, callback)` với các event như `message`, `text`, `photo`, `sticker`
- `bot.onText(regexp, callback)` để bắt text theo regex
- `bot.startPolling()`, `bot.isPolling()`, `bot.processUpdate()`
- `bot.sendMessage()`, `bot.sendPhoto()`, `bot.sendSticker()`, `bot.sendChatAction()`
- `bot.setWebHook()`, `bot.deleteWebHook()`, `bot.getWebHookInfo()`
- `Bot.getMe()` và `bot.getUpdates()` để lấy thông tin bot/update

## Trạng thái hiện tại

Project hiện ổn cho các flow cơ bản, nhưng vẫn còn các phần chưa hoàn thiện:

- upload media multipart đầy đủ
- worker queue hoặc updater layer nâng cao
- adapter webhook tách riêng cho từng framework
- bộ test tự động sâu cho toàn bộ endpoint

## Quick start

### 1. Cài package

```bash
npm i zalo-bot-js
```

### 2. Tạo file `.env`

Tạo `.env`:

```env
ZALO_BOT_TOKEN=your_zalo_bot_token_here
ZALO_BOT_LANG=vi
```

`ZALO_BOT_LANG` hỗ trợ `vi` hoặc `en`. Nếu không cấu hình, project mặc định dùng tiếng Việt cho log runtime.

### 3. Viết bot đầu tiên

```ts
import "dotenv/config";
import { Bot } from "zalo-bot-js";

const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN! });

bot.on("message", async (msg) => {
  console.log("Received message:", msg.text ?? msg.messageId);
});

bot.on("text", async (msg) => {
  if (msg.text && !msg.text.startsWith("/")) {
    await bot.sendMessage(msg.chat.id, `Bạn vừa nói: ${msg.text}`);
  }
});

bot.onText(/\/start (.+)/, async (msg, match) => {
  await bot.sendMessage(msg.chat.id, `Bạn vừa gửi: ${match[1]}`);
});

void bot.startPolling();
```

### 4. Webhook cơ bản

```ts
import "dotenv/config";
import express from "express";
import { Bot } from "zalo-bot-js";

const app = express();
const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN! });
const secretToken = process.env.ZALO_WEBHOOK_SECRET!;

app.use(express.json());

bot.on("message", async (msg) => {
  await bot.sendMessage(msg.chat.id, "Xin chao!");
});

app.post("/webhook", async (req, res) => {
  if (req.headers["x-bot-api-secret-token"] !== secretToken) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  await bot.processUpdate(req.body);
  res.sendStatus(200);
});

await bot.setWebHook(process.env.ZALO_WEBHOOK_URL!, {
  secret_token: secretToken,
});
```

### 5. Chạy trên source repo

Nếu bạn đang làm việc trực tiếp trong repo:

```bash
npm run test:token
npm run test:hello-bot
```

## Cấu trúc chính

- `src/request`: HTTP transport và API error mapping
- `src/models`: `User`, `Chat`, `Message`, `Update`, `WebhookInfo`
- `src/core`: `Bot`, `Application`, `ApplicationBuilder`, `CallbackContext`
- `src/handlers`: command và message handlers
- `src/filters`: composable filters
- `src/i18n`: runtime messages và helper đổi ngôn ngữ log theo `ZALO_BOT_LANG`
- `examples`: ví dụ polling và webhook
- `test`: script thử token và bot thật bằng `.env`

## Tài liệu

- Docs public: [kaiyodev.github.io/zalo-bot-js](https://kaiyodev.github.io/zalo-bot-js)
- Tiếng Việt: [docs/vi/index.md](docs/vi/index.md)
- English: [docs/en/index.md](docs/en/index.md)

## Scripts

- `npm run build`: build thư viện TypeScript
- `npm run check`: type-check không emit
- `npm run test:token`: đọc token từ `.env` và gọi `getMe()`
- `npm run test:hello-bot`: chạy bot polling để test `/start` và `hello`
- `npm run docs:dev`: chạy docs local bằng VitePress
- `npm run docs:build`: build static docs cho GitHub Pages
- `npm run docs:preview`: preview docs đã build
- `npm test`: chạy check, build và smoke test

## Phát triển tiếp

- hoàn thiện message/media payload handling
- mở rộng webhook integration thực dụng hơn
- chuẩn hóa thêm lỗi runtime và instrumentation
- tăng độ phủ tài liệu và test tự động

## English summary

`zalo-bot-js` is a TypeScript SDK for the Zalo Bot API with a practical node-style bot core: token validation, event listeners, long polling, webhook helpers, env-driven test scripts, and bilingual documentation. See [English docs](docs/en/index.md) for full usage and architecture notes.