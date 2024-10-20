const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'imagine',
  description: 'Generates an image based on the provided prompt.',
  author: 'Chilli',

  async execute(chilli, args, pogi) {
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(chilli, { text: 'Please provide a prompt for image generation. ex: imagine cat with a wing' }, pogi);
      return;
    }

    const prompt = args.join(' ');

    try {
      await sendMessage(chilli, { text: 'Generating image, please wait...' }, pogi);

      const apiUrl = `https://ccprojectapis.ddns.net/api/imgen?prompt=${encodeURIComponent(prompt)}`;
      const response = await axios.get(apiUrl);

      if (!response.data || !response.data.url) {
        throw new Error('No image URL found in the API response');
      }

      const imageUrl = response.data.url;

      await sendMessage(chilli, { 
        attachment: { 
          type: 'image', 
          payload: { 
            url: imageUrl 
          } 
        } 
      }, pogi);

    } catch (error) {
      console.error('Error generating the image:', error);
      await sendMessage(chilli, { text: 'Error: Could not generate image. Please try again later.' }, pogi);
    }
  }
};
