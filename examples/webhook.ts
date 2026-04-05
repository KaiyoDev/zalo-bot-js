import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { Bot } from "../src";

async function main() {
  const token = process.env.ZALO_BOT_TOKEN;
  const webhookUrl = process.env.ZALO_WEBHOOK_URL;
  const secretToken = process.env.ZALO_WEBHOOK_SECRET ?? "replace-me";

  if (!token || !webhookUrl) {
    throw new Error("Missing ZALO_BOT_TOKEN or ZALO_WEBHOOK_URL");
  }

  const bot = new Bot({ token });
  bot.on("message", async (message) => {
    await bot.sendMessage(message.chat.id, "Xin chao!");
  });

  bot.onText(/\/start(?:\s+(.+))?/, async (message, match) => {
    const payload = match[1]?.trim() ?? "ban";
    await bot.sendMessage(message.chat.id, `Webhook nhan /start tu ${payload}`);
  });

  await bot.setWebHook(webhookUrl, {
    secret_token: secretToken,
  });

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== "POST" || req.url !== "/webhook") {
      res.statusCode = 404;
      res.end("not found");
      return;
    }

    if (req.headers["x-bot-api-secret-token"] !== secretToken) {
      res.statusCode = 403;
      res.end("unauthorized");
      return;
    }

    const body = await readBody(req);
    const payload = JSON.parse(body) as Record<string, unknown>;
    await bot.processUpdate(payload as never);

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
