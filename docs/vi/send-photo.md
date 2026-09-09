# Gửi ảnh

Trang này mô tả hàm `sendPhoto()` trong `zalo-bot-js`, dùng để gửi một ảnh kèm caption đến người dùng hoặc cuộc trò chuyện.

Nếu bạn cần gửi ảnh minh họa, ảnh sản phẩm hoặc ảnh phản hồi từ bot, đây là hàm phù hợp thay cho `sendMessage()`.

## Chữ ký hàm

```ts
sendPhoto(
  chatId: string,
  caption: string,
  photo: string,
  options?: { reply_to_message_id?: string },
): Promise<Message>
```

## Khi nào nên dùng

- gửi ảnh minh họa
- gửi ảnh sản phẩm, hóa đơn hoặc tài liệu hình ảnh
- phản hồi có ảnh từ bot

## Tham số

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `chatId` | `string` | Có | ID người nhận hoặc cuộc trò chuyện |
| `caption` | `string` | Có | Chú thích đi kèm ảnh |
| `photo` | `string` | Có | URL hoặc giá trị ảnh mà Bot API chấp nhận |
| `options.reply_to_message_id` | `string` | Không | ID message cần reply |

## Giá trị trả về

Hàm trả về `Promise<Message>`.

Khi thành công, SDK parse phản hồi thành `Message` để bạn đọc tiếp các thuộc tính như `messageId`, `chat`, `photoUrl`, `raw`.

## Ví dụ tối thiểu

```ts
import { Bot } from "zalo-bot-js";

const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN! });

async function main() {
  await bot.sendPhoto(
    process.env.ZALO_CHAT_ID!,
    "Ảnh minh họa",
    "https://example.com/image.jpg",
  );
}

void main();
```

## Ví dụ dùng trong event

```ts
bot.onText(/\/photo/, async (message) => {
  await bot.sendPhoto(
    message.chat.id,
    "Đây là ảnh mẫu",
    "https://example.com/image.jpg",
    {
      reply_to_message_id: message.messageId,
    },
  );
});
```

## Dùng qua `Message.replyPhoto()`

Nếu đang xử lý một `Message`, bạn có thể gọi:

```ts
bot.on("text", async (message) => {
  await message.replyPhoto("https://example.com/image.jpg", "Xin mời xem ảnh");
});
```

## Lưu ý thực tế

- thư viện hiện hỗ trợ gửi từng ảnh một
- nếu muốn gửi nhiều ảnh, ứng dụng nên lặp `sendPhoto()` nhiều lần
- caption được truyền riêng với ảnh hiện tại

## Kế tiếp

- Xem [sendMessage](./send-message.md) nếu bạn chỉ cần gửi văn bản.
- Xem [sendSticker](./send-sticker.md) nếu bạn muốn gửi sticker.

Cập nhật lần cuối: 05/04/2026
