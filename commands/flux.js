const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'flux',
  description: 'Generate an image based on a given prompt using the Flux API.',
  usage: '-flux <prompt> [model 1-5]\nExample without model: -flux dog\nExample with model: -flux dog 5',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide a prompt to generate an image.\n\nUsage:\n-flux <prompt> [model 1-5]\nExample without model: -flux dog\nExample with model: -flux dog 5'
      }, pageAccessToken);
      return;
    }

    let model = 4;
    const lastArg = args[args.length - 1];
    if (/^[1-5]$/.test(lastArg)) {
      model = lastArg;
      args.pop();
    }

    const prompt = args.join(' ');
    const apiUrl = `https://joshweb.click/api/flux?prompt=${encodeURIComponent(prompt)}&model=${model}`;

    await sendMessage(senderId, { text: 'Generating image... Please wait.' }, pageAccessToken);

    try {
      const response = await axios({
        method: 'GET',
        url: apiUrl,
        responseType: 'stream',
      });

      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            is_reusable: true
          },
          url: apiUrl
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error generating image:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while generating the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
