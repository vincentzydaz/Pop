const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { sendMessage } = require('./sendMessage');

const prefix = '';
const commands = new Map();

const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`../commands/${file}`);
  if (command.name && typeof command.name === 'string') {
    commands.set(command.name.toLowerCase(), command);
    console.log(`Loaded command: ${command.name}`);
  } else {
    console.warn(`Command file "${file}" is missing a valid "name" property.`);
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
    console.log(`Received message: ${messageText}`);

    // Updated regex patterns for Instagram, Facebook, and TikTok URLs
    const instagramFacebookRegex = /https?:\/\/(www\.)?(instagram\.com|facebook\.com|fb\.watch)\/[^\s/?#]+\/?/;
    const tiktokRegex = /https?:\/\/(www\.)?tiktok\.com\/[^\s/?#]+\/?|https?:\/\/vt\.tiktok\.com\/[^\s/?#]+\/?/;

    if (instagramFacebookRegex.test(messageText)) {
      await sendMessage(senderId, { text: 'Downloading your Facebook/Instagram video, please wait...' }, pageAccessToken);
      try {
        const response = await axios.get(`https://betadash-search-download.vercel.app/fbdl?url=${messageText}`);
        const videoUrl = response.data.url;

        await sendMessage(senderId, {
          attachment: {
            type: 'video',
            payload: {
              url: videoUrl,
              is_reusable: true
            }
          }
        }, pageAccessToken);
      } catch (error) {
        console.error('Error downloading Facebook/Instagram video:', error);
        await sendMessage(senderId, { text: 'An error occurred while downloading the video. Please try again later.' }, pageAccessToken);
      }
      return;
    } else if (tiktokRegex.test(messageText)) {
      await sendMessage(senderId, { text: 'Downloading your TikTok video, please wait...' }, pageAccessToken);
      try {
        const response = await axios.post(`https://www.tikwm.com/api/`, { url: messageText });
        const data = response.data.data;
        const shotiUrl = data.play;

        await sendMessage(senderId, {
          attachment: {
            type: 'video',
            payload: {
              url: shotiUrl,
              is_reusable: true
            }
          }
        }, pageAccessToken);
      } catch (error) {
        console.error('Error downloading TikTok video:', error);
        await sendMessage(senderId, { text: 'An error occurred while downloading the TikTok video. Please try again later.' }, pageAccessToken);
      }
      return;
    }

    let commandName, args;
    if (messageText.startsWith('-')) {
      const argsArray = messageText.slice(1).trim().split(/\s+/);
      commandName = argsArray.shift().toLowerCase();
      args = argsArray;
    } else {
      const words = messageText.trim().split(/\s+/);
      commandName = words.shift().toLowerCase();
      args = words;
    }

    console.log(`Parsed command: ${commandName} with arguments: ${args}`);

    if (commands.has(commandName)) {
      const command = commands.get(commandName);
      try {
        let imageUrl = '';
        if (event.message.reply_to && event.message.reply_to.mid) {
          try {
            imageUrl = await getAttachments(event.message.reply_to.mid, pageAccessToken);
          } catch (error) {
            console.error("Failed to get attachment:", error);
            imageUrl = '';
          }
        } else if (event.message.attachments && event.message.attachments[0]?.type === 'image') {
          imageUrl = event.message.attachments[0].payload.url;
        }

        await command.execute(senderId, args, pageAccessToken, event, imageUrl);
      } catch (error) {
        console.error(`Error executing command "${commandName}": ${error.message}`, error);
        sendMessage(senderId, { text: `There was an error executing the command "${commandName}". Please try again later.` }, pageAccessToken);
      }
    } else {
      sendMessage(senderId, {
        text: `Unknown command: "${commandName}". Type "help" for a list of available commands.`,
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
