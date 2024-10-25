const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'women',
  description: 'Send a women video memes',
  usage: 'women',
  author: 'churchillitos',
  async execute(senderId, args, pageAccessToken) {
    const videoUrl = "https://drive.google.com/uc?export=download&id=1-I6pdDl_xY2CUqeBpkqEk76SPnqyGHsa";

    try {
      await sendMessage(senderId, { text: "KAPE☕" }, pageAccessToken);
      console.log('Text message sent.');

      await sendMessage(senderId, {
        attachment: {
          type: 'video',
          payload: {
            url: videoUrl
          }
        }
      }, pageAccessToken);
      console.log('Video sent successfully.');
    } catch (error) {
      console.error('Error in women command:', error);
      await sendMessage(senderId, {
        text: `An error occurred while processing the command: ${error.message}`
      }, pageAccessToken);
    }
  }
};
