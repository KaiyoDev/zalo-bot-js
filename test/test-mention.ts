import { Bot } from "../src";
import { t } from "../src/i18n/runtime";

async function main() {
  const token = process.env.ZALO_BOT_TOKEN;
  if (!token) {
    throw new Error(t("env.missingToken"));
  }

  const bot = new Bot({ token });

  console.log("🤖 Bot icheck Polling Test");
  console.log("   Send messages to test PRIVATE and GROUP chats\n");

  // Catch-all message handler
  bot.on("message", async (message, metadata) => {
    const isGroup = message.chat.type === "GROUP";
    const chatLabel = isGroup ? "GROUP" : "PRIVATE";
    
    console.log(`\n📨 [${chatLabel}] Message received!`);
    console.log(`   Chat ID: ${message.chat.id}`);
    console.log(`   From: ${message.fromUser?.displayName ?? "unknown"} (${message.fromUser?.id})`);
    console.log(`   Text: "${message.text ?? "no text"}"`);
    console.log(`   Message ID: ${message.messageId}`);
    console.log(`   Event Types: ${metadata.update.eventTypes.join(", ")}`);
    
    // Reply based on chat type
    if (isGroup) {
      await bot.sendMessage(message.chat.id, `✅ Đã nhận tin nhắn từ group!\nChat type: GROUP`);
    } else {
      await bot.sendMessage(message.chat.id, `✅ Đã nhận tin nhắn từ private!\nChat type: PRIVATE`);
    }
  });

  // Text event (includes @mention in groups)
  bot.on("text", async (message) => {
    const isGroup = message.chat.type === "GROUP";
    console.log(`\n📝 [TEXT] ${isGroup ? "GROUP" : "PRIVATE"}: ${message.text}`);
  });

  // Command handler - should work for both private and group (@mention)
  bot.command("start", async (message) => {
    const isGroup = message.chat.type === "GROUP";
    const mentionPrefix = isGroup ? "@Bot icheck " : "";
    await bot.sendMessage(
      message.chat.id,
      `✅ Command /start received!\n` +
      `Chat type: ${message.chat.type ?? "unknown"}\n` +
      `Text: "${mentionPrefix}${message.text}"`
    );
  });

  bot.command("info", async (message) => {
    await bot.sendMessage(
      message.chat.id,
      `📋 Bot Info:\n` +
      `- Chat ID: ${message.chat.id}\n` +
      `- Chat Type: ${message.chat.type ?? "unknown"}\n` +
      `- User ID: ${message.fromUser?.id ?? "unknown"}\n` +
      `- User Name: ${message.fromUser?.displayName ?? "unknown"}`
    );
  });

  // Help command
  bot.command("help", async (message) => {
    await bot.sendMessage(
      message.chat.id,
      "🤖 Bot Commands:\n" +
      "- /start : Test command parsing\n" +
      "- /info : Show bot info\n" +
      "- /help : Show this help\n\n" +
      "In GROUP, mention bot first: @BotName /command"
    );
  });

  console.log("✅ Polling started!");
  console.log("   Commands: /start, /info, /help");
  console.log("   In GROUP: @Bot icheck /command\n");
  console.log("Waiting for messages...\n");

  await bot.startPolling({ timeoutSeconds: 10 });
}

void main().catch((error) => {
  console.error(t("test.helloBotFailed"));
  console.error(error);
  process.exitCode = 1;
});
