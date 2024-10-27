const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { sendMessage } = require('./sendMessage');

const commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`../commands/${file}`);
  if (command.name && typeof command.name === 'string') {
    commands.set(command.name.toLowerCase(), command);
  }
}

const tiktokRegex = /https?:\/\/(www\.)?tiktok\.com\/[^\s/?#]+\/?|https?:\/\/vt\.tiktok\.com\/[^\s/?#]+\/?/;
const facebookLinkRegex = /https:\/\/www\.facebook\.com\/\S+/;

async function handleMessage(event, pageAccessToken) {
  if (!event || !event.sender || !event.sender.id) {
    return;
  }

  const senderId = event.sender.id;

  if (event.message && event.message.text) {
    const messageText = event.message.text.trim();

    // Facebook video handling
    if (facebookLinkRegex.test(messageText)) {
      await sendMessage(senderId, { text: 'Downloading your Facebook video, please wait...' }, pageAccessToken);

      try {
        const response = await axios.get(`https://betadash-search-download.vercel.app/fbdl?url=${encodeURIComponent(messageText)}`);
        const videoUrl = response.data?.sd || response.data?.hd;

        if (videoUrl) {
          await sendMessage(senderId, {
            attachment: {
              type: 'video',
              payload: {
                url: videoUrl,
                is_reusable: true
              }
            }
          }, pageAccessToken);
        } else {
          await sendMessage(senderId, { text: 'Failed to retrieve Facebook video URL. Please check the URL and try again.' }, pageAccessToken);
        }
      } catch (error) {
        console.error("Error fetching Facebook video:", error.message);
        await sendMessage(senderId, { text: 'An error occurred while downloading the Facebook video. Please try again later.' }, pageAccessToken);
      }
      return;
    }

    // TikTok video handling
    if (tiktokRegex.test(messageText)) {
      await sendMessage(senderId, { text: 'Downloading your TikTok video, please wait...' }, pageAccessToken);
      try {
        const response = await axios.post(`https://www.tikwm.com/api/`, { url: messageText });
        const data = response.data.data;
        const shotiUrl = data.play;

        if (shotiUrl) {
          await sendMessage(senderId, {
            attachment: {
              type: 'video',
              payload: {
                url: shotiUrl,
                is_reusable: true
              }
            }
          }, pageAccessToken);
        } else {
          await sendMessage(senderId, { text: 'Failed to retrieve TikTok video URL. Please check the URL and try again.' }, pageAccessToken);
        }
      } catch (error) {
        console.error("Error fetching TikTok video:", error);
        await sendMessage(senderId, { text: 'An error occurred while downloading the TikTok video. Please try again later.' }, pageAccessToken);
      }
      return;
    }

    // Command handling
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

    if (commands.has(commandName)) {
      const command = commands.get(commandName);
      try {
        let imageUrl = '';
        if (event.message.reply_to && event.message.reply_to.mid) {
          try {
            imageUrl = await getAttachments(event.message.reply_to.mid, pageAccessToken);
          } catch (error) {
            imageUrl = '';
          }
        } else if (event.message.attachments && event.message.attachments[0]?.type === 'image') {
          imageUrl = event.message.attachments[0].payload.url;
        }

        await command.execute(senderId, args, pageAccessToken, event, imageUrl);
      } catch (error) {
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
  }
}

async function getAttachments(mid, pageAccessToken) {
  if (!mid) {
    throw new Error("No message ID provided.");
  }

  try {
    const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
      params: { access_token: pageAccessToken }
    });

    if (data && data.data.length > 0 && data.data[0].image_data) {
      return data.data[0].image_data.url;
    } else {
      throw new Error("No image found in the replied message.");
    }
  } catch (error) {
    throw new Error("Failed to fetch attachments.");
  }
}

module.exports = { handleMessage };
