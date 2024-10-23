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
    if (messageText.startsWith(prefix)) {
      const argsArray = messageText.slice(prefix.length).split(' ');
      commandName = argsArray.shift().toLowerCase();
      args = argsArray;
    } else {
      const words = messageText.split(' ');
      commandName = words.shift().toLowerCase();
      args = words;
    }

    if (commands.has(commandName)) {
      const command = commands.get(commandName);
      try {
        // Fetch image URL if the message is a reply to an image
        let imageUrl = "";
        if (event.message && event.message.reply_to && event.message.reply_to.mid) {
          imageUrl = await getAttachments(event.message.reply_to.mid, pageAccessToken);
        } else if (event.attachments && event.attachments[0]?.type === 'image') {
          imageUrl = event.attachments[0].payload.url;
        }

        // Pass imageUrl along with args to the command
        await command.execute(senderId, args, pageAccessToken, event, imageUrl);
      } catch (error) {
        console.error(`Error executing command ${commandName}:`, error);
        if (error.message) {
          sendMessage(senderId, { text: error.message }, pageAccessToken);
        } else {
          sendMessage(senderId, { text: 'There was an error executing that command.' }, pageAccessToken);
        }
      }
      return;
    }
  } else if (event.message) {
    console.log('Received message without text');
  } else {
    console.log('Received event without message');
  }
}

async function getAttachments(mid, pageAccessToken) {
  if (!mid) throw new Error("No message ID provided.");

  const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
    params: { access_token: pageAccessToken }
  });

  if (data && data.data.length > 0 && data.data[0].image_data) {
    return data.data[0].image_data.url;  // Return the image URL
  } else {
    throw new Error("No image found in the replied message.");
  }
}

module.exports = { handleMessage };
