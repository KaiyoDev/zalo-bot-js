# CommandHandler

Trang này mô tả `CommandHandler` trong `zalo-bot-js`, handler dùng để bắt command theo cú pháp như `/start`.

`CommandHandler` thuộc phong cách handler-based và thường dùng cùng `Application`.

## Cách hoạt động

Handler này:

1. đọc `update.message?.text`
2. tách từ đầu tiên theo khoảng trắng
3. so sánh với `/${command}`
4. nếu khớp, gọi callback với `CallbackContext`

## Ví dụ

```ts
import { ApplicationBuilder, CommandHandler } from "zalo-bot-js";

const app = new ApplicationBuilder()
  .token(process.env.ZALO_BOT_TOKEN!)
  .build();

app.addHandler(new CommandHandler("start", async (update, ctx) => {
  await update.message?.replyText(`Xin chào ${ctx.args[0] ?? "bạn"}!`);
}));

void app.runPolling();
```

## `CallbackContext`

Trong callback, `ctx.args` chứa các tham số sau command.

Ví dụ với text:

```text
/start abc
```

thì `ctx.args` sẽ là:

```ts
["abc"]
```

## Khi nào nên dùng

- bạn muốn bắt command rõ ràng theo cú pháp `/name`
- bạn đang dùng `Application` thay vì `bot.onText()`

## Kế tiếp

- Xem [MessageHandler](./message-handler.md) để xử lý theo filter.
- Xem [CallbackContext](./callback-context.md) để hiểu dữ liệu callback nhận được.

Cập nhật lần cuối: 05/04/2026
