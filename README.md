# zalo-bot-js

SDK TypeScript cho Zalo Bot API với long polling, webhook helper, command/message handlers, filters và log đa ngôn ngữ qua `ZALO_BOT_LANG`.

[Docs public](https://kaiyodev.github.io/zalo-bot-js) | [Tài liệu tiếng Việt](docs/vi/index.md) | [English docs](docs/en/index.md)

## Tổng quan

`zalo-bot-js` cung cấp phần lõi đủ dùng để xây bot Zalo bằng Node.js:

- khởi tạo bot từ token
- nhận update bằng polling
- gửi text/photo/sticker/chat action
- xử lý command và text message rõ ràng
- dùng webhook khi cần tích hợp với server của bạn
- hỗ trợ test thật bằng `.env`

## Tính năng hiện có

- `Bot.getMe()` để kiểm tra token và lấy thông tin bot
- `Application.runPolling()` để nhận update bằng long polling
- `sendMessage`, `sendPhoto`, `sendSticker`, `sendChatAction`
- `setWebhook`, `deleteWebhook`, `getWebhookInfo`
- routing theo command và filter
- fallback parse cho payload phản hồi mỏng từ API

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
import {
  ApplicationBuilder,
  CommandHandler,
  MessageHandler,
  filters,
} from "zalo-bot-js";

const app = new ApplicationBuilder()
  .token(process.env.ZALO_BOT_TOKEN!)
  .build();

app.addHandler(new CommandHandler("start", async (update) => {
  await update.message?.replyText("Xin chào từ zalo-bot-js");
}));

app.addHandler(
  new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), async (update) => {
    await update.message?.replyText(`Bạn vừa nói: ${update.message?.text ?? ""}`);
  }),
);

void app.runPolling();
```

### 4. Chạy trên source repo

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

`zalo-bot-js` is a TypeScript SDK for the Zalo Bot API with a practical core: token validation, long polling, webhook helpers, handlers, filters, env-driven test scripts, and bilingual documentation. See [English docs](docs/en/index.md) for full usage and architecture notes.