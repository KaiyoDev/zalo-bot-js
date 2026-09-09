const token = process.env.ZALO_BOT_TOKEN;
const BASE_URL = "https://bot-api.zaloplatforms.com";

async function test() {
  console.log("Testing getUpdates with long timeout...\n");

  const response = await fetch(`${BASE_URL}/bot${token}/getUpdates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit: 10, timeout: 30, offset: 0 }),
  });

  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Response:", text);
}

test().catch(console.error);  
