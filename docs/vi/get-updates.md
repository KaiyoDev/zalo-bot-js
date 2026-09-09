# getUpdates

Trang này mô tả hai hàm `getUpdates()` và `getUpdate()` trong `zalo-bot-js`, dùng để lấy update từ Bot API theo cơ chế polling thủ công.

Nếu bạn cần tự kiểm soát vòng lặp nhận update, offset hoặc timeout thay vì dùng `startPolling()`, đây là nhóm hàm phù hợp.

## Chữ ký hàm

```ts
getUpdates(
  params?: {
    offset?: number;
    limit?: number;
    timeout?: number;
    allowedUpdates?: string[];
  },
  options?: RequestOptions,
): Promise<Update[]>
```

```ts
getUpdate(
  params?: {
    offset?: number;
    limit?: number;
    timeout?: number;
    allowedUpdates?: string[];
  },
  options?: RequestOptions,
): Promise<Update | undefined>
```

## Khác nhau giữa `getUpdates()` và `getUpdate()`

- `getUpdates()` trả về danh sách `Update[]`
- `getUpdate()` là helper mỏng lấy phần tử đầu tiên từ `getUpdates()`

## Khi nào nên dùng

- tự xây vòng polling riêng
- debug luồng update
- cần kiểm soát `offset`, `timeout`, `limit`
- viết công cụ kiểm tra update thủ công

## Tham số

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `offset` | `number` | Không | Bỏ qua các update cũ hơn |
| `limit` | `number` | Không | Giới hạn số update lấy về |
| `timeout` | `number` | Không | Thời gian long polling ở phía API |
| `allowedUpdates` | `string[]` | Không | Giới hạn loại update muốn nhận |

## Giá trị trả về

- `getUpdates()` trả `Promise<Update[]>`
- `getUpdate()` trả `Promise<Update | undefined>`

Mỗi `Update` đã được parse thành model của SDK, có thể truy cập:

- `updateId`
- `message`
- `eventTypes`
- `raw`

## Ví dụ với `getUpdates()`

```ts
import { Bot } from "zalo-bot-js";

const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN! });

async function main() {
  const updates = await bot.getUpdates({
    timeout: 30,
    limit: 10,
  });

  for (const update of updates) {
    console.log({
      updateId: update.updateId,
      eventTypes: update.eventTypes,
      text: update.message?.text ?? null,
    });
  }
}

void main();
```

## Ví dụ với `getUpdate()`

```ts
const update = await bot.getUpdate({ timeout: 30 });

if (update?.message) {
  console.log(update.message.text);
}
```

## Quan hệ với `startPolling()`

`startPolling()` thực chất sử dụng `getUpdates()` bên trong để nhận update liên tục. Vì vậy:

- nếu bạn muốn cách dùng đơn giản, dùng `startPolling()`
- nếu bạn cần tự kiểm soát toàn bộ vòng lặp, dùng `getUpdates()`

## Lưu ý về `offset`

Khi tự viết polling thủ công, bạn nên cập nhật `offset` để tránh đọc lại update cũ.

Ví dụ:

```ts
let offset: number | undefined;

while (true) {
  const updates = await bot.getUpdates({ offset, timeout: 30 });

  for (const update of updates) {
    console.log(update.message?.text);
    if (typeof update.updateId === "number") {
      offset = update.updateId + 1;
    }
  }
}
```

## Lưu ý thực tế

- `timeout` là timeout ở phía API, SDK sẽ tự cộng thêm một chút `readTimeout` nội bộ cho long polling
- nếu bạn không cần tự kiểm soát offset, hãy dùng `startPolling()`
- `eventTypes` được SDK suy ra từ nội dung message, ví dụ `message`, `text`, `command`, `photo`, `sticker`

## Kế tiếp

- Xem [processUpdate](./process-update.md) nếu bạn muốn đẩy payload vào hệ event của SDK.
- Đọc [startPolling](./start-polling.md) nếu bạn muốn dùng polling runtime có sẵn.

Cập nhật lần cuối: 05/04/2026
