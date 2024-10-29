const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const lastMediaByUser = new Map();

module.exports = {
  name: 'imgur',
  description: 'Upload an image or video to Imgur.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken, event) {
    // Check if there's an attachment in the message
    if (event.message && event.message.attachments) {
      const imageAttachment = event.message.attachments.find(att => att.type === 'image');
      const videoAttachment = event.message.attachments.find(att => att.type === 'video');

      // Save the last image or video by user ID
      if (imageAttachment) {
        lastMediaByUser.set(senderId, imageAttachment.payload.url);
      } else if (videoAttachment) {
        lastMediaByUser.set(senderId, videoAttachment.payload.url);
      }

      await sendMessage(senderId, {
        text: 'Image or video received! Type "imgur" to upload it.'
      }, pageAccessToken);
      return;
    }

    // Check if the command is "imgur" without attachments
    if (event.message && event.message.text.trim().toLowerCase() === 'imgur') {
      const mediaUrl = lastMediaByUser.get(senderId);

      if (!mediaUrl) {
        await sendMessage(senderId, {
          text: 'Please send an image or video first, then type "imgur" to upload.'
        }, pageAccessToken);
        return;
      }

      await sendMessage(senderId, { text: 'Uploading the media to Imgur, please wait...' }, pageAccessToken);

      try {
        const response = await axios.get(`https://betadash-uploader.vercel.app/imgur?link=${encodeURIComponent(mediaUrl)}`);
        const imgurLink = response?.data?.uploaded?.image;

        if (!imgurLink) {
          throw new Error('Imgur link not found in the response');
        }

        await sendMessage(senderId, {
          text: `Here is the Imgur link for the image or video you provided:\n\n${imgurLink}`
        }, pageAccessToken);

        // Clear the last saved media after successful upload
        lastMediaByUser.delete(senderId);
      } catch (error) {
        console.error('Error uploading media to Imgur:', error.response?.data || error.message);
        await sendMessage(senderId, {
          text: 'An error occurred while uploading the media to Imgur. Please try again later.'
        }, pageAccessToken);
      }
    }
  }
};
