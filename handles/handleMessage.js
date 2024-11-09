const fs = require('fs');
const path = require('path');
const axios = require('axios'); // Added axios for HTTP requests
const { sendMessage } = require('./sendMessage');

const commands = new Map();
const lastImageByUser = new Map(); // Store the last image sent by each user
const lastVideoByUser = new Map(); // Store the last video sent by each user
const prefix = '-';

const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`../commands/${file}`);
  commands.set(command.name.toLowerCase(), command);
}

async function handleMessage(event, pageAccessToken) {
  if (!event || !event.sender || !event.sender.id) {
    console.error('Invalid event object');
    return;
  }

  const senderId = event.sender.id;

  if (event.message && event.message.attachments) {
    const imageAttachment = event.message.attachments.find(att => att.type === 'image');
    const videoAttachment = event.message.attachments.find(att => att.type === 'video');

    if (imageAttachment) {
      lastImageByUser.set(senderId, imageAttachment.payload.url);
    }
    if (videoAttachment) {
      lastVideoByUser.set(senderId, videoAttachment.payload.url);
    }
  }

  if (event.message && event.message.text) {
    const messageText = event.message.text.trim().toLowerCase();

    // Handling "removebg" command
    if (messageText === 'removebg') {
      const lastImage = lastImageByUser.get(senderId);
      if (lastImage) {
        try {
          await commands.get('removebg').execute(senderId, [], pageAccessToken, lastImage);
          lastImageByUser.delete(senderId);
        } catch (error) {
          await sendMessage(senderId, { text: 'An error occurred while processing the image.' }, pageAccessToken);
        }
      } else {
        await sendMessage(senderId, { text: '❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝘀𝗲𝗻𝗱 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲 𝗳𝗶𝗿𝘀𝘁, 𝘁𝗵𝗲𝗻 𝘁𝘆𝗽𝗲 "𝗿𝗲𝗺𝗼𝘃𝗲𝗯𝗴" 𝘁𝗼 𝗿𝗲𝗺𝗼𝘃𝗲 𝗶𝘁𝘀 𝗯𝗮𝗰𝗸𝗴𝗿𝗼𝘂𝗻𝗱.' }, pageAccessToken);
      }
      return;
    }

    // Handling "remini" command
if (messageText === 'remini') {
  const lastImage = lastImageByUser.get(senderId);
  if (lastImage) {
    try {
      await commands.get('remini').execute(senderId, [], pageAccessToken, lastImage);
      lastImageByUser.delete(senderId);
    } catch (error) {
      await sendMessage(senderId, { text: 'An error occurred while processing the image.' }, pageAccessToken);
    }
  } else {
    await sendMessage(senderId, { text: '❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝘀𝗲𝗻𝗱 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲 𝗳𝗶𝗿𝘀𝘁, 𝘁𝗵𝗲𝗻 𝘁𝘆𝗽𝗲 "𝗿𝗲𝗺𝗶𝗻𝗶" 𝘁𝗼 𝗲𝗻𝗵𝗮𝗻𝗰𝗲 𝗶𝘁.' }, pageAccessToken);
  }
  return;
}
// Handling "reminiv2" command
if (messageText === 'reminiv2') {
  const lastImage = lastImageByUser.get(senderId);
  if (lastImage) {
    try {
      await commands.get('reminiv2').execute(senderId, [], pageAccessToken, lastImage);
      lastImageByUser.delete(senderId);
    } catch (error) {
      await sendMessage(senderId, { text: '⚠️ An error occurred while enhancing the image. Please try again later.' }, pageAccessToken);
    }
  } else {
    await sendMessage(senderId, { text: '❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝘀𝗲𝗻𝗱 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲 𝗳𝗶𝗿𝘀𝘁, 𝘁𝗵𝗲𝗻 𝘁𝘆𝗽𝗲 "𝗿𝗲𝗺𝗶𝗻𝗶" 𝘁𝗼 𝗲𝗻𝗵𝗮𝗻𝗰𝗲 𝗶𝘁.' }, pageAccessToken);
  }
  return;
}


    // Handling "gemini" command
    if (messageText.startsWith('gemini')) {
      const lastImage = lastImageByUser.get(senderId);
      const args = messageText.split(/\/).slice(1);

      try {
        await commands.get('gemini').execute(senderId, args, pageAccessToken, event, lastImage);
        lastImageByUser.delete(senderId);
      } catch (error) {
        await sendMessage(senderId, { text: 'An error occurred while processing the Gemini command.' }, pageAccessToken);
      }
      return;
    }

if (messageText === 'imgur') {
      const lastImage = lastImageByUser.get(senderId);
      const lastVideo = lastVideoByUser.get(senderId);
      const mediaToUpload = lastImage || lastVideo;

      if (mediaToUpload) {
        try {
          await commands.get('imgur').execute(senderId, [], pageAccessToken, mediaToUpload);
          lastImageByUser.delete(senderId);
          lastVideoByUser.delete(senderId);
        } catch (error) {
          await sendMessage(senderId, { text: '🫵😼' }, pageAccessToken);
        }
      } else {
        await sendMessage(senderId, { text: '❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝘀𝗲𝗻𝗱 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲 𝗼𝗿 𝘃𝗶𝗱𝗲𝗼 𝗳𝗶𝗿𝘀𝘁, 𝘁𝗵𝗲𝗻 𝘁𝘆𝗽𝗲 "𝗶𝗺𝗴𝘂𝗿" 𝘁𝗼 𝘂𝗽𝗹𝗼𝗮𝗱 𝗰𝗼𝗻𝘃𝗲𝗿𝘁 𝗹𝗶𝗻𝗸' }, pageAccessToken);
      }
      return;
    }

    // Other command processing logic...
    let commandName, args;
    if (messageText.startsWith(prefix)) {
      const argsArray = messageText.slice(prefix.length).split(' ');
      commandName = argsArray.shift().toLowerCase();
      args = argsArray;
    } else {
      const words = messageText.split(' ');
      commandName = words.shift().toLowerCase();
