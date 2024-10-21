const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'ashley',
  description: 'Get a response from Ashley API',
  usage: '-ashley <your message>',
  author: 'churchill',
  version: '1.0.0',
  async execute(senderId, args, pageAccessToken) {
    const chilli = args.join(' ');

    if (!chilli) {
      return sendMessage(senderId, { text: 'Please provide a prompt, for example: ashley How are you?' }, pageAccessToken);
    }

    const typingNotification = await sendMessage(senderId, { text: '⏳ Ashley is typing, please wait...' }, pageAccessToken);

    const apiUrl = `https://markdevs-last-api-t48o.onrender.com/api/ashley?query=${encodeURIComponent(chilli)}`;

    try {
      const response = await axios.get(apiUrl);
      const ashleyResponse = response.data.result || 'No response from Ashley.';

      const formattedResponse = 
`💬 | 𝘼𝙨𝙝𝙡𝙚𝙮'𝙨 𝙍𝙚𝙥𝙡𝙮

${ashleyResponse}`;

      await sendMessage(senderId, { text: formattedResponse }, pageAccessToken);

    } catch (maasim) {
      console.error('Error:', maasim);

      await sendMessage(senderId, { text: '❌ An error occurred. Please try again later.' }, pageAccessToken);
    }
  }
};
