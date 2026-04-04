import { config as loadEnv } from "dotenv";
import {
  ApplicationBuilder,
  CommandHandler,
  MessageHandler,
  filters,
  type Update,
} from "../src";

async function main() {
  loadEnv();

  const token = process.env.ZALO_BOT_TOKEN;
  if (!token) {
    throw new Error("Missing ZALO_BOT_TOKEN in .env");
  }

  const app = new ApplicationBuilder().token(token).build();

  app.addHandler(
    new CommandHandler("start", async (update: Update) => {
      await update.message?.replyText("Chao ban! Bot da nhan lenh /start.");
    }),
  );

  app.addHandler(
    new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), async (update: Update) => {
      const text = update.message?.text?.trim().toLowerCase();

      if (text === "hello") {
        await update.message?.replyText("Hello! Bot dang chay tot.");
      }
    }),
  );

  console.log("Hello bot is polling.");
  console.log('Gui "/start" hoac "hello" de test.');

  await app.runPolling();
}

void main().catch((error) => {
  console.error("Hello bot test failed.");
  console.error(error);
  process.exitCode = 1;
});
