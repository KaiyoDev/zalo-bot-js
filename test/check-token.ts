import { config as loadEnv } from "dotenv";
import { Bot } from "../src";

async function main() {
  loadEnv();

  const token = process.env.ZALO_BOT_TOKEN;
  if (!token) {
    throw new Error("Missing ZALO_BOT_TOKEN in .env");
  }

  const bot = new Bot({ token });

  try {
    await bot.initialize();
    const me = await bot.getMe();

    console.log("Token is valid.");
    console.log(`Bot ID: ${me.id}`);
    console.log(`Display name: ${me.displayName ?? "(unknown)"}`);
    console.log(`Account name: ${me.accountName ?? "(unknown)"}`);
    console.log(`Account type: ${me.accountType ?? "(unknown)"}`);
  } finally {
    await bot.shutdown();
  }
}

void main().catch((error) => {
  console.error("Token check failed.");
  console.error(error);
  process.exitCode = 1;
});
