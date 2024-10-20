const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'imagine',
  description: 'Generates an image based on the provided prompt.',
  author: 'Chilli',

  async execute(senderId, args, pageAccessToken) {
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a prompt for image generation.' }, pageAccessToken);
      return;
    }

    const prompt = args.join(' '); // Combine the arguments into a full prompt with spaces

    try {
      await sendMessage(senderId, { text: 'Generating image, please wait...' }, pageAccessToken);

      // Make sure the prompt is properly encoded to handle spaces and special characters
      const apiUrl = `https://ccprojectapis.ddns.net/api/imgen?prompt=${encodeURIComponent(prompt)}`;

      await sendMessage(senderId, { 
        attachment: { 
          type: 'image', 
          payload: { 
            url: apiUrl 
          } 
        } 
      }, pageAccessToken);

    } catch (error) {
      console.error('Error generating the image:', error);
      await sendMessage(senderId, { text: 'Error: Could not generate image. Please try again later.' }, pageAccessToken);
    }
  }
};
