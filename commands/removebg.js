const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'removebg',
  description: 'Remove background from an image using the RemoveBG API and Facebook Graph API.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken, event) {
    // Check if there's an image in the incoming event
    const attachments = event.message && event.message.attachments;
    const imageAttachment = attachments && attachments.find(att => att.type === 'image');

    if (!imageAttachment) {
      await sendMessage(senderId, {
        text: `Please send an image first, then type "removebg" to remove its background.kupal`
      }, pageAccessToken);
      return;
    }

    try {
      // Get the image URL via Facebook Graph API using the attachment ID
      const attachmentId = imageAttachment.payload.id;
      const graphApiUrl = `https://graph.facebook.com/v16.0/${attachmentId}?fields=url&access_token=${pageAccessToken}`;

      const response = await axios.get(graphApiUrl);
      const imageUrl = response.data.url;

      await sendMessage(senderId, { text: 'Removing background from the image, please wait... 🖼️' }, pageAccessToken);

      // Remove background using custom API
      const removeBgUrl = `https://appjonellccapis.zapto.org/api/removebg?url=${encodeURIComponent(imageUrl)}`;
      
      // Send the processed image back to the user
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: removeBgUrl
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error removing background:', error.message || error);
      await sendMessage(senderId, {
        text: 'An error occurred while processing the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
