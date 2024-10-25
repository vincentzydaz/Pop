const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "removebg",
  description: "Removes the background of an image using the RemoveBG API.",
  author: "Churchill",

  async execute(senderId, args, pageAccessToken, event, imageUrl) {
    if (!imageUrl) {
      return sendMessage(senderId, { text: "Please reply to an image or send an image attachment for background removal." }, pageAccessToken);
    }

    sendMessage(senderId, { text: "Processing the image, please wait... 🖼️" }, pageAccessToken);

    try {
      // Call the removebg API
      const removeBgUrl = `https://appjonellccapis.zapto.org/api/removebg?url=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(removeBgUrl);

      if (response.status === 200 && response.data.success) {
        const processedImageUrl = response.data.url;

        // Send back the image with the background removed
        sendMessage(senderId, {
          attachment: {
            type: "image",
            payload: { url: processedImageUrl }
          }
        }, pageAccessToken);
      } else {
        throw new Error(`API Error: ${response.data.message || 'Unable to remove background'}`);
      }
    } catch (error) {
      console.error("Error in removebg command:", error);
      sendMessage(senderId, { text: `Error: ${error.message || "Something went wrong."}` }, pageAccessToken);
    }
  }
};

// Get the image URL from replied message or direct attachment
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
    throw new Error("Failed to fetch attachments.");
  }
}
