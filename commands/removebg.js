const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "removebg",
  description: "Removes the background of an image using the RemoveBG API.",
  author: "Churchill",

  async execute(chilli, pogi, kalamansi, event) {
    sendMessage(chilli, { text: "Processing the image, please wait... 🖼️" }, kalamansi);

    try {
      let imageUrl = "";

      // Check if there's a reply with an image or a direct image attachment
      if (event.message.reply_to && event.message.reply_to.mid) {
        imageUrl = await getRepliedImage(event.message.reply_to.mid, kalamansi);
      } else if (event.message?.attachments && event.message.attachments[0]?.type === 'image') {
        imageUrl = event.message.attachments[0].payload.url;
      }

      if (!imageUrl) {
        return sendMessage(chilli, { text: "Please reply to an image or send an image attachment for background removal." }, kalamansi);
      }

      // Call the removebg API
      const removeBgUrl = `https://appjonellccapis.zapto.org/api/removebg?url=${imageUrl}`;
      const { data } = await axios.get(removeBgUrl);

      // If successful, send back the image with the background removed
      if (data && data.success) {
        sendMessage(chilli, { attachment: { type: "image", payload: { url: data.url } } }, kalamansi);
      } else {
        throw new Error("Failed to remove background.");
      }

    } catch (error) {
      console.error("Error in removebg command:", error);
      sendMessage(chilli, { text: `Error: ${error.message || "Something went wrong."}` }, kalamansi);
    }
  }
};

async function getRepliedImage(mid, kalamansi) {
  const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
    params: { access_token: kalamansi }
  });

  if (data && data.data.length > 0 && data.data[0].image_data) {
    return data.data[0].image_data.url;
  } else {
    return "";
  }
}
