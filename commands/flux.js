const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'flux',
  description: 'Generate an image based on a query using the Flux API.',
  author: 'chilli',
  usage: 'flux <query>', // Example usage

  async execute(kupal, args, chilli) {
    const query = args.join(' ');
    if (!query) {
      return sendMessage(kupal, { text: 'Usage: flux <query>\nExample: flux cat' }, chilli);
    }

    try {
      const { data: fluxResponse } = await axios.get(`https://nethwieginedev.vercel.app/flux?q=${encodeURIComponent(query)}`);
      
      if (fluxResponse && fluxResponse.image_url) {
        await sendMessage(kupal, { attachment: { type: 'image', payload: { url: fluxResponse.image_url } } }, chilli);
      } else {
        await sendMessage(kupal, { text: 'Failed to retrieve an image. Please try again.' }, chilli);
      }
    } catch (error) {
      console.error('Error fetching image from Flux API:', error);
      await sendMessage(kupal, { text: 'An error occurred while generating the image. Please try again.' }, chilli);
    }
  }
};
