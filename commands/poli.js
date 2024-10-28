const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'poli',
  description: 'Generate an image based on a prompt using Pollinations.',
  usage: 'poli <prompt>\nExample: poli cat',
  author: 'Developer',
  async execute(senderId, args, pageAccessToken) {
    // Validate prompt input
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide a prompt to generate an image.\n\nUsage:\n poli <prompt>\nExample: poli cat'
      }, pageAccessToken);
      return;
    }

    const query = args.join(' ');

    // Notify user about image search
    await sendMessage(senderId, { text: `Searching for "${query}"...` }, pageAccessToken);

    try {
      // Request image from Pollinations API
      const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(query)}`, {
        responseType: 'arraybuffer',
      });
      
      const imageBuffer = Buffer.from(response.data, 'utf-8');

      // Send the generated image as an attachment
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: `data:image/png;base64,${imageBuffer.toString('base64')}`,
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
