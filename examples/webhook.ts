import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { Bot, CommandHandler, MessageHandler, filters, Application, Update } from "../src";

async function start(update: Update) {
  await update.message?.replyText("Xin chao tu webhook TypeScript.");
}

async function echo(update: Update) {
  if (!update.message?.text) {
    return;
  }

  await update.message.replyText(`Webhook nhan: ${update.message.text}`);
}

async function main() {
  const token = process.env.ZALO_BOT_TOKEN;
  const webhookUrl = process.env.ZALO_WEBHOOK_URL;
  const secretToken = process.env.ZALO_WEBHOOK_SECRET ?? "replace-me";

  if (!token || !webhookUrl) {
    throw new Error("Missing ZALO_BOT_TOKEN or ZALO_WEBHOOK_URL");
  }

  const bot = new Bot({ token });
  const app = new Application(bot);
  app.addHandler(new CommandHandler("start", start));
  app.addHandler(new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), echo));

  await bot.initialize();
  await bot.setWebhook(webhookUrl, secretToken);

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== "POST" || req.url !== "/webhook") {
      res.statusCode = 404;
      res.end("not found");
      return;
    }

    const body = await readBody(req);
    const payload = JSON.parse(body) as { result?: Record<string, unknown> };
    const update = Update.fromApi(payload.result as never, bot);

    if (update) {
      await app.processUpdate(update);
    }

    res.statusCode = 200;
    res.end("ok");
  });

  server.listen(3000);
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer | string) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

void main();
