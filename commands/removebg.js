const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'removebg',
  description: 'Remove background from an image using the RemoveBG API.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken, event) {
    // Check for the last image from the user
    const imageUrl = lastImageByUser.get(senderId);

    if (!imageUrl) {
      return sendMessage(senderId, {
        text: `Please send an image first, then type "removebg" to remove its background.`
      }, pageAccessToken);
    }

    await sendMessage(senderId, { text: 'Removing bg from the image, please wait... 🖼️' }, pageAccessToken);

    try {
      // Use the custom remove background API endpoint
      const removeBgUrl = `https://appjonellccapis.zapto.org/api/removebg?url=${encodeURIComponent(imageUrl)}`;

      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: removeBgUrl
          }
        }
      }, pageAccessToken);

      // Clear the last image to avoid reusing it
      lastImageByUser.delete(senderId);

    } catch (error) {
      console.error('Error removing background:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while processing the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
