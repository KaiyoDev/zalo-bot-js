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

  bot.on("message", async (message, metadata) => {
    console.log("[message]", {
      updateId: metadata.update.updateId,
      chatId: message.chat.id,
      messageId: message.messageId,
      fromUserId: message.fromUser?.id,
      messageType: message.messageType,
      eventTypes: metadata.update.eventTypes,
      text: message.text ?? null,
      sticker: message.sticker ?? null,
      photoUrl: message.photoUrl ?? null,
    });
  });

  bot.on("text", async (message) => {
    console.log("[text]", {
      chatId: message.chat.id,
      text: message.text,
    });
  });

  bot.on("sticker", async (message) => {
    console.log("[sticker]", {
      chatId: message.chat.id,
      sticker: message.sticker,
    });
  });

  bot.on("photo", async (message) => {
    console.log("[photo]", {
      chatId: message.chat.id,
      photoUrl: message.photoUrl,
    });
  });

  bot.onText(/.*/, async (message, match) => {
    console.log("[onText]", {
      chatId: message.chat.id,
      match: match[0],
    });
  });

  bot.onText(/\/test-multi-photo/, async (message) => {
    const photoUrls = [
      process.env.ZALO_TEST_PHOTO_URL_1,
      process.env.ZALO_TEST_PHOTO_URL_2,
      process.env.ZALO_TEST_PHOTO_URL_3,
    ].filter((url): url is string => Boolean(url));
    const sharedCaption = process.env.ZALO_TEST_PHOTO_CAPTION ?? "Shared caption";

    if (photoUrls.length === 0) {
      await bot.sendMessage(
        message.chat.id,
        "Missing ZALO_TEST_PHOTO_URL_1..3 in .env. Set image URLs first.",
      );
      return;
    }

    await bot.sendChatAction(message.chat.id, "typing");
    await bot.sendMessage(
      message.chat.id,
      `Sending ${photoUrls.length} photos with the same caption because the SDK currently supports single-photo send only.`,
    );

    for (const photoUrl of photoUrls) {
      await bot.sendPhoto(message.chat.id, sharedCaption, photoUrl, {
        reply_to_message_id: message.messageId,
      });
    }
  });

  console.log("Listening for Zalo events...");
  console.log("Send a message/sticker/photo to the bot to inspect chat and event payloads.");
  console.log("Send /test-multi-photo to make the bot reply with test photos from .env.");

  await bot.startPolling();
}

void main().catch((error) => {
  console.error("event-debug failed");
  console.error(error);
  process.exitCode = 1;
});
