# API Reference

Trang này là mục lục tra cứu cho các hàm chính của `zalo-bot-js`. Mỗi hàm quan trọng được tách thành một trang riêng để dễ đọc, dễ bảo trì và đúng với cấu trúc tài liệu theo từng API.

Nếu bạn mới bắt đầu, hãy đọc [Bắt đầu nhanh](./getting-started.md) trước. Nếu bạn muốn tra cứu theo từng hàm, dùng danh sách dưới đây.

## Nhóm thông tin bot và update

- [initialize](./initialize.md)
- [shutdown](./shutdown.md)
- [cachedUser](./cached-user.md)
- [getMe](./get-me.md)
- [getUpdates / getUpdate](./get-updates.md)

## Nhóm gửi dữ liệu

- [sendMessage](./send-message.md)
- [sendPhoto](./send-photo.md)
- [sendSticker](./send-sticker.md)
- [sendChatAction](./send-chat-action.md)

## Nhóm webhook

- [setWebhook](./set-webhook.md)
- [deleteWebhook](./delete-webhook.md)
- [getWebhookInfo](./get-webhook-info.md)
- [testWebhook](./test-webhook.md)

## Nhóm event và xử lý update

- [on](./on.md)
- [onText](./on-text.md)
- [processUpdate](./process-update.md)

## Nhóm helper trên `Message`

- [replyText](./reply-text.md)
- [replyPhoto](./reply-photo.md)
- [replySticker](./reply-sticker.md)
- [replyAction](./reply-action.md)

## Nhóm polling runtime

- [startPolling / stopPolling / isPolling](./start-polling.md)

## Nhóm handler-based API

- [ApplicationBuilder](./application-builder.md)
- [Application](./application.md)
- [CommandHandler](./command-handler.md)
- [MessageHandler](./message-handler.md)
- [filters](./filters.md)
- [CallbackContext](./callback-context.md)

## Thành phần liên quan

- [Ví dụ và test](./examples.md)
- [Kiến trúc](./architecture.md)
- [Tích hợp với n8n](./n8n.md)

## Kế tiếp

Bắt đầu với [getMe](./get-me.md) nếu bạn muốn kiểm tra token, hoặc [sendMessage](./send-message.md) nếu bạn muốn gửi phản hồi đầu tiên từ bot.

Cập nhật lần cuối: 05/04/2026
