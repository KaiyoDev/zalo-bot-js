const token = process.env.ZALO_BOT_TOKEN;
const BASE_URL = "https://bot-api.zaloplatforms.com";

async function test() {
  console.log("Testing getUpdates directly...\n");

  // Test 1: getMe
  console.log("1. Testing getMe...");
  const meRes = await fetch(`${BASE_URL}/bot${token}/getMe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const meText = await meRes.text();
  console.log("   Status:", meRes.status);
  console.log("   Response:", meText);

  // Test 2: getUpdates
  console.log("\n2. Testing getUpdates...");
  const updatesRes = await fetch(`${BASE_URL}/bot${token}/getUpdates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit: 10, timeout: 10, offset: 0 }),
  });
  const updatesText = await updatesRes.text();
  console.log("   Status:", updatesRes.status);
  console.log("   Response:", updatesText);

  // Test 3: Try with different offset
  console.log("\n3. Testing getUpdates with offset=99999...");
  const updatesRes2 = await fetch(`${BASE_URL}/bot${token}/getUpdates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit: 10, timeout: 5, offset: 99999 }),
  });
  const updatesText2 = await updatesRes2.text();
  console.log("   Status:", updatesRes2.status);
  console.log("   Response:", updatesText2);
}

test().catch(console.error);
