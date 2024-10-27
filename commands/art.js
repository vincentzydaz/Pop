const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'flux',
  description: 'Generate an image based on a query using the Flux API.',
  author: 'chilli',
  usage: 'flux <query>',

  async execute(senderId, args, pageAccessToken) {
    const query = args.join(' ');
    if (!query) {
      return sendMessage(senderId, { text: 'Usage: flux <query>\nExample: flux cat' }, pageAccessToken);
    }

    await sendMessage(senderId, { text: 'Generating image... Please wait.' }, pageAccessToken);

    try {
      const { data: fluxResponse } = await axios.get(`https://nethwieginedev.vercel.app/flux?q=${encodeURIComponent(query)}`);
      
      if (fluxResponse && fluxResponse.image_url) {
        await sendMessage(senderId, {
          attachment: {
            type: 'image',
            payload: {
              url: fluxResponse.image_url
            }
          }
        }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: 'Failed to retrieve an image. Please try again.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error fetching image from Flux API:', error);
      await sendMessage(senderId, { text: 'An error occurred while generating the image. Please try again.' }, pageAccessToken);
    }
  }
};
