const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'poli',
  description: 'Generate an image based on a prompt using Pollinations.',
  usage: 'poli <prompt>\nExample: poli cat',
  author: 'chill',
  async execute(senderId, args, pageAccessToken) {
    // Validate prompt input
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide a prompt to generate an image.\n\nUsage:\n poli <prompt>\nExample: poli dog'
      }, pageAccessToken);
      return;
    }

    const query = args.join(' ');

    // Notify user about image search
    await sendMessage(senderId, { text: `Searching for "${query}"...` }, pageAccessToken);

    try {
      // Construct the Pollinations API URL
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(query)}`;

      // Send the generated image as an attachment
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: imageUrl,
            is_reusable: true
          }
        },
        text: 'Download Successfully!'
      }, pageAccessToken);

    } catch (error) {
      console.error('Error generating image:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while generating the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
