const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'poli',
  description: 'Generate an image based on a user-specified prompt using the Pollinations API.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(" ");
    if (!prompt) {
      return sendMessage(senderId, {
        text: 'Please provide a prompt for the image. Example usage: "poli cat and dog"',
      }, pageAccessToken);
    }

    await sendMessage(senderId, { text: `Generating an image for: "${prompt}", please wait... 🖼️` }, pageAccessToken);

    try {
      const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      const imageData = Buffer.from(response.data, 'binary').toString('base64');

      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            is_reusable: true,
            url: `data:image/jpeg;base64,${imageData}`
          }
        }
      }, pageAccessToken);

    } catch (error) {
      await sendMessage(senderId, {
        text: 'An error occurred while generating the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
