import { Bot } from "../src";
import { t } from "../src/i18n/runtime";

async function main() {
  const token = process.env.ZALO_BOT_TOKEN;
  if (!token) {
    throw new Error(t("env.missingToken"));
  }

  const bot = new Bot({ token });

  // Log all messages với đầy đủ thông tin chat (private/group)
  bot.on("message", async (message, metadata) => {
    console.log("\n=== MESSAGE RECEIVED ===");
    console.log("Update ID:", metadata.update.updateId);
    console.log("Chat ID:", message.chat.id);
    console.log("Chat Type:", message.chat.type ?? "unknown");
    console.log("Message ID:", message.messageId);
    console.log("From User:", message.fromUser?.id ?? "unknown");
    console.log("From Name:", message.fromUser?.displayName ?? "unknown");
    console.log("Event Types:", metadata.update.eventTypes.join(", "));
    console.log("Text:", message.text ?? "no text");
    console.log("Photo URL:", message.photoUrl ?? "none");
    console.log("Sticker:", message.sticker ?? "none");
    console.log("Voice URL:", message.voiceUrl ?? "none");
    console.log("Caption:", message.caption ?? "none");
    console.log("========================\n");

    // Reply với thông tin chat type
    const chatTypeLabel = message.chat.type === "GROUP" ? "[GROUP]" : "[PRIVATE]";
    await bot.sendMessage(
      message.chat.id,
      `${chatTypeLabel} Đã nhận tin nhắn từ ${message.fromUser?.displayName ?? "user"}!\n` +
      `Chat type: ${message.chat.type ?? "unknown"}`,
    );
  });

  // Text event
  bot.on("text", async (message) => {
    const isGroup = message.chat.type === "GROUP";
    console.log(`[TEXT EVENT] ${isGroup ? "GROUP" : "PRIVATE"}: ${message.text}`);
  });

  // Photo event
  bot.on("photo", async (message) => {
    console.log(`[PHOTO] Chat: ${message.chat.type} - URL: ${message.photoUrl}`);
  });

  // Sticker event
  bot.on("sticker", async (message) => {
    console.log(`[STICKER] Chat: ${message.chat.type} - ID: ${message.sticker}`);
  });

  // Voice event
  bot.on("voice", async (message) => {
    console.log(`[VOICE] Chat: ${message.chat.type} - URL: ${message.voiceUrl}`);
  });

  // Command handler
  bot.command("start", async (message) => {
    const chatType = message.chat.type ?? "unknown";
    await bot.sendMessage(message.chat.id, `/start command received!\nChat type: ${chatType}`);
  });

  bot.command("info", async (message) => {
    await bot.sendMessage(
      message.chat.id,
      `Bot info:\n` +
      `- Chat ID: ${message.chat.id}\n` +
      `- Chat Type: ${message.chat.type ?? "unknown"}\n` +
      `- User ID: ${message.fromUser?.id ?? "unknown"}\n` +
      `- User Name: ${message.fromUser?.displayName ?? "unknown"}`,
    );
  });

  console.log(t("app.pollingStarted"));
  console.log("Send messages to test both PRIVATE and GROUP chats.");
  console.log("Commands: /start, /info");
  console.log("Supported events: text, photo, sticker, voice\n");

  await bot.startPolling();
}

void main().catch((error) => {
  console.error(t("test.helloBotFailed"));
  console.error(error);
  process.exitCode = 1;
});
