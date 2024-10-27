const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'imgur',
  description: 'Upload an image to Imgur.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken, event, imageUrl) {
    let imageLink;

    if (imageUrl) {
      imageLink = imageUrl;
    } else if (event.message.reply_to && event.message.reply_to.mid) {
      try {
        imageLink = await getAttachments(event.message.reply_to.mid, pageAccessToken);
      } catch (error) {
        return sendMessage(senderId, {
          text: 'Failed to retrieve the image from the reply. Please try again.'
        }, pageAccessToken);
      }
    } else {
      return sendMessage(senderId, {
        text: 'No attachment detected. Please reply to an image.'
      }, pageAccessToken);
    }

    await sendMessage(senderId, { text: 'Uploading the image to Imgur, please wait...' }, pageAccessToken);

    try {
      const response = await axios.get(`https://betadash-uploader.vercel.app/imgur?link=${encodeURIComponent(imageLink)}`);
      const imgurLink = response.data.uploaded.image;

      await sendMessage(senderId, {
        text: `Here is the Imgur link for the image you provided:\n\n${imgurLink}`
      }, pageAccessToken);
    } catch (error) {
      console.error('Error uploading image to Imgur:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while uploading the image to Imgur. Please try again later.'
      }, pageAccessToken);
    }
  }
};

async function getAttachments(mid, pageAccessToken) {
  if (!mid) {
    throw new Error("No message ID provided.");
  }

  try {
    const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
      params: { access_token: pageAccessToken }
    });

    if (data && data.data.length > 0 && data.data[0].image_data) {
      return data.data[0].image_data.url;
    } else {
      throw new Error("No image found in the replied message.");
    }
  } catch (error) {
    console.error('Failed to fetch attachments:', error);
    throw new Error("Failed to retrieve the image.");
  }
}
