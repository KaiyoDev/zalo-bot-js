# Ví dụ và test

Trang này tập trung vào các mẫu chạy bot thực tế trong repo, bao gồm polling để phát triển nhanh ở local và webhook để triển khai theo mô hình nhận update qua HTTPS.

Nếu bạn muốn có một bot mẫu chạy được ngay với lệnh sẵn như `/start`, `/ping`, `/help` và phản hồi `hello`, hãy bắt đầu từ các file trong `examples/`.

## Mẫu bot polling có lệnh sẵn

File tham chiếu: `examples/polling.ts`

Mẫu này phù hợp khi:

- bạn đang phát triển local
- bạn chưa có webhook URL
- bạn muốn test nhanh event `message`, `text` và `onText`

Bot mẫu hiện có sẵn:

- `hello`: bot phản hồi lời chào
- `/start`: bot giới thiệu ngắn
- `/ping`: bot trả về `pong`
- `/help`: bot liệt kê các lệnh sẵn có

Chạy:

```bash
npm run test:hello-bot
```

Hoặc nếu bạn muốn tự sửa file example rồi chạy theo logic riêng, có thể build và chạy file tương ứng sau khi compile project.

## Mẫu bot webhook có lệnh sẵn

File tham chiếu: `examples/webhook.ts`

Mẫu này phù hợp khi:

- bạn đã có domain HTTPS hoặc URL public
- bạn muốn nhận update theo kiểu push thay vì polling
- bạn đang chuẩn bị triển khai bot dài hạn

Bot webhook mẫu hiện có sẵn:

- `hello`: phản hồi text cơ bản
- `/start`: xác nhận bot đã nhận command qua webhook
- `/ping`: trả về `pong tu webhook`
- `/help`: hiển thị danh sách lệnh thử

## Khi nào nên chọn polling hay webhook

Chọn polling khi:

- bạn đang làm local
- bạn cần debug nhanh
- bạn chưa có hạ tầng public

Chọn webhook khi:

- bạn đã có HTTPS public
- bạn muốn nhận update ổn định theo production flow
- bạn cần tích hợp với server hoặc workflow lâu dài

## Hướng dẫn chạy webhook từng bước

### Bước 1: Tạo Bot

Để tạo Zalo Bot, vui lòng làm theo hướng dẫn trong trang [Bắt đầu nhanh](./getting-started.md). Sau khi tạo bot, bạn sẽ có thông tin `ZALO_BOT_TOKEN` để tích hợp API.

### Bước 2: Thiết lập Webhook

Bạn cần có một server chạy với domain HTTPS để đăng ký webhook nhận sự kiện. Có thể dùng:

- Ngrok cho môi trường local: `ngrok http 3000`
- Render, Railway, Vercel hoặc hạ tầng khác có hỗ trợ HTTPS

Sau khi có URL public, hãy chuẩn bị `.env`:

```dotenv
ZALO_BOT_TOKEN=your_zalo_bot_token_here
ZALO_WEBHOOK_URL=https://your-public-domain.example/webhook
ZALO_WEBHOOK_SECRET=replace-with-a-random-secret
```

### Bước 3: Chạy server webhook

File `examples/webhook.ts` mở server tại:

- `http://localhost:3000/webhook`

Chạy app và để server lắng nghe ở cổng `3000`. Sau khi server đã chạy, mẫu này sẽ tự gọi `setWebHook()` để đăng ký URL webhook từ `ZALO_WEBHOOK_URL`.

### Bước 4: Kiểm tra secret token

Webhook mẫu kiểm tra header:

- `x-bot-api-secret-token`

Nếu header không khớp với `ZALO_WEBHOOK_SECRET`, request sẽ bị từ chối với mã `403`.

### Bước 5: Gửi tin nhắn để xác nhận flow

Sau khi webhook được đăng ký thành công, hãy gửi một trong các nội dung sau tới bot:

- `hello`
- `/start`
- `/ping`
- `/help`

Nếu bot phản hồi đúng, nghĩa là:

- webhook đã nhận update thành công
- payload đã được `processUpdate()` parse
- event listeners và text handlers đang hoạt động đúng

## Token test

File tham chiếu: `test/check-token.ts`

Chạy:

```bash
npm run test:token
```

Script này chỉ tập trung vào xác minh token và profile bot. Đây là bước nên chạy đầu tiên khi bạn vừa cấu hình `.env`.

## Hello bot test

File tham chiếu: `test/hello-bot.ts`

Chạy:

```bash
npm run test:hello-bot
```

Bot sẽ reply với:

- `/start`
- `hello`

Script này hữu ích khi bạn muốn xác nhận cùng lúc:

- token hợp lệ
- polling hoạt động
- handler match đúng
- bot gửi reply thành công

## Các script hữu ích

- `npm run build`
- `npm run check`
- `npm run test`
- `npm run docs:dev`
- `npm run docs:build`
- `npm run docs:preview`

## Gợi ý luồng làm việc

1. cấu hình `.env`
2. chạy `npm run test:token`
3. chạy `npm run test:hello-bot`
4. bắt đầu từ `examples/polling.ts` nếu bạn đang làm local
5. chuyển sang `examples/webhook.ts` khi bạn đã có HTTPS public và muốn nhận update qua webhook
