# MessageHandler

Trang này mô tả `MessageHandler` trong `zalo-bot-js`, handler dùng để xử lý update dựa trên `filters`.

Đây là lựa chọn phù hợp khi bạn muốn bắt các message theo loại nội dung như text, photo hoặc sticker trong mô hình `Application`.

## Cách hoạt động

`MessageHandler` nhận:

- một `filter`
- một `callback`

Handler sẽ chạy khi:

- `update.message` tồn tại
- `filter(update)` trả về `true`

## Ví dụ

```ts
import { ApplicationBuilder, MessageHandler, filters } from "zalo-bot-js";

const app = new ApplicationBuilder()
  .token(process.env.ZALO_BOT_TOKEN!)
  .build();

app.addHandler(new MessageHandler(filters.TEXT, async (update) => {
  await update.message?.replyText("Mình đã nhận text message.");
}));

void app.runPolling();
```

## Khi nào nên dùng

- muốn xử lý theo loại message
- muốn kết hợp filter logic trong mô hình handler-based
- không muốn tự viết `checkUpdate()` cho từng trường hợp

## Kế tiếp

- Xem [filters](./filters.md) để biết các filter dựng sẵn.
- Xem [Application](./application.md) để hiểu app dispatch handler thế nào.

Cập nhật lần cuối: 05/04/2026
