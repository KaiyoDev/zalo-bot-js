import {
  ApplicationBuilder,
  CommandHandler,
  MessageHandler,
  filters,
} from "../src";

async function start(update: Parameters<CommandHandler["handleUpdate"]>[0]) {
  await update.message?.replyText("Chao ban! Toi la bot Zalo viet bang TypeScript.");
}

async function echo(update: Parameters<MessageHandler["handleUpdate"]>[0]) {
  if (!update.message?.text) {
    return;
  }

  await update.message.replyText(`Ban vua noi: ${update.message.text}`);
}

async function main() {
  const token = process.env.ZALO_BOT_TOKEN;
  if (!token) {
    throw new Error("Missing ZALO_BOT_TOKEN");
  }

  const app = new ApplicationBuilder().token(token).build();
  app.addHandler(new CommandHandler("start", start));
  app.addHandler(new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), echo));

  await app.runPolling();
}

void main();
