const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'ytsearch',
  description: 'Search for a YouTube video by title and retrieve its details.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken) {
    const query = args.join(' ');
    if (!query) {
      return sendMessage(senderId, {
        text: 'Please provide a search term to find a YouTube video.'
      }, pageAccessToken);
    }

    try {
      // Notify the user that the search is being performed
      await sendMessage(senderId, { text: `Searching for "${query}" on YouTube... 🔍` }, pageAccessToken);

      // Call the YouTube search API with the query
      const response = await axios.get(`https://kaiz-ytdlsearch-api.vercel.app/yts?q=${encodeURIComponent(query)}`);
      const videoData = response.data;

      // Send the video details as a message to the user
      await sendMessage(senderId, {
        text: `🎬 **${videoData.title}**\n\n👤 Author: ${videoData.author}\n👁️ Views: ${videoData.views.toLocaleString()}\n⏱️ Duration: ${videoData.duration}\n📅 Uploaded: ${videoData.uploaded}\n\n📝 Description: ${videoData.description}`
      }, pageAccessToken);

      // Send the video URL as an attachment in the next message
      await sendMessage(senderId, {
        attachment: {
          type: 'video',
          payload: {
            url: videoData.url
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error fetching video details:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while searching for the video. Please try again later.'
      }, pageAccessToken);
    }
  }
};
