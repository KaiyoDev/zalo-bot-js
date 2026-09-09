# Gửi tin nhắn văn bản

Trang này mô tả hàm `sendMessage()` trong `zalo-bot-js`, dùng để gửi tin nhắn văn bản đến người dùng hoặc cuộc trò chuyện từ chính SDK của dự án.

Nếu bạn đang xây bot phản hồi tin nhắn, gửi thông báo từ workflow hoặc trả kết quả xử lý về cho người dùng, đây là một trong những hàm cốt lõi được dùng thường xuyên nhất.

## Chữ ký hàm

```ts
sendMessage(
  chatId: string,
  text: string,
  options?: SendMessageOptions,
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
| `text` | `string` | Có | Nội dung tin nhắn văn bản (1–2000 ký tự) |
| `options.reply_to_message_id` | `string` | Không | ID tin nhắn cần reply trực tiếp |
| `options.parse_mode` | `ParseMode` | Không | Bật định dạng rich text: `"markdown"` hoặc `"html"` |
| `options.text_styles` | `TextStyleRun[]` | Không | Các đoạn định dạng áp trực tiếp lên text thô |

## Định dạng văn bản (Rich Text)

Bot hỗ trợ hai cách gửi tin nhắn có định dạng:

### Cách 1: dùng `parse_mode`

Đặt `parse_mode` là `"markdown"` hoặc `"html"` và viết nội dung có markup trực tiếp trong `text`. Server sẽ tự phân tích và áp dụng định dạng.

**Markdown:**

```ts
await bot.sendMessage(chatId, "**Xin chào** _bạn_, đây là tin nhắn **đậm** và *nghiêng*", {
  parse_mode: "markdown",
});
```

Cú pháp Markdown hỗ trợ:

| Cú pháp | Kết quả |
|---|---|
| `**đậm**`, `__đậm__` | In đậm |
| `*nghiêng*`, `_nghiêng_` | In nghiêng |
| `***đậm nghiêng***` | In đậm + in nghiêng |
| `~~gạch~~` | Gạch ngang |
| `` `code` `` | Giữ nguyên (monospace) |
| `{red}…{/red}` | Màu chữ |
| `{big}…{/big}` | Cỡ chữ lớn |

**HTML:**

```ts
await bot.sendMessage(chatId, "<b>Xin chào</b> <i>bạn</i>", {
  parse_mode: "html",
});
```

Thẻ HTML hỗ trợ: `<b>`, `<strong>`, `<i>`, `<em>`, `<u>`, `<s>`, `<del>`, `<h1>`–`<h6>`, `<ul>`, `<ol>`, `<li>`, `<p>`, `<div>`, `style="..."`.

### Cách 2: dùng `text_styles`

Gửi danh sách các đoạn định dạng áp trực tiếp lên text thô. Mỗi phần tử gồm vị trí bắt đầu, độ dài và danh sách mã định dạng.

```ts
await bot.sendMessage(chatId, "Xin chào bạn", {
  text_styles: [
    { start: 0, len: 7, st: ["b", "c_db342e"] }, // đậm + đỏ
    { start: 8, len: 4, st: ["i"] },             // nghiêng
  ],
});
```

Bảng mã định dạng (`st`) hỗ trợ:

| Mã | Ý nghĩa |
|---|---|
| `b` | In đậm |
| `i` | In nghiêng |
| `u` | Gạch chân |
| `s` | Gạch ngang |
| `f_13`, `f_15`, `f_18`, `f_20` | Cỡ chữ (nhỏ / thường / lớn / rất lớn) |
| `c_050a19` | Màu mặc định |
| `c_15a85f` | Màu xanh lá |
| `c_f7b503` | Màu vàng |
| `c_f27806` | Màu cam |
| `c_db342e` | Màu đỏ |
| `lst_1` | Danh sách không thứ tự |
| `lst_2` | Danh sách có thứ tự |
| `ind_1`–`ind_5` | Mức thụt lề |

### Thứ tự ưu tiên

Nếu cả `parse_mode` và `text_styles` cùng được gửi, `parse_mode` sẽ được ưu tiên và `text_styles` sẽ bị bỏ qua. Hai trường này dùng hệ tọa độ offset khác nhau nên không thể kết hợp đồng thời.

## Giá trị trả về

Hàm trả về `Promise<Message>`.

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

## Ví dụ với markdown

```ts
await bot.sendMessage(chatId, "**In đậm** và *in nghiêng*", {
  parse_mode: "markdown",
});
```

## Ví dụ với text_styles

```ts
await bot.sendMessage(chatId, "Màu cam", {
  text_styles: [
    { start: 0, len: 7, st: ["b", "c_f27806"] }, // đậm màu cam
  ],
});
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

## Lưu ý thực tế

- `sendMessage()` chỉ dùng cho tin nhắn văn bản
- nếu cần gửi ảnh hoặc sticker, dùng `sendPhoto()` hoặc `sendSticker()`
- trong callback xử lý event, nên tránh gửi lặp nhiều lần không kiểm soát
- `parse_mode` và `text_styles` không thể dùng cùng lúc — `parse_mode` có độ ưu tiên cao hơn

## Kế tiếp

- Đọc [API Reference](./api-reference.md) để xem vị trí của `sendMessage()` trong toàn bộ SDK.
- Xem [Ví dụ và test](./examples.md) để áp dụng `sendMessage()` trong bot polling hoặc webhook.

Cập nhật lần cuối: 07/09/2026
