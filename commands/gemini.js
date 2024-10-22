const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "gemini",
  description: "Use the Gemini API to analyze an image and provide a response.",
  author: "Churchill",

  async execute(pogi, chilli, maasim) {
    // Check if the message is a reply to another message
    const repliedMessage = chilli.reply_to;

    // Check if the replied message contains an image attachment
    let imageUrl = null;
    if (repliedMessage && repliedMessage.attachments && repliedMessage.attachments.length > 0) {
      const attachment = repliedMessage.attachments[0];
      if (attachment.type === "image") {
        imageUrl = attachment.payload.url;
      }
    }

    // If no image URL was found, notify the user
    if (!imageUrl) {
      return sendMessage(pogi, { text: "Please reply to an image attachment to use the Gemini command." }, maasim);
    }

    const query = chilli.text.split(" ").slice(1).join(" ").trim() || "describe";

    sendMessage(pogi, { text: `Analyzing the image...` }, maasim);

    try {
      const response = await axios.get("https://ccprojectapis.ddns.net/api/gemini", {
        params: {
          ask: query,
          imgurl: imageUrl
        }
      });

      if (response.data && response.data.status === true) {
        const geminiResponse = response.data.vision;
        sendMessage(pogi, { text: geminiResponse }, maasim);
      } else {
        sendMessage(pogi, { text: "Failed to get a response from the Gemini API. Please try again." }, maasim);
      }
    } catch (error) {
      console.error("Error in Gemini command:", error);
      sendMessage(pogi, { text: "An error occurred while processing the image. Please try again." }, maasim);
    }
  }
};
