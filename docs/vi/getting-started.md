# Bắt đầu nhanh

Trang này hướng dẫn bạn thiết lập môi trường, cấu hình token bot và chạy thử các flow cơ bản với `zalo-bot-js`.

Nếu bạn mới bắt đầu, hãy làm theo thứ tự: cài đặt, tạo `.env`, kiểm tra token, sau đó chạy bot thử bằng polling.

## Yêu cầu

- Node.js 18 trở lên
- một bot token hợp lệ từ Zalo Bot

## Tạo bot và lấy token

Trước khi chạy các ví dụ trong tài liệu này, bạn cần tạo bot trên trang quản lý bot và lấy token tương ứng cho môi trường của mình.

Quy trình khuyến nghị:

1. Mở trang quản lý bot bằng mã QR bên dưới.
2. Đăng nhập và tạo bot mới theo nhu cầu của bạn.
3. Sao chép bot token sau khi bot được tạo thành công.
4. Lưu token vào file `.env` trước khi chạy các script test.

![Mã QR tới trang quản lý bot](../../image/zbot-creator_qrcode.jpg)

Nếu bạn mở tài liệu trên điện thoại hoặc một màn hình khác, chỉ cần quét mã QR để đi thẳng tới trang quản lý bot.

## Cài đặt

```bash
npm install
```

## Tạo `.env`

Tạo file `.env` tại root repo:

```dotenv
ZALO_BOT_TOKEN=your_zalo_bot_token_here
ZALO_BOT_LANG=vi
ZALO_BOT_ADMIN_ID=your_zalo_account_id_here
```

`ZALO_BOT_LANG` hỗ trợ:

- `vi`: log và thông điệp runtime bằng tiếng Việt
- `en`: log và thông điệp runtime bằng tiếng Anh

Nếu không cấu hình, SDK hiện mặc định dùng `vi`.

## Chọn style API

`zalo-bot-js` hỗ trợ lâu dài hai style, và dùng chung logic parse command:

- Event API (`bot.on(...)`, `bot.command(...)`) là hướng chính cho đa số bot.
- Handler API (`ApplicationBuilder`, `CommandHandler`, `MessageHandler`) phù hợp khi team muốn routing theo handler/filter.

Do dùng parser chung, `/Start  demo` và `/start demo` sẽ match nhất quán ở cả hai style.

## Kiểm tra token

```bash
npm run test:token
```

Script này:

- đọc `.env`
- lấy `ZALO_BOT_TOKEN`
- khởi tạo `Bot`
- gọi `getMe()`
- in thông tin bot ra console theo ngôn ngữ được chọn

## Chạy bot test

```bash
npm run test:hello-bot
```

Sau đó nhắn:

- `/start`
- `hello`

để kiểm tra flow cơ bản.

Script test này dùng:

- `ApplicationBuilder` để tạo app polling
- `CommandHandler("start", ...)` cho lệnh `/start`
- `MessageHandler(...)` để phản hồi khi người dùng gửi `hello`

Đây là cách nhanh nhất để xác nhận token, polling, parsing update và reply flow đang hoạt động.

## Khởi động bot bằng code

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

## Khi nào nên dùng các script test

- `test:token`: dùng khi bạn chỉ muốn xác nhận token và profile bot
- `test:hello-bot`: dùng khi bạn muốn xác nhận cả polling và flow phản hồi message

## Lưu ý thực tế

- Long polling có thể chờ lâu nếu không có update mới
- Nếu API trả payload phản hồi mỏng, SDK hiện đã có fallback parse cho message gửi đi
- Webhook phù hợp hơn khi bạn đã có server và URL public ổn định

## Kế tiếp

- Xem [Ví dụ và test](./examples.md) nếu bạn muốn chọn giữa polling, webhook và các script xác minh.
- Đọc [Kiến trúc](./architecture.md) nếu bạn muốn hiểu cách SDK được tổ chức trước khi mở rộng thêm.

Cập nhật lần cuối: 05/04/2026
