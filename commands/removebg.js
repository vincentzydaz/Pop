const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'removebg',
  description: 'Remove background from an image using the RemoveBG API.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken, event, imageUrl) {
    // Check if there is no image URL provided and handle it
    if (!imageUrl) {
      if (event.message.reply_to && event.message.reply_to.mid) {
        try {
          // Get the image URL from the replied message's attachment
          imageUrl = await getAttachments(event.message.reply_to.mid, pageAccessToken);
        } catch (error) {
          return sendMessage(senderId, {
            text: 'Failed to retrieve the image from the reply. Please try again.'
          }, pageAccessToken);
        }
      } else {
        return sendMessage(senderId, {
          text: 'Please reply to an image or send an image attachment for background removal.'
        }, pageAccessToken);
      }
    }

    // Notify the user that the bot is processing the image
    await sendMessage(senderId, { text: 'Processing the image, please wait... 🖼️' }, pageAccessToken);

    try {
      // Call the RemoveBG API with the retrieved image URL
      const removeBgUrl = `https://appjonellccapis.zapto.org/api/removebg?url=${encodeURIComponent(imageUrl)}`;

      // Send the processed image back to the user
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: removeBgUrl
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error removing background:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while processing the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};

// Get attachment function using Facebook Graph API
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

module.exports = { getAttachments };
