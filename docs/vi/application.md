# Application

Trang này mô tả `Application` trong `zalo-bot-js`, lớp điều phối theo kiểu handler-based dùng cùng `ApplicationBuilder`, `CommandHandler` và `MessageHandler`.

Khác với API event listener trên `Bot`, `Application` cho phép bạn thêm danh sách handler và để app chọn handler đầu tiên phù hợp cho mỗi update.

## Vai trò

`Application` giữ:

- một `bot`
- danh sách `handlers`
- logic dispatch update tới handler đầu tiên khớp

## Các hàm chính

### `addHandler(handler): void`

Thêm một handler vào danh sách xử lý.

### `processUpdate(update): Promise<void>`

Duyệt qua các handler theo thứ tự, chạy handler đầu tiên có `checkUpdate(update)` trả về `true`.

### `runPolling(options?): Promise<void>`

Chạy polling thông qua `bot.startPolling()` và chuyển từng update vào `Application.processUpdate()`.

### `stop(): void`

Dừng polling hiện tại bằng cách gọi `bot.stopPolling()`.

## Ví dụ

```ts
import { ApplicationBuilder, CommandHandler } from "zalo-bot-js";

const app = new ApplicationBuilder()
  .token(process.env.ZALO_BOT_TOKEN!)
  .build();

app.addHandler(new CommandHandler("start", async (update) => {
  await update.message?.replyText("Xin chào!");
}));

void app.runPolling();
```

## Khi nào nên dùng

- muốn tổ chức bot bằng handler
- muốn áp dụng filter và command parser rõ ràng
- muốn điều phối update theo thứ tự handler

## Kế tiếp

- Xem [ApplicationBuilder](./application-builder.md) để khởi tạo app.
- Xem [MessageHandler](./message-handler.md) và [CommandHandler](./command-handler.md) để thêm handler cụ thể.

Cập nhật lần cuối: 05/04/2026
