const token = process.env.ZALO_BOT_TOKEN;
const BASE_URL = "https://bot-api.zaloplatforms.com";

async function test() {
  console.log("Testing getUpdates directly...\n");

  for (let i = 0; i < 3; i++) {
    console.log(`Attempt ${i + 1}...`);
    const response = await fetch(`${BASE_URL}/bot${token}/getUpdates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit: 10, timeout: 30, offset: 0 }),
    });

    const text = await response.text();
    console.log("Response:", text);
    console.log("");

    // Parse and show details
    try {
      const data = JSON.parse(text);
      if (data.ok && data.result && data.result.message) {
        const msg = data.result.message;
        console.log("  → Chat type:", msg.chat?.chat_type);
        console.log("  → Text:", msg.text);
        console.log("  → From:", msg.from?.display_name);
        console.log("  → Event:", data.result.event_name);
      }
    } catch {}

    // Small delay between attempts
    await new Promise((r) => setTimeout(r, 1000));
  }
}

test().catch(console.error);
