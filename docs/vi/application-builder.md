# ApplicationBuilder

Trang này mô tả `ApplicationBuilder` trong `zalo-bot-js`, dùng để cấu hình và tạo `Application` theo phong cách builder.

Đây là lựa chọn phù hợp nếu bạn muốn tổ chức bot theo kiểu handler-based thay vì event listener thuần với `Bot`.

## Vai trò

`ApplicationBuilder` giúp bạn:

- đặt token
- đặt `baseUrl` nếu cần
- tạo `Application` hoàn chỉnh bằng `build()`

## Ví dụ

```ts
import { ApplicationBuilder } from "zalo-bot-js";

const app = new ApplicationBuilder()
  .token(process.env.ZALO_BOT_TOKEN!)
  .build();
```

## Các hàm chính

### `token(token: string): this`

Thiết lập token bot cho application.

### `baseUrl(baseUrl: string): this`

Thiết lập `baseUrl` tùy chỉnh nếu bạn không muốn dùng mặc định.

### `build(): Application`

Tạo ra instance `Application`.

Nếu chưa thiết lập token, hàm này sẽ ném lỗi.

## Khi nào nên dùng

- bạn muốn viết bot bằng `CommandHandler` và `MessageHandler`
- bạn muốn cấu trúc gần với framework bot truyền thống
- bạn muốn tách rõ phần cấu hình app và phần xử lý update

## Kế tiếp

- Xem [Application](./application.md) để biết app vận hành handler ra sao.
- Xem [CommandHandler](./command-handler.md) để bắt lệnh theo kiểu handler-based.

Cập nhật lần cuối: 05/04/2026
