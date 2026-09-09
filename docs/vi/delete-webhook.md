# deleteWebhook

Trang này mô tả hàm `deleteWebhook()` trong `zalo-bot-js`, dùng để xóa cấu hình webhook hiện tại của bot.

Hàm này hữu ích khi bạn muốn chuyển bot từ webhook sang polling hoặc reset cấu hình triển khai.

## Chữ ký hàm

```ts
deleteWebhook(options?: WebhookOptions): Promise<boolean>
```

## Khi nào nên dùng

- chuyển từ webhook sang polling
- xóa webhook cũ trước khi cấu hình lại
- kiểm thử hoặc reset trạng thái bot

## Giá trị trả về

Hàm trả về `Promise<boolean>`.

## Ví dụ

```ts
await bot.deleteWebhook();
```

## Alias tương thích

SDK vẫn giữ alias:

```ts
await bot.deleteWebHook();
```

Nếu bắt đầu project mới, nên ưu tiên dùng `deleteWebhook()`.

## Lưu ý thực tế

- sau khi xóa webhook, bạn có thể chuyển sang `startPolling()`
- nên kiểm tra lại bằng `getWebhookInfo()` nếu cần xác nhận trạng thái

## Kế tiếp

- Xem [setWebhook](./set-webhook.md) để đăng ký lại webhook.
- Xem [startPolling](./start-polling.md) nếu bạn muốn chạy bot bằng polling.

Cập nhật lần cuối: 05/04/2026
