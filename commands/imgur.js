const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'imgur',
  description: 'Upload an image to Imgur.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken, imageUrl) {
    if (!imageUrl) {
      return sendMessage(senderId, {
        text: 'No attachment detected. Please send an image or reply to an image first.'
      }, pageAccessToken);
    }

    await sendMessage(senderId, { text: 'Uploading the image to Imgur, please wait...' }, pageAccessToken);

    try {
      const response = await axios.get(`https://betadash-uploader.vercel.app/imgur?link=${encodeURIComponent(imageUrl)}`);
      
      // Check if the response contains the expected data
      const imgurLink = response?.data?.uploaded?.image;
      if (!imgurLink) {
        throw new Error('Imgur link not found in the response');
      }

      await sendMessage(senderId, {
        text: `Here is the Imgur link for the image you provided:\n\n${imgurLink}`
      }, pageAccessToken);
    } catch (error) {
      console.error('Error uploading image to Imgur:', error.response?.data || error.message);
      await sendMessage(senderId, {
        text: 'An error occurred while uploading the image to Imgur. Please try again later.'
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
    console.error('Failed to fetch attachments:', error.response?.data || error.message);
    throw new Error("Failed to retrieve the image.");
  }
}
