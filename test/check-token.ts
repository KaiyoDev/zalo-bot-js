import { Bot } from "../src";
import { t } from "../src/i18n/runtime";

async function main() {
  
  const token = process.env.ZALO_BOT_TOKEN;
  if (!token) {
    throw new Error(t("env.missingToken"));
  }

  const bot = new Bot({ token });

  try {
    await bot.initialize();
    const me = await bot.getMe();

    console.log(t("test.tokenValid"));
    console.log(t("test.botId", { value: me.id }));
    console.log(t("test.displayName", { value: me.displayName ?? t("test.unknown") }));
    console.log(t("test.accountName", { value: me.accountName ?? t("test.unknown") }));
    console.log(t("test.accountType", { value: me.accountType ?? t("test.unknown") }));
  } finally {
    await bot.shutdown();
  }
}

void main().catch((error) => {
  console.error(t("test.tokenCheckFailed"));
  console.error(error);
  process.exitCode = 1;
});
