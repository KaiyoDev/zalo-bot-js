import { Bot } from "../src";
import { t } from "../src/i18n/runtime";

async function main() {
  const token = process.env.ZALO_BOT_TOKEN;
  if (!token) {
    throw new Error(t("env.missingToken"));
  }

  console.log("🔍 Checking bot token...");
  
  const bot = new Bot({ token });
  
  try {
    // Test 1: Kiểm tra token
    console.log("\n1. Testing getMe()...");
    const me = await bot.getMe();
    console.log("✅ Token hợp lệ!");
    console.log(`   Bot ID: ${me.id}`);
    console.log(`   Display Name: ${me.displayName ?? "N/A"}`);
    console.log(`   Account Name: ${me.accountName ?? "N/A"}`);
    
    // Test 2: Lấy update gần nhất
    console.log("\n2. Testing getUpdates()...");
    const updates = await bot.getUpdates({ limit: 5 });
    console.log(`   Nhận được ${updates.length} updates`);
    
    if (updates.length > 0) {
      for (const update of updates) {
        console.log("\n--- Update ---");
        console.log("Update ID:", update.updateId);
        if (update.message) {
          const msg = update.message;
          console.log("Chat ID:", msg.chat.id);
          console.log("Chat Type:", msg.chat.type ?? "unknown");
          console.log("From User:", msg.fromUser?.id ?? "unknown");
          console.log("From Name:", msg.fromUser?.displayName ?? "unknown");
          console.log("Text:", msg.text ?? "no text");
          console.log("Message ID:", msg.messageId);
        }
      }
    } else {
      console.log("   Không có update nào. Gửi tin nhắn cho bot để test!");
    }
    
    // Test 3: Start polling ngắn
    console.log("\n3. Starting polling for 30 seconds...");
    let messageCount = 0;
    
    bot.on("message", async (message, metadata) => {
      messageCount++;
      console.log(`\n📨 Message #${messageCount} received!`);
      console.log("   Chat Type:", message.chat.type ?? "unknown");
      console.log("   Chat ID:", message.chat.id);
      console.log("   Text:", message.text ?? "no text");
      console.log("   From:", message.fromUser?.displayName ?? "unknown");
      
      // Reply
      const reply = message.chat.type === "GROUP" ? "[GROUP] " : "[PRIVATE] ";
      await bot.sendMessage(message.chat.id, `${reply}Đã nhận tin nhắn!`);
      console.log("   ✅ Reply sent");
    });
    
    // Auto stop after 30 seconds
    const pollingTask = bot.startPolling({ timeoutSeconds: 10 });
    
    setTimeout(async () => {
      console.log("\n⏹️  Stopping polling...");
      bot.stopPolling();
      await pollingTask;
      console.log("✅ Test completed!");
      process.exit(0);
    }, 30000);
    
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exitCode = 1;
  }
}

void main();
