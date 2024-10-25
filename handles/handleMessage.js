const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { sendMessage } = require('./sendMessage');

const commands = new Map();
const prefix = ''; // No prefix needed
const lastImageByUser = new Map();

// Load all command files
const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`../commands/${file}`);
  commands.set(command.name.toLowerCase(), command);
  console.log(`Loaded command: ${command.name}`);
}

async function handleMessage(event, pageAccessToken) {
  if (!event || !event.sender || !event.sender.id) {
    console.error('Invalid event object');
    return;
  }

  const senderId = event.sender.id;
  let imageUrl = null;

  if (event.message && event.message.attachments) {
    const imageAttachment = event.message.attachments.find(att => att.type === 'image');
    if (imageAttachment) {
      imageUrl = imageAttachment.payload.url;
      lastImageByUser.set(senderId, imageUrl);
    }
  }

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

      if (commandName === 'gemini') {
        const lastImage = lastImageByUser.get(senderId);
        if (lastImage) {
          try {
            await command.execute(senderId, args, pageAccessToken, lastImage);
            lastImageByUser.delete(senderId);
          } catch (error) {
            await sendMessage(senderId, { text: 'An error occurred while explaining the image.' }, pageAccessToken);
          }
        } else {
          try {
            await command.execute(senderId, args, pageAccessToken);
          } catch (error) {
            await sendMessage(senderId, { text: 'There was an error processing your query.' }, pageAccessToken);
          }
        }
      } else {
        try {
          await command.execute(senderId, args, pageAccessToken, event, imageUrl);
        } catch (error) {
          console.error(`Error executing command "${commandName}": ${error.message}`, error);
          sendMessage(senderId, { text: `There was an error executing the command "${commandName}". Please try again later.` }, pageAccessToken);
        }
      }
    } else {
      sendMessage(senderId, {
        text: `Unknown command: "${commandName}". Type "help" or click help below for a list of available commands.`,
        quick_replies: [
          {
            content_type: "text",
            title: "Help",
            payload: "HELP_PAYLOAD"
          }
        ]
      }, pageAccessToken);
    }
  } else {
    console.error('Message or text is not present in the event.');
  }
}

module.exports = { handleMessage };
