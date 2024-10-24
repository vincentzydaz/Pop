const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "remini",
  description: "Process an image using the Remini API for enhancement.",
  author: "Mark Hitsuraan",

  async execute(chilli, pogi, kalamansi, event) {
    let imageUrl = "";

    // Directly access the image from the reply
    if (event.message.reply_to && event.message.reply_to.attachments && event.message.reply_to.attachments[0]?.type === 'image') {
      imageUrl = event.message.reply_to.attachments[0].payload.url;
    } 
    // Check if the current message has an image attachment
    else if (event.message?.attachments && event.message.attachments[0]?.type === 'image') {
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
