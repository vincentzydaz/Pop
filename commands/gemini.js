const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "gemini",
  description: "Interact with Google Gemini for image recognition and text queries.",
  author: "Churchill",

  async execute(senderId, args, pageAccessToken, event) {
    const prompt = args.join(" ");
    if (!prompt) {
      return sendMessage(senderId, { text: `Please enter your question!\n\nExample: gemini what is love?` }, pageAccessToken);
    }

    sendMessage(senderId, { text: "Please wait... 🔎" }, pageAccessToken);

    try {
      let imageUrl = "";

      // Check if the user replied to an image
      if (event.message && event.message.reply_to && event.message.reply_to.mid) {
        imageUrl = await getAttachments(event.message.reply_to.mid, pageAccessToken);
      } else if (event.attachments && event.attachments[0]?.type === 'image') {
        // Check if the original message contains an image attachment
        imageUrl = event.attachments[0].payload.url;
      }

      const apiUrl = `https://joshweb.click/gemini`;
      const chilli = await axios.get(apiUrl, {
        params: {
          prompt,
          url: imageUrl || ""  // Provide the imageUrl if it exists
        }
      });

      const result = chilli.data.gemini;

      sendLongMessage(senderId, result, pageAccessToken);

    } catch (error) {
      sendMessage(senderId, { text: `Error: ${error.message || "Something went wrong."}` }, pageAccessToken);
    }
  }
};

// Function to fetch the image URL from a reply
async function getAttachments(mid, pageAccessToken) {
  if (!mid) throw new Error("No message ID provided.");

  const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
    params: { access_token: pageAccessToken }
  });

  if (data && data.data.length > 0 && data.data[0].image_data) {
    return data.data[0].image_data.url;  // Return the image URL
  } else {
    throw new Error("No image found in the replied message.");
  }
}

// Function to send long messages
function sendLongMessage(senderId, text, pageAccessToken) {
  const maxMessageLength = 2000;
  const delayBetweenMessages = 1000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    sendMessage(senderId, { text: messages[0] }, pageAccessToken);

    messages.slice(1).forEach((message, index) => {
      setTimeout(() => sendMessage(senderId, { text: message }, pageAccessToken), (index + 1) * delayBetweenMessages);
    });
  } else {
    sendMessage(senderId, { text }, pageAccessToken);
  }
}

// Helper function to split message into chunks
function splitMessageIntoChunks(message, chunkSize) {
  const regex = new RegExp(`.{1,${chunkSize}}`, 'g');
  return message.match(regex);
}
