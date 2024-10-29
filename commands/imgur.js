const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'imgur',
  description: 'Upload an image or video to Imgur.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken, event) {
    // Add debug logging to check the contents of the event object
    console.log('Received event object:', JSON.stringify(event, null, 2));

    // Extract media URL from the event object
    let mediaUrl = null;

    // Check if the event contains image or video attachments
    if (event.message && event.message.attachments) {
      const imageAttachment = event.message.attachments.find(att => att.type === 'image');
      const videoAttachment = event.message.attachments.find(att => att.type === 'video');

      if (imageAttachment) {
        mediaUrl = imageAttachment.payload.url;
      } else if (videoAttachment) {
        mediaUrl = videoAttachment.payload.url;
      }
    }

    // If no media was found, send a message to the user
    if (!mediaUrl) {
      return sendMessage(senderId, {
        text: 'Please send an image or video first, then type "imgur" to upload. kupal ka'
      }, pageAccessToken);
    }

    // Notify the user that the upload is in progress
    await sendMessage(senderId, { text: 'Uploading the image to Imgur, please wait...' }, pageAccessToken);

    try {
      const response = await axios.get(`https://betadash-uploader.vercel.app/imgur?link=${encodeURIComponent(mediaUrl)}`);
      const imgurLink = response?.data?.uploaded?.image;

      // Check if the response contains the Imgur link
      if (!imgurLink) {
        throw new Error('Imgur link not found in the response');
      }

      // Send the Imgur link back to the user
      await sendMessage(senderId, {
        text: `Here is the Imgur link for the media you provided:\n\n${imgurLink}`
      }, pageAccessToken);
    } catch (error) {
      console.error('Error uploading media to Imgur:', error.response?.data || error.message);
      await sendMessage(senderId, {
        text: 'An error occurred while uploading the media to Imgur. Please try again later.'
      }, pageAccessToken);
    }
  }
};
