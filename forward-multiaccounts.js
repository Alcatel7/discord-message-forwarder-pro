const { Client } = require('discord.js-selfbot-v13');

const tokens = [
  "",
  ""
];


const originalChannelId = "";
const targetChannelId = "";


const MAX_MESSAGE_AGE = 24 * 60 * 60 * 1000;
const sentMessageIds = new Set();

const clients = tokens.map(token => new Client());
const messageQueue = [];

let isProcessing = false;

async function processQueue() {
  if (isProcessing || messageQueue.length === 0) {
    return;
  }

  isProcessing = true;
  const { content, client } = messageQueue.shift();


  const nextClient = messageQueue.length > 0 ? messageQueue[0].client : null;

  try {
    const channel = await client.channels.fetch(targetChannelId);
    await channel.sendTyping();


    if (nextClient && messageQueue.length > 0) {
      const nextChannel = await nextClient.channels.fetch(targetChannelId);
      nextChannel.sendTyping();
    }

    const randomDelay = Math.random() * 2500 + 500;
    setTimeout(async () => {
      await channel.send(content);
      isProcessing = false;
      processQueue();
    }, randomDelay);
  } catch (error) {
    console.error('Error during message sending:', error);
    isProcessing = false;
    processQueue();
  }
}

clients.forEach((client, index) => {
  client.on('ready', () => {
    console.log(`Connected as ${client.user.tag}`);
  });

  client.on('message', message => {
    if (message.channel.id !== originalChannelId || sentMessageIds.has(message.id)) {
      return;
    }
    sentMessageIds.add(message.id);
    const content = message.content || (message.embeds.length > 0 ? { embeds: [message.embeds[0]] } : "");
    messageQueue.push({ content, client });

    if (messageQueue.length === 1) {
      processQueue();
    }
  });

  client.login(tokens[index]).catch(error => console.error(`Login failed for client ${index + 1}:`, error));
});


setInterval(() => {
  const now = Date.now();
  for (let messageId of sentMessageIds) {
    const messageTimestamp = parseInt(messageId) / 4194304 + 1420070400000;
    if (now - messageTimestamp > MAX_MESSAGE_AGE) {
      sentMessageIds.delete(messageId);
    }
  }
}, 5 * 60 * 1000);
