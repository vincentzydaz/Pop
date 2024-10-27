const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'fbdl',
  description: 'Download a video from Facebook using the fbdl API.',
  author: 'chilli',
  usage: 'fbdl <Facebook video URL>\n\nNote: This tool may not support downloading videos longer than 40 seconds.\n\nExample: fbdl https://www.facebook.com/100078963403034/videos/605378041055244/',

  async execute(senderId, args, pageAccessToken) {
    if (!args[0]) {
      return sendMessage(senderId, {
        text: 'Usage: fbdl <Facebook video URL>\n\nNote: This tool may not support downloading longer videos\n\nExample: fbdl https://www.facebook.com/100078963403034/videos/605378041055244/'
      }, pageAccessToken);
    }

    const videoUrl = args[0];
    const apiEndpoint = `https://betadash-search-download.vercel.app/fbdl?url=${encodeURIComponent(videoUrl)}`;

    await sendMessage(senderId, { text: 'downloading the video, please wait...' }, pageAccessToken);

    try {
      const response = await axios.get(apiEndpoint);

      if (response.data && response.data.downloadUrl) {
        await sendMessage(senderId, {
          attachment: {
            type: 'video',
            payload: {
              url: response.data.downloadUrl
            }
          }
        }, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: 'Failed to retrieve the download link. Please check the video URL and try again.'
        }, pageAccessToken);
      }

    } catch (error) {
      console.error('Error downloading video:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while fetching the video. Please try again later.'
      }, pageAccessToken);
    }
  }
};
