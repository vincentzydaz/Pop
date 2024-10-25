const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { sendMessage } = require('./sendMessage');
const commands = new Map();
const prefix = '';

const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`../commands/${file}`);
  commands.set(command.name.toLowerCase(), command);
  console.log(`Loaded command: ${command.name}`);
}

async function getAttachments(mid, pageAccessToken) {
  if (!mid) throw new Error("No message ID provided.");
  
  const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
    params: { access_token: pageAccessToken }
  });

  if (data && data.data.length > 0 && data.data[0].image_data) {
    return data.data[0].image_data.url;
  } else {
    throw new Error("No image found in the replied message.");
  }
}

async function handleMessage(event, pageAccessToken) {
  if (!event || !event.sender || !event.sender.id) {
    console.error('Invalid event object');
    return;
  }

  const senderId = event.sender.id;

  if (event.message && event.message.text) {
    const messageText = event.message.text.trim();
    let commandName, args;
    const words = messageText.split(' ');
    commandName = words.shift().toLowerCase();
    args = words;

    if (commands.has(commandName)) {
      const command = commands.get(commandName);
      try {
        await command.execute(senderId, args, pageAccessToken, sendMessage);
      } catch (error) {
        console.error(`Error executing command ${commandName}:`, error);
        sendMessage(senderId, { text: error.message || 'There was an error executing that command.' }, pageAccessToken);
      }
      return;
    } else {
      sendMessage(senderId, {
        text: `Unknown command: "${commandName}". Type "help" or click "Help" below for a list of available commands.`,
        quick_replies: [
          {
            content_type: "text",
            title: "Help",
            payload: "HELP_PAYLOAD"
          }
        ]
      }, pageAccessToken);
    }
  } else if (event.message && event.message.reply_to) {
    try {
      const imageUrl = await getAttachments(event.message.reply_to.mid, pageAccessToken);
      sendMessage(senderId, { text: `Image URL: ${imageUrl}` }, pageAccessToken);
    } catch (error) {
      console.error("Error fetching image URL:", error);
      sendMessage(senderId, { text: error.message || 'Failed to fetch the image.' }, pageAccessToken);
    }
  } else {
    console.log('Received event without a valid message');
  }
}

module.exports = { handleMessage };
