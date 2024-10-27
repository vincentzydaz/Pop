const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

// Helper function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  name: 'remini',
  description: 'Upscale an image using the Remini API.',
  author: 'Churchill',

  async execute(chilli, args, pageAccessToken, chilliEvent, chilliImageUrl) {
    // Check if image URL is provided or needs to be retrieved from reply
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
          text: 'Usage: To enhance an image, please reply to the image attachment with the command "remini". Note: This feature requires using Messenger, as Facebook Lite does not support reply functionality in page bots.'
        }, pageAccessToken);
      }
    }

    await sendMessage(chilli, { text: 'Enhancing the image, please wait... 🖼️' }, pageAccessToken);

    // Retry mechanism with 3 attempts and a delay between each attempt
    const reminiApiUrl = `https://ccprojectapis.ddns.net/api/upscale?url=${encodeURIComponent(chilliImageUrl)}&model=1`;
    let chilliUpscaledImageUrl;
    let success = false;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await axios.get(reminiApiUrl, { timeout: 15000 }); // 15 seconds timeout

        if (response.data && response.data.image_url) {
          chilliUpscaledImageUrl = response.data.image_url;
          success = true;
          break; // Exit loop if successful
        } else {
          throw new Error("Invalid response from the API");
        }
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);

        if (attempt < 3) {
          await delay(2000); // Wait 2 seconds before retrying
        } else {
          console.error('All attempts to upscale the image failed.');
        }
      }
    }

    if (success) {
      // Send the upscaled image back to the user
      await sendMessage(chilli, {
        attachment: {
          type: 'image',
          payload: {
            url: chilliUpscaledImageUrl
          }
        }
      }, pageAccessToken);
    } else {
      await sendMessage(chilli, {
        text: 'An error occurred while processing the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};

// Helper function to get the image URL from a reply message
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
