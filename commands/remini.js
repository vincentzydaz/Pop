const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "remini",
  description: "Process an image using the Remini API for enhancement.",
  author: "chilli",

  async execute(chilli, pogi, kalamansi, event) {
    let imageUrl = "";

    async function getRepliedImage(mid, kalamansi) {
      const messageData = await getMessageById(mid, kalamansi);
      if (messageData.attachments && messageData.attachments[0]?.type === 'image') {
        return messageData.attachments[0].payload.url;
      }
      return null;
    }

    if (event.message.reply_to && event.message.reply_to.mid) {
      imageUrl = await getRepliedImage(event.message.reply_to.mid, kalamansi);
    } else if (event.message?.attachments && event.message.attachments[0]?.type === 'image') {
      imageUrl = event.message.attachments[0].payload.url;
    }

    if (!imageUrl) {
      return sendMessage(chilli, { text: "Please reply to an image or provide an image URL." }, kalamansi);
    }

    sendMessage(chilli, { text: "Generating..." }, kalamansi);

    try {
      const response = await axios.get(`https://markdevs-last-api-2epw.onrender.com/api/remini?inputImage=${encodeURIComponent(imageUrl)}`);
      const processedImageURL = response.data.image_data;

      await sendMessage(chilli, {
        attachment: {
          type: 'image',
          payload: {
            url: processedImageURL
          }
        }
      }, kalamansi);

    } catch (error) {
      console.error("Error in Remini command:", error);
      sendMessage(chilli, { text: `Error processing image: ${error.message || "Something went wrong."}` }, kalamansi);
    }
  }
};
