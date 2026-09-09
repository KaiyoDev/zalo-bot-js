# Gửi tin nhắn thoại

Trang này mô tả hàm `sendVoice()` trong `zalo-bot-js`, dùng để gửi tin nhắn thoại (tệp âm thanh `.aac`) đến người dùng trong cuộc trò chuyện 1-1.

> ⚠️ **Giới hạn:** API này chỉ hỗ trợ gửi tin nhắn thoại vào **trò chuyện 1-1**. Không hỗ trợ gửi vào nhóm. Nếu truyền `chat_id` của nhóm, yêu cầu có thể trả về thành công nhưng tin nhắn sẽ không được gửi.

## Chữ ký hàm

```ts
sendVoice(
  chatId: string,
  voiceUrl: string,
  options?: SendVoiceOptions,
): Promise<Message>
```

## Khi nào nên dùng

- gửi tin nhắn âm thanh/voice đến người dùng
- phản hồi bằng tệp âm thanh từ server của bạn
- cung cấp nội dung giọng nói trong cuộc trò chuyện 1-1

## Tham số

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `chatId` | `string` | Có | ID người nhận (chỉ 1-1) |
| `voiceUrl` | `string` | Có | URL tệp âm thanh (phải định dạng `.aac`) |
| `options.reply_to_message_id` | `string` | Không | ID tin nhắn cần reply |
| `options.requestOptions` | `RequestOptions` | Không | Tuỳ chọn request nâng cao |

## Yêu cầu định dạng

- Định dạng tệp: **.aac** audio
- Không có caption hoặc text đi kèm
- URL phải truy cập được từ internet

## Giá trị trả về

Hàm trả về `Promise<Message>`.

## Ví dụ

```ts
import { Bot } from "zalo-bot-js";

const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN! });

await bot.sendVoice("user-chat-id", "https://example.com/audio.aac");
```

## Ví dụ reply tin nhắn thoại

```ts
bot.on("text", async (message) => {
  await bot.sendVoice(
    message.chat.id,
    "https://example.com/response.aac",
    {
      reply_to_message_id: message.messageId,
    },
  );
});
```

## Lưu ý thực tế

- `sendVoice()` chỉ hoạt động trong cuộc trò chuyện 1-1
- truyền `chat_id` của nhóm có thể trả về thành công nhưng tin nhắn sẽ không được gửi
- tệp âm thanh phải ở định dạng `.aac`
- `voice_url` phải là URL HTTPS hợp lệ, truy cập được công khai

## Kế tiếp

- Đọc [sendMessage](./send-message.md) để gửi tin nhắn văn bản.
- Xem [sendPhoto](./send-photo.md) để gửi ảnh.
- Xem [sendSticker](./send-sticker.md) để gửi sticker.

Cập nhật lần cuối: 07/09/2026
