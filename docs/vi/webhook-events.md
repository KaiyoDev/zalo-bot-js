# Sự kiện Webhook Zalo

Trang này tài liệu hóa cấu trúc sự kiện webhook mà Zalo gửi đến URL webhook của bot bạn.

## Tổng quan

Khi người dùng tương tác với bot, Zalo gửi request HTTP POST đến URL webhook của bạn với payload JSON.

## Thông tin Request

| Thuộc tính | Giá trị |
|---|---|
| URL | URL webhook đã cấu hình |
| Method | POST |
| Content-Type | application/json |
| Headers | `X-Bot-Api-Secret-Token: <secret-token-cua-ban>` |

> ⚠️ Luôn xác thực header `X-Bot-Api-Secret-Token` trước khi xử lý request để đảm bảo đến từ Zalo.

## Cấu trúc Payload

```json
{
  "ok": true,
  "result": {
    "event_name": "message.text.received",
    "message": {
      "from": { ... },
      "chat": { ... },
      "text": "...",
      "message_id": "...",
      "date": 1750316131602
    }
  }
}
```

## Các loại sự kiện

| `event_name` | Mô tả |
|---|---|
| `message.text.received` | Nhận tin nhắn văn bản |
| `message.image.received` | Nhận tin nhắn hình ảnh |
| `message.sticker.received` | Nhận tin nhắn sticker |
| `message.voice.received` | Nhận tin nhắn thoại |
| `message.unsupported.received` | Loại tin nhắn chưa hỗ trợ xử lý |

## Các trường trong Message

### `from` (object)

Thông tin người gửi:

| Trường | Kiểu | Mô tả |
|---|---|---|
| `id` | string | ID người dùng |
| `display_name` | string | Tên hiển thị |
| `is_bot` | boolean | Có phải bot không |

### `chat` (object)

Thông tin cuộc trò chuyện:

| Trường | Kiểu | Mô tả |
|---|---|---|
| `id` | string | ID chat |
| `chat_type` | string | `PRIVATE` hoặc `GROUP` |

### Các trường nội dung tin nhắn

| Trường | Kiểu | Mô tả |
|---|---|---|
| `text` | string | Nội dung văn bản |
| `photo` | string | URL ảnh |
| `caption` | string | Caption (với ảnh) |
| `sticker` | string | ID sticker |
| `voice_url` | string | URL audio (voice messages, định dạng `.aac`) |
| `message_id` | string | ID tin nhắn duy nhất |
| `date` | number | Timestamp (ms) |

## Ví dụ các loại tin nhắn

### Tin nhắn văn bản

```json
{
  "ok": true,
  "result": {
    "event_name": "message.text.received",
    "message": {
      "from": { "id": "user-id", "display_name": "Ted", "is_bot": false },
      "chat": { "id": "chat-id", "chat_type": "PRIVATE" },
      "text": "Xin chào",
      "message_id": "msg-id",
      "date": 1750316131602
    }
  }
}
```

### Tin nhắn ảnh

```json
{
  "ok": true,
  "result": {
    "event_name": "message.image.received",
    "message": {
      "from": { "id": "user-id", "display_name": "Ted", "is_bot": false },
      "chat": { "id": "chat-id", "chat_type": "PRIVATE" },
      "photo": "https://example.com/image.jpg",
      "caption": "Caption ảnh",
      "message_id": "msg-id",
      "date": 1750316131602
    }
  }
}
```

### Tin nhắn thoại

```json
{
  "ok": true,
  "result": {
    "event_name": "message.voice.received",
    "message": {
      "from": { "id": "user-id", "display_name": "Ted", "is_bot": false },
      "chat": { "id": "chat-id", "chat_type": "PRIVATE" },
      "voice_url": "https://example.com/audio.aac",
      "message_id": "msg-id",
      "date": 1750316131602
    }
  }
}
```

## Lưu ý quan trọng

- **Tin nhắn không hỗ trợ**: Với một số nhóm người dùng đặc biệt (trẻ em, người khuyết tật, người không biết chữ), hệ thống gửi `message.unsupported.received` thay vì nội dung thực để tuân thủ quy định pháp luật.
- **Tin nhắn thoại**: Chỉ hỗ trợ định dạng `.aac`. Chỉ gửi được trong chat 1-1, không hỗ trợ nhóm.
- **Rate limiting**: API `testWebhook()` bị giới hạn số lần gọi mỗi ngày cho mỗi bot.

## Gỡ lỗi

Nếu không nhận được sự kiện:

1. Gọi `bot.testWebhook()` để chẩn đoán vấn đề kết nối
2. Kiểm tra URL webhook có truy cập được công khai không (không phải localhost hay IP nội bộ)
3. Xác thực header `X-Bot-Api-Secret-Token` khớp với secret đã cấu hình
4. Đảm bảo server trả về `200 OK` nhanh chóng

## Kế tiếp

- Xem [setWebhook](./set-webhook.md) để cấu hình URL webhook.
- Xem [processUpdate](./process-update.md) để xử lý payload webhook.
- Xem [testWebhook](./test-webhook.md) để chẩn đoán sự cố webhook.

Cập nhật lần cuối: 11/08/2026
