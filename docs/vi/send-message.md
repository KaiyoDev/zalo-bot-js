# Gửi tin nhắn văn bản

Trang này mô tả hàm `sendMessage()` trong `zalo-bot-js`, dùng để gửi tin nhắn văn bản đến người dùng hoặc cuộc trò chuyện từ chính SDK của dự án.

Nếu bạn đang xây bot phản hồi tin nhắn, gửi thông báo từ workflow hoặc trả kết quả xử lý về cho người dùng, đây là một trong những hàm cốt lõi được dùng thường xuyên nhất.

## Chữ ký hàm

```ts
sendMessage(
  chatId: string,
  text: string,
  options?: { reply_to_message_id?: string },
): Promise<Message>
```

## Khi nào nên dùng

Bạn nên dùng `sendMessage()` khi cần:

- trả lời lại một tin nhắn vừa nhận
- gửi thông báo chủ động tới một `chat_id`
- phản hồi kết quả từ logic xử lý trong bot
- gửi nội dung từ webhook, polling hoặc workflow nội bộ

## Tham số

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `chatId` | `string` | Có | ID của người nhận hoặc cuộc trò chuyện |
| `text` | `string` | Có | Nội dung tin nhắn văn bản |
| `options.reply_to_message_id` | `string` | Không | ID tin nhắn cần reply trực tiếp |

## Giá trị trả về

Hàm trả về `Promise<Message>`.

Khi thành công, bạn nhận được một instance `Message` đã được parse từ phản hồi API, có thể dùng tiếp các thuộc tính như:

- `messageId`
- `date`
- `chat`
- `text`
- `raw`

## Ví dụ tối thiểu

```ts
import { Bot } from "zalo-bot-js";

const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN! });

async function main() {
  const chatId = process.env.ZALO_CHAT_ID!;
  const message = await bot.sendMessage(chatId, "Xin chào!");

  console.log(message.messageId);
}

void main();
```

## Ví dụ dùng trong polling

Đây là cách dùng phổ biến nhất khi bot đang chạy và cần phản hồi người dùng ngay sau khi nhận tin nhắn.

```ts
import { Bot } from "zalo-bot-js";

const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN! });

bot.on("text", async (message) => {
  if (!message.text) {
    return;
  }

  await bot.sendMessage(message.chat.id, `Bạn vừa gửi: ${message.text}`);
});

void bot.startPolling();
```

## Ví dụ reply vào một tin nhắn cụ thể

Nếu bạn muốn phản hồi gắn với một message trước đó, truyền `reply_to_message_id` qua `options`.

```ts
bot.on("text", async (message) => {
  await bot.sendMessage(
    message.chat.id,
    "Mình đã nhận được yêu cầu của bạn.",
    {
      reply_to_message_id: message.messageId,
    },
  );
});
```

## Ví dụ dùng trong webhook

Khi chạy webhook, bạn thường gọi `sendMessage()` sau khi `processUpdate()` hoặc ngay trong callback event.

```ts
import { createServer } from "node:http";
import { Bot } from "zalo-bot-js";

const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN! });

bot.on("message", async (message) => {
  await bot.sendMessage(message.chat.id, "Webhook đã nhận được tin nhắn của bạn.");
});

const server = createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/webhook") {
    res.statusCode = 404;
    res.end("not found");
    return;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }

  const payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  await bot.processUpdate(payload);

  res.statusCode = 200;
  res.end("ok");
});

server.listen(3000);
```

## Dùng qua `Message.replyText()`

Nếu bạn đã có một instance `Message`, có thể dùng helper `replyText()` để viết code ngắn gọn hơn. Về bản chất, helper này gọi lại `sendMessage()` với `chat.id` hiện tại.

```ts
bot.on("text", async (message) => {
  await message.replyText("Xin chào từ replyText()");
});
```

Khi nên dùng `replyText()`:

- callback đang xử lý đúng một `Message`
- bạn chỉ muốn trả lời ngay trong cùng cuộc trò chuyện
- bạn muốn code ngắn gọn hơn

Khi nên dùng `sendMessage()` trực tiếp:

- bạn gửi tới một `chat_id` khác
- bạn muốn truyền `reply_to_message_id` rõ ràng
- bạn đang gửi từ service hoặc workflow không có sẵn instance `Message`

## Cách hàm này hoạt động trong dự án

```ts
await bot.sendMessage(chatId, "Xin chào!");
```

Điều này quan trọng vì:

- ứng dụng chỉ nên phụ thuộc vào public API của thư viện
- dữ liệu trả về được parse sẵn thành `Message`
- phần mapping lỗi và request được SDK xử lý nội bộ

Nếu cần đối chiếu với Bot API gốc, có thể hiểu rằng `sendMessage()` nội bộ sẽ gọi xuống method `sendMessage` của transport layer. Tuy nhiên tài liệu của repo này ưu tiên mô tả hành vi ở mức SDK, không khuyến khích người dùng ghép URL thủ công.

## Biến môi trường thường dùng

Để chạy ví dụ trong repo, bạn thường cần:

```dotenv
ZALO_BOT_TOKEN=your_zalo_bot_token_here
ZALO_CHAT_ID=abc.xyz
ZALO_BOT_LANG=vi
```

Ý nghĩa:

- `ZALO_BOT_TOKEN`: token bot
- `ZALO_CHAT_ID`: `chat_id` đích khi gửi chủ động
- `ZALO_BOT_LANG`: ngôn ngữ runtime của SDK

## Luồng xử lý điển hình

Khi gọi `sendMessage()`, luồng xử lý trong SDK diễn ra theo thứ tự:

1. ứng dụng gọi `bot.sendMessage(chatId, text, options)`
2. `Bot` chuẩn hóa payload gửi đi
3. request layer gọi Bot API `sendMessage`
4. phản hồi được parse thành `Message`
5. hàm trả về `Promise<Message>` cho ứng dụng

## Kiểm tra dữ liệu trước khi gửi

Trước khi gọi `sendMessage()`, bạn nên đảm bảo:

- `chatId` không rỗng
- `text` không rỗng
- nội dung phù hợp với ngữ cảnh bot
- nếu reply, `reply_to_message_id` là ID hợp lệ

Ví dụ:

```ts
function validateSendMessageInput(chatId: string, text: string) {
  if (!chatId) {
    throw new Error("chatId là bắt buộc");
  }

  if (!text || !text.trim()) {
    throw new Error("text là bắt buộc");
  }
}
```

## Xử lý lỗi

Một số lỗi thường gặp khi dùng `sendMessage()`:

- token không hợp lệ
- `chatId` sai hoặc không còn khả dụng
- lỗi mạng hoặc timeout
- API trả lỗi tạm thời

Ví dụ:

```ts
import { Bot, InvalidToken, NetworkError } from "zalo-bot-js";

try {
  await bot.sendMessage("abc.xyz", "Xin chào");
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

- `sendMessage()` chỉ dùng cho tin nhắn văn bản
- nếu cần gửi ảnh hoặc sticker, dùng `sendPhoto()` hoặc `sendSticker()`
- trong callback xử lý event, nên tránh gửi lặp nhiều lần không kiểm soát
- nếu dùng cùng n8n hoặc workflow ngoài, nên đặt timeout và fallback message ở lớp ứng dụng

## Kế tiếp

- Đọc [API Reference](./api-reference.md) để xem vị trí của `sendMessage()` trong toàn bộ SDK.
- Xem [Ví dụ và test](./examples.md) để áp dụng `sendMessage()` trong bot polling hoặc webhook.

Cập nhật lần cuối: 05/04/2026
