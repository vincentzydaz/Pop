const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'ringtone',
  description: 'Search and send the first ringtone result based on a keyword.',
  usage: 'ringtone <keyword>\nExample: ringtone samsung',
  author: 'your_username',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide a keyword to search for ringtones.\n\nUsage:\n ringtone <keyword>\nExample: ringtone samsung'
      }, pageAccessToken);
      return;
    }

    const query = args.join(' ');
    const apiUrl = `https://markdevs69v2-679r.onrender.com/api/search/ringtone?text=${encodeURIComponent(query)}`;

    await sendMessage(senderId, { text: 'Searching for ringtones... Please wait.' }, pageAccessToken);

    try {
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (data.status && data.result.length > 0) {
        const ringtone = data.result[0]; // Get the first ringtone result

        await sendMessage(senderId, {
          attachment: {
            type: 'audio',
            payload: {
              url: ringtone.audio
            }
          }
        }, pageAccessToken);

        await sendMessage(senderId, {
          text: `Here is the first result for "${query}":\n\nTitle: ${ringtone.title}\nSource: ${ringtone.source}`
        }, pageAccessToken);

      } else {
        await sendMessage(senderId, { text: 'No ringtones found. Try a different keyword.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error fetching ringtones:', error);
      await sendMessage(senderId, { text: 'An error occurred while fetching ringtones. Please try again later.' }, pageAccessToken);
    }
  }
};
