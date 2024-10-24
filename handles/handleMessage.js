const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { sendMessage } = require('./sendMessage');

const commands = new Map();
const prefix = ''; // No prefix needed

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

  if (event.message && event.message.text) {
    const messageText = event.message.text.trim();
    console.log(`Received message: ${messageText}`);

    // No need for prefix; we will just split the message directly
    let commandName, args;
    const words = messageText.split(' ');
    commandName = words.shift().toLowerCase(); // Get the first word as the command
    args = words; // The rest are arguments

    console.log(`Parsed command: ${commandName} with arguments: ${args}`);

    if (commands.has(commandName)) {
      const command = commands.get(commandName);
      try {
        let imageUrl = '';
        // Check if replying to a message with an attachment
        if (event.message.reply_to && event.message.reply_to.mid) {
          try {
            imageUrl = await getAttachments(event.message.reply_to.mid, pageAccessToken);
          } catch (error) {
            console.error("Failed to get attachment:", error);
            imageUrl = ''; // Ensure imageUrl is empty if it fails
          }
        } else if (event.message.attachments && event.message.attachments[0]?.type === 'image') {
          imageUrl = event.message.attachments[0].payload.url;
        }

        // Execute the command
        await command.execute(senderId, args, pageAccessToken, event, imageUrl);
      } catch (error) {
        console.error(`Error executing command "${commandName}": ${error.message}`, error);
        sendMessage(senderId, { text: `There was an error executing the command "${commandName}". Please try again later.` }, pageAccessToken);
      }
    } else {
      // Handle unknown commands
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

// Helper function to get attachments
async function getAttachments(mid, pageAccessToken) {
  if (!mid) {
    console.error("No message ID provided for getAttachments.");
    throw new Error("No message ID provided.");
  }

  try {
    const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
      params: { access_token: pageAccessToken }
    });

    if (data && data.data.length > 0 && data.data[0].image_data) {
      return data.data[0].image_data.url;
    } else {
      console.error("No image found in the replied message.");
      throw new Error("No image found in the replied message.");
    }
  } catch (error) {
    console.error("Error fetching attachments:", error);
    throw new Error("Failed to fetch attachments.");
  }
}

module.exports = { handleMessage };
