const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "remini",
  description: "Process an image using the Remini API for enhancement.",
  author: "Mark Hitsuraan",

  async execute(chilli, pogi, kalamansi, event) {
    let imageUrl = "";

    // Check if the user replied to a message with an image attachment
    if (event.message.reply_to && event.message.reply_to.attachments && event.message.reply_to.attachments[0]?.type === 'image') {
      console.log("Reply detected, getting image from reply...");
      imageUrl = event.message.reply_to.attachments[0].payload.url;
    } 
    // Check if the current message contains an image attachment
    else if (event.message?.attachments && event.message.attachments[0]?.type === 'image') {
      console.log("Image attached to the current message.");
      imageUrl = event.message.attachments[0].payload.url;
    }

    // No image found, send error message
    if (!imageUrl) {
      return sendMessage(chilli, { text: "Please reply to an image or provide an image URL." }, kalamansi);
    }

    sendMessage(chilli, { text: "Processing image, please wait..." }, kalamansi);

    try {
      // Send the image to the Remini API for enhancement
      const response = await axios.get(`https://markdevs-last-api-2epw.onrender.com/api/remini?inputImage=${encodeURIComponent(imageUrl)}`);
      const processedImageURL = response.data.image_data;

      // Send the processed image back to the user
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
