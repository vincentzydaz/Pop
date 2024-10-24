const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "remini",
  description: "Process an image using the Remini API for enhancement.",
  author: "chilli",

  async execute(chilli, pogi, kalamansi, event) {
    let imageUrl = "";

    if (event.message.reply_to && event.message.reply_to.mid) {
      imageUrl = await getRepliedImage(event.message.reply_to.mid, kalamansi);
    } 
    else if (event.message?.attachments && event.message.attachments[0]?.type === 'image') {
      imageUrl = event.message.attachments[0].payload.url;
    }

    if (!imageUrl) {
      return sendMessage(chilli, { text: "Please reply to an image or provide an image URL." }, kalamansi);
    }

    sendMessage(chilli, { text: "Processing image, please wait..." }, kalamansi);

    try {
      const response = await handleImageEnhancement(`https://markdevs69v2-679r.onrender.com/api/remini`, imageUrl);
      const processedImageURL = response.image_data;

      sendMessage(chilli, {
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

async function handleImageEnhancement(apiUrl, imageUrl) {
  const { data } = await axios.get(apiUrl, {
    params: {
      inputImage: imageUrl
    }
  });

  return data;
}

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
