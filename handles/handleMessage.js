const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { sendMessage } = require('./sendMessage');

const commands = new Map();
const lastImageByUser = new Map();
const lastVideoByUser = new Map();

const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`../commands/${file}`);
  if (command.name && typeof command.name === 'string') {
    commands.set(command.name.toLowerCase(), command);
  }
}

const tiktokRegex = /https?:\/\/(www\.)?tiktok\.com\/[^\s/?#]+\/?|https?:\/\/vt\.tiktok\.com\/[^\s/?#]+\/?/;

async function handleMessage(event, pageAccessToken) {
  if (!event || !event.sender || !event.sender.id) return;

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

    // TikTok URL detection and downloading
    if (tiktokRegex.test(messageText)) {
      await sendMessage(senderId, { text: 'Downloading your TikTok video, please wait...' }, pageAccessToken);
      try {
        const response = await axios.post(`https://www.tikwm.com/api/`, { url: messageText });
        if (response.data && response.data.data && response.data.data.play) {
          const shotiUrl = response.data.data.play;

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
          console.error("Unexpected response structure:", response.data);
          await sendMessage(senderId, { text: 'Failed to retrieve TikTok video URL. Please check the URL and try again.' }, pageAccessToken);
        }
      } catch (error) {
        console.error("Error fetching TikTok video:", error.response ? error.response.data : error.message);
        await sendMessage(senderId, { text: 'An error occurred while downloading the TikTok video. Please try again later.' }, pageAccessToken);
      }
      return;
    }

    // Command handling
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
        await sendMessage(senderId, {
          text: 'Please send an image first, then type "removebg" to remove its background.'
        }, pageAccessToken);
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
          await sendMessage(senderId, { text: 'An error occurred while uploading the media to Imgur.' }, pageAccessToken);
        }
      } else {
        await sendMessage(senderId, { text: 'Please send an image or video first, then type "imgur" to upload.' }, pageAccessToken);
      }
      return;
    }

    if (messageText.startsWith('gemini')) {
      const lastImage = lastImageByUser.get(senderId);
      const args = messageText.split(/\s+/).slice(1);

      try {
        await commands.get('gemini').execute(senderId, args, pageAccessToken, event, lastImage);
        lastImageByUser.delete(senderId);
      } catch (error) {
        await sendMessage(senderId, { text: 'An error occurred while processing the Gemini command.' }, pageAccessToken);
      }
      return;
    }

    // General command handling
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
        await command.execute(senderId, args, pageAccessToken, event);
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

module.exports = { handleMessage };
