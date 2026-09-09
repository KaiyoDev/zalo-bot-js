# getMe

Trang này mô tả hàm `getMe()` trong `zalo-bot-js`, dùng để lấy thông tin bot hiện tại và xác minh token đang hoạt động hợp lệ.

Đây là hàm nên gọi sớm khi khởi động ứng dụng hoặc khi bạn muốn kiểm tra nhanh cấu hình môi trường.

## Chữ ký hàm

```ts
getMe(options?: RequestOptions): Promise<User>
```

## Khi nào nên dùng

- kiểm tra token lúc khởi động
- xác nhận bot có thể gọi API thành công
- lấy thông tin hồ sơ bot để hiển thị hoặc debug

## Giá trị trả về

Hàm trả về `Promise<User>`.

Khi thành công, bạn nhận được một instance `User` đã được parse từ phản hồi API.

## Ví dụ tối thiểu

```ts
import { Bot } from "zalo-bot-js";

const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN! });

async function main() {
  const me = await bot.getMe();
  console.log(me);
}

void main();
```

## Quan hệ với `initialize()`

Trong nội bộ SDK, `initialize()` sẽ gọi `getMe()` để xác minh token. Điều đó có nghĩa là:

- nếu bạn đã gọi `initialize()`, bot đã được kiểm tra token
- nếu bạn chỉ muốn xác minh nhanh cấu hình, `getMe()` là đủ

## Dữ liệu trả về thường dùng

Tùy payload từ API, object `User` thường được dùng để đọc:

- ID bot
- tên hiển thị
- dữ liệu raw nếu cần debug

## Xử lý lỗi

Các lỗi thường gặp:

- token không hợp lệ
- phản hồi API không parse được thành `User`
- lỗi mạng hoặc timeout

Ví dụ:

```ts
import { Bot, InvalidToken, NetworkError } from "zalo-bot-js";

try {
  const me = await bot.getMe();
  console.log(me);
} catch (error) {
  if (error instanceof InvalidToken) {
    console.error("Token bot không hợp lệ");
  } else if (error instanceof NetworkError) {
    console.error("Không thể kết nối tới Bot API");
  } else {
    console.error(error);
  }
}
```

## Lưu ý thực tế

- đây là hàm phù hợp nhất để smoke test token
- nên dùng trước khi bật polling nếu bạn muốn fail sớm khi cấu hình sai
- trong production, có thể gọi một lần lúc boot rồi dùng `cachedUser` nếu cần đọc lại thông tin bot

## Kế tiếp

- Xem [getUpdates](./get-updates.md) nếu bạn muốn đọc update thủ công.
- Đọc [startPolling](./start-polling.md) nếu bạn muốn để SDK tự nhận update liên tục.

Cập nhật lần cuối: 05/04/2026
