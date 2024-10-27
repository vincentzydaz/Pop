const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'video',
  description: 'Search for a video using a keyword and send the video file.',
  usage: 'video <search term>\nExample: video cat videos',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide a search term.\n\nUsage:\n video <search term>\nExample: video cat videos'
      }, pageAccessToken);
      return;
    }

    const searchTerm = args.join(' ');
    const apiUrl = `https://betadash-search-download.vercel.app/video?search=${encodeURIComponent(searchTerm)}`;

    try {
      // Send "searching" message
      await sendMessage(senderId, { text: `🔍 Searching for video: ${searchTerm}` }, pageAccessToken);

      // Fetch video data
      const response = await axios.get(apiUrl);
      const { title, downloadUrl } = response.data;

      // Send the video directly using the URL
      await sendMessage(senderId, {
        attachment: {
          type: 'video',
          payload: {
            url: downloadUrl
          }
        },
        text: `🎬 Here is the video: ${title}`
      }, pageAccessToken);

    } catch (error) {
      console.error('Error fetching or sending video:', error);
      await sendMessage(senderId, {
        text: 'Failed to fetch or send the video. Please try again later.'
      }, pageAccessToken);
    }
  }
};
