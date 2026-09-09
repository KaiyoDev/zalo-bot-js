# startPolling

Trang này mô tả ba hàm `startPolling()`, `stopPolling()` và `isPolling()` trong `zalo-bot-js`, dùng để vận hành bot theo cơ chế polling.

Nếu bạn muốn bot tự nhận update liên tục mà không cần webhook, đây là nhóm hàm quan trọng nhất.

## Chữ ký hàm

```ts
startPolling(options?: PollingOptions): Promise<void>
```

```ts
stopPolling(): void
```

```ts
isPolling(): boolean
```

## Khi nào nên dùng

- phát triển local
- chưa có public URL cho webhook
- muốn chạy bot nhanh bằng polling

## `startPolling()`

Hàm này:

1. gọi `initialize()`
2. lặp `getUpdates()`
3. gọi `processUpdate()` cho từng update
4. tiếp tục chạy cho tới khi `stopPolling()`

### Tùy chọn

| Tùy chọn | Kiểu dữ liệu | Mô tả |
| --- | --- | --- |
| `timeoutSeconds` | `number` | Timeout long polling |
| `retryDelayMs` | `number` | Delay giữa các vòng lặp khi cần retry |
| `allowedUpdates` | `string[]` | Giới hạn loại update muốn lấy |
| `onUpdate` | `(update) => void \| Promise<void>` | Hook gọi trước khi `processUpdate()` |

### Ví dụ tối thiểu

```ts
import { Bot } from "zalo-bot-js";

const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN! });

bot.on("text", async (message) => {
  await bot.sendMessage(message.chat.id, `Bạn vừa gửi: ${message.text}`);
});

await bot.startPolling({
  timeoutSeconds: 30,
});
```

### Ví dụ với `onUpdate`

```ts
await bot.startPolling({
  timeoutSeconds: 30,
  onUpdate(update) {
    console.log(update.updateId, update.eventTypes);
  },
});
```

## `stopPolling()`

Dùng để dừng vòng polling đang chạy.

Ví dụ:

```ts
bot.stopPolling();
```

Thường gọi khi:

- ứng dụng nhận tín hiệu shutdown
- bạn muốn chuyển mode chạy

## `isPolling()`

Trả về `true` nếu bot đang polling, ngược lại trả `false`.

Ví dụ:

```ts
if (!bot.isPolling()) {
  await bot.startPolling();
}
```

## Quan hệ với webhook

- polling phù hợp cho local và giai đoạn đầu
- webhook phù hợp hơn cho production
- không nên phụ thuộc đồng thời cả hai cách nhận update cho cùng một luồng chính

## Lưu ý thực tế

- `startPolling()` sẽ tự gọi `processUpdate()` cho từng update
- khi polling chạy, SDK cũng sẽ quản lý offset nội bộ
- nếu cần kiểm soát hoàn toàn offset, hãy dùng [getUpdates](./get-updates.md)

## Kế tiếp

- Xem [getUpdates](./get-updates.md) nếu bạn muốn polling thủ công.
- Xem [processUpdate](./process-update.md) để hiểu update được xử lý thế nào trong SDK.

Cập nhật lần cuối: 05/04/2026
