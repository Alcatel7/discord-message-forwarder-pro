const { Client } = require('discord.js-selfbot-v13');

const client1 = new Client();
const token1 = "";

const client2 = new Client();
const token2 = "";

const originalChannelId = "";
const targetChannelId = "";

let lastMessageContent = null;
let lastTokenUsed = null;
let isToken1Turn = true;


function sendMessage(content) {
  let targetClient, targetChannel;
  if (isToken1Turn) {
    targetClient = client1;
  } else {
    targetClient = client2;
  }
  
  targetChannel = targetClient.channels.cache.get(targetChannelId);
  if (!targetChannel) {
    console.error(`Cant find the channel with ID ${targetChannelId}.`);
    return;
  }


  if (targetClient.token === lastTokenUsed) {
    isToken1Turn = !isToken1Turn;
    if (isToken1Turn) {
      targetClient = client1;
    } else {
      targetClient = client2;
    }
    targetChannel = targetClient.channels.cache.get(targetChannelId);
  }


  targetChannel.sendTyping();
  setTimeout(() => {
    targetChannel.send(content)
      .then(() => {
        lastMessageContent = content;
        lastTokenUsed = targetClient.token;
        isToken1Turn = !isToken1Turn;
      })
      .catch(error => {
        console.error('Cant send the msg:', error);
      });
  }, 3000);
}


client1.on('ready', () => {
  console.log(`Conected as ${client1.user.tag}`);
});

client1.on('message', (message) => {
  if (message.channel.id === originalChannelId) {
    let content = message.content ? message.content : { embeds: [message.embeds[0]] };
    if (!lastMessageContent || JSON.stringify(content) !== JSON.stringify(lastMessageContent)) {
      sendMessage(content);
    }
  }
});


client1.login(token1)
  .then(() => console.log('Logged into client 1'))
  .catch(error => console.error('Couldnt loginto client 1:', error));

// Listeners de eventos para el cliente2
client2.on('ready', () => {
  console.log(`Conectado como ${client2.user.tag}`);
});


client2.login(token2)
  .then(() => console.log('Logged into client 2'))
  .catch(error => console.error('Couldnt login to client 2:, error));
