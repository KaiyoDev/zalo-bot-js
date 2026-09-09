# testWebhook

Trang này mô tả hàm `testWebhook()` trong `zalo-bot-js`, dùng để kiểm tra ngay lập tức xem Webhook URL hiện tại của Bot có nhận được request từ Zalo hay không.

Sử dụng hàm này sau khi gọi `setWebhook()` hoặc bất kỳ lúc nào nghi ngờ bot không nhận được sự kiện, trước khi liên hệ hỗ trợ.

## Chữ ký hàm

```ts
testWebhook(): Promise<TestWebhookResult | undefined>
```

## Khi nào nên dùng

- chẩn đoán lỗi webhook delivery
- xác minh webhook URL sau khi deploy
- kiểm tra endpoint có truy cập được từ hạ tầng Zalo hay không
- tránh liên hệ support cho vấn đề webhook

## Giá trị trả về

Hàm trả về `Promise<TestWebhookResult | undefined>`.

```ts
interface TestWebhookResult {
  ok: boolean;             // true nếu gọi API thành công
  url: string;             // webhook URL đang được kiểm tra
  outcome: string;         // mã phân loại kết quả
  hint?: string;           // thông báo chẩn đoán
}
```

## Các mã outcome

| Outcome | Ý nghĩa |
|---|---|
| `webhook.ok` | Webhook URL phản hồi thành công (2xx) |
| `webhook.http.403` | Webhook URL bị từ chối với 403 (WAF/CDN chặn) |
| `webhook.http.404` | Webhook URL trả về 404 (endpoint chưa deploy) |
| `webhook.http.5xx` | Lỗi server của bạn |
| `webhook.http.other` | Response không phải 2xx (ví dụ redirect 3xx) |
| `webhook.err.tls` | Lỗi bắt tay TLS (cert issue) |
| `webhook.err.dns` | Không thể phân giải DNS |
| `webhook.err.timeout` | Webhook URL không phản hồi trong thời gian cho phép |
| `webhook.err.conn` | Không thể kết nối từ phía Zalo |
| `webhook.err.proxy` | Lỗi proxy |
| `webhook.err.blocked` | URL trỏ đến địa chỉ bị chặn (localhost, IP nội bộ, tên miền Zalo) |
| `webhook.err.other` | Lỗi không xác định |

## Ví dụ

```ts
const result = await bot.testWebhook();

if (result?.ok && result.outcome === "webhook.ok") {
  console.log("✅ Webhook hoạt động:", result.url);
} else {
  console.error("❌ Kiểm tra webhook thất bại:", result?.outcome, result?.hint);
}
```

## Giới hạn gọi API

API này bị giới hạn số lần gọi mỗi ngày cho mỗi Bot. Khi vượt quá giới hạn, response sẽ trả về `"ok": false` kèm error code `426`.

## Lưu ý thực tế

- `result.ok` (ngoài cùng) cho biết yêu cầu gọi API có thành công hay không
- `result.outcome` cho biết webhook URL có phản hồi hợp lệ hay không
- webhook URL vẫn được lưu ngay cả khi verification thất bại — có thể gọi lại sau
- không gọi hàm này trong vòng lặp紧密; tuân thủ giới hạn rate mỗi ngày

## Kế tiếp

- Xem [setWebhook](./set-webhook.md) để đăng ký webhook.
- Xem [getWebhookInfo](./get-webhook-info.md) để kiểm tra cấu hình webhook.
- Xem [deleteWebhook](./delete-webhook.md) để gỡ webhook hiện tại.

Cập nhật lần cuối: 07/09/2026
