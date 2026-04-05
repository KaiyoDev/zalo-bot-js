import { Bot } from "../src";

async function main() {
  const token = process.env.ZALO_BOT_TOKEN;
  if (!token) {
    throw new Error("Missing ZALO_BOT_TOKEN");
  }

  const bot = new Bot({ token });

  bot.on("message", async (message) => {
    console.log("Received message:", message.text ?? message.messageId);
  });

  bot.on("text", async (message) => {
    if (message.text && !message.text.startsWith("/")) {
      await bot.sendMessage(message.chat.id, `Ban vua noi: ${message.text}`);
    }
  });

  bot.onText(/\/start(?:\s+(.+))?/, async (message, match) => {
    const payload = match[1]?.trim();
    await bot.sendMessage(
      message.chat.id,
      payload ? `Chao ${payload}! Toi la bot Zalo viet bang TypeScript.` : "Chao ban!",
    );
  });

  await bot.startPolling();
}

void main();
