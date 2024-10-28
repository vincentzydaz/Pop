const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'poli',
  description: 'Generate an image based on a user-specified prompt using the Pollinations API.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken) {
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a prompt for the image. Example usage: "poli cat and dog"' }, pageAccessToken);
      return;
    }

    const prompt = args.join(" ");
    await sendMessage(senderId, { text: `Generating an image for: "${prompt}", please wait... 🖼️` }, pageAccessToken);

    try {
      const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: apiUrl
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error generating image:', error);
      await sendMessage(senderId, { text: 'An error occurred while generating the image. Please try again later.' }, pageAccessToken);
    }
  }
};
