# Gửi sticker

Trang này mô tả hàm `sendSticker()` trong `zalo-bot-js`, dùng để gửi sticker đến người dùng hoặc cuộc trò chuyện.

Đây là hàm phù hợp khi bot cần phản hồi ngắn gọn bằng sticker thay vì text hoặc ảnh.

## Chữ ký hàm

```ts
sendSticker(
  chatId: string,
  sticker: string,
  options?: { reply_to_message_id?: string },
): Promise<Message>
```

## Khi nào nên dùng

- phản hồi tương tác ngắn gọn
- gửi sticker xác nhận hoặc minh họa cảm xúc
- xây bot mang tính hội thoại nhẹ

## Tham số

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `chatId` | `string` | Có | ID người nhận hoặc cuộc trò chuyện |
| `sticker` | `string` | Có | ID hoặc giá trị sticker được API chấp nhận |
| `options.reply_to_message_id` | `string` | Không | ID message cần reply |

## Giá trị trả về

Hàm trả về `Promise<Message>`.

## Ví dụ tối thiểu

```ts
import { Bot } from "zalo-bot-js";

const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN! });

async function main() {
  await bot.sendSticker(process.env.ZALO_CHAT_ID!, "sticker_id_here");
}

void main();
```

## Ví dụ dùng trong event

```ts
bot.onText(/\/sticker/, async (message) => {
  await bot.sendSticker(message.chat.id, "sticker_id_here", {
    reply_to_message_id: message.messageId,
  });
});
```

## Dùng qua `Message.replySticker()`

```ts
bot.on("text", async (message) => {
  await message.replySticker("sticker_id_here");
});
```

## Lưu ý thực tế

- chỉ dùng khi bạn có dữ liệu sticker hợp lệ
- nếu luồng bot cần thông tin rõ ràng, `sendMessage()` thường phù hợp hơn

## Kế tiếp

- Xem [sendMessage](./send-message.md) để gửi văn bản.
- Xem [sendChatAction](./send-chat-action.md) để gửi trạng thái tạm thời.

Cập nhật lần cuối: 05/04/2026
