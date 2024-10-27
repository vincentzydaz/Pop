const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'remini',
  description: 'Upscale an image using the Remini API.',
  author: 'Churchill',

  async execute(chilli, args, pageAccessToken, chilliEvent, chilliImageUrl) {
    if (!chilliImageUrl) {
      if (chilliEvent.message.reply_to && chilliEvent.message.reply_to.mid) {
        try {
          chilliImageUrl = await getAttachments(chilliEvent.message.reply_to.mid, pageAccessToken);
        } catch (error) {
          return sendMessage(chilli, {
            text: 'Failed to retrieve the image from the reply. Please try again.'
          }, pageAccessToken);
        }
      } else {
        return sendMessage(chilli, {
          text: 'Usage: To upscale an image, please reply to the image attachment with the command "remini". Note: This feature requires using Messenger, as Facebook Lite does not support reply functionality in page bots.'
        }, pageAccessToken);
      }
    }

    await sendMessage(chilli, { text: 'Upscaling the image, please wait... 🖼️' }, pageAccessToken);

    try {
      const reminiApiUrl = `https://ccprojectapis.ddns.net/api/upscale?url=${encodeURIComponent(chilliImageUrl)}&model=1`;
      const response = await axios.get(reminiApiUrl);
      const chilliUpscaledImageUrl = response.data.image_url;

      await sendMessage(chilli, {
        attachment: {
          type: 'image',
          payload: {
            url: chilliUpscaledImageUrl
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error upscaling image:', error);
      await sendMessage(chilli, {
        text: 'An error occurred while processing the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};

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
    console.error('Failed to fetch attachments:', error);
    throw new Error("Failed to retrieve the image.");
  }
}
