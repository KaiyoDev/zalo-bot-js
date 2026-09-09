const { Bot } = require('../dist/src/index.js');
const bot = new Bot({ token: process.env.ZALO_BOT_TOKEN });

async function test() {
  console.log('Testing group message behavior...\n');

  let msgCount = 0;

  bot.on('message', async (message) => {
    msgCount++;
    console.log(`[${msgCount}] Message received:`);
    console.log(`   Chat: ${message.chat.type} (${message.chat.id})`);
    console.log(`   Text: ${message.text}`);
    console.log(`   From: ${message.fromUser?.displayName}`);
  });

  console.log('Polling started... send messages to group and private chat');
  console.log('Watch for what messages the bot receives\n');

  await bot.startPolling({ timeoutSeconds: 15 });
  console.log('\nStopped.');
}

test().catch(console.error);
