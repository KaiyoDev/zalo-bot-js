import { config as loadEnv } from "dotenv";
import { Bot } from "../src";
import { t } from "../src/i18n/runtime";

async function main() {
  loadEnv();

  const token = process.env.ZALO_BOT_TOKEN;
  if (!token) {
    throw new Error(t("env.missingToken"));
  }

  const bot = new Bot({ token });
  bot.onText(/\/start/, async (message) => {
    await bot.sendMessage(message.chat.id, t("reply.start"));
  });
  bot.on("text", async (message) => {
    const text = message.text?.trim().toLowerCase();
    if (text === "hello") {
      await bot.sendMessage(message.chat.id, t("reply.hello"));
    }
  });

  console.log(t("app.pollingStarted"));
  console.log(t("app.pollingHint"));

  await bot.startPolling();
}

void main().catch((error) => {
  console.error(t("test.helloBotFailed"));
  console.error(error);
  process.exitCode = 1;
});
