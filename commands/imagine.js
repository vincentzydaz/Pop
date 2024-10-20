const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'imagine',
  description: 'Generates an image based on the provided prompt.',
  author: 'Chilli',

  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a prompt for image generation.' }, pageAccessToken);
      return;
    }

    const prompt = args.join(' '); // Ensure all arguments are joined with spaces

    try {
      await sendMessage(senderId, { text: 'Generating image, please wait...' }, pageAccessToken);

      // Encode the prompt to handle any special characters and spaces
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
