# initialize

Trang này mô tả hàm `initialize()` trong `zalo-bot-js`, dùng để khởi tạo transport nội bộ và xác minh token bot trước khi hệ thống bắt đầu xử lý chính thức.

Đây là hàm phù hợp khi bạn muốn kiểm soát vòng đời ứng dụng rõ ràng hơn thay vì để SDK tự khởi tạo ngầm trong quá trình polling.

## Chữ ký hàm

```ts
initialize(): Promise<void>
```

## Hàm này làm gì

Khi được gọi, SDK sẽ:

1. khởi tạo các transport nội bộ
2. gọi `getMe()` để xác minh token
3. lưu trạng thái initialized để tránh khởi tạo lặp

## Khi nào nên dùng

- muốn fail sớm nếu token sai
- muốn khởi tạo bot có kiểm soát trước khi chạy server hoặc worker
- muốn tách bước boot system và bước bắt đầu xử lý update

## Ví dụ

```ts
import { Bot } from "zalo-bot-js";

const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN! });

async function main() {
  await bot.initialize();
  console.log("Bot is ready");
}

void main();
```

## Quan hệ với `getMe()`

`initialize()` sử dụng `getMe()` nội bộ để xác minh token. Nếu `getMe()` không thành công, `initialize()` cũng sẽ thất bại.

## Lưu ý thực tế

- nếu đang dùng `startPolling()`, SDK sẽ tự gọi `initialize()`
- nếu bạn xây lifecycle rõ ràng, nên ghép `initialize()` với [shutdown](./shutdown.md)

## Kế tiếp

- Xem [shutdown](./shutdown.md) để đóng transport khi ứng dụng dừng.
- Xem [getMe](./get-me.md) để hiểu bước xác minh token diễn ra ra sao.

Cập nhật lần cuối: 05/04/2026
