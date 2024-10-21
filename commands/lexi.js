
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'lexi',
  description: 'Generate a lexi post  with text',
  usage: 'lexi <post>',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide the text for the lexi post. ex: lexi ugh' }, pageAccessToken);
      return;
    }

    const text = args.join(' ');
    const apiUrl = `https://api-canvass.vercel.app/lexi?text=${encodeURIComponent(text)}`;

    try {
      await sendMessage(senderId, { 
        attachment: { 
          type: 'image', 
          payload: { url: apiUrl } 
        } 
      }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Could not generate canvas image.' }, pageAccessToken);
    }
  }
};
