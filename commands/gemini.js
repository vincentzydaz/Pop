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
      const attachments = event.attachments && event.attachments[0]?.type === 'image' ? event.attachments : null;
      const imageUrl = attachments ? attachments[0].payload.url : "";

      const apiUrl = `https://joshweb.click/gemini`;
      const chilli = await axios.get(apiUrl, {
        params: {
          prompt,
          url: imageUrl
        }
      });

      const result = chilli.data.gemini;

      sendLongMessage(senderId, result, pageAccessToken);

    } catch (error) {
      sendMessage(senderId, { text: `Error: ${error.message || "Something went wrong."}` }, pageAccessToken);
    }
  }
};

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

function splitMessageIntoChunks(message, chunkSize) {
  const regex = new RegExp(`.{1,${chunkSize}}`, 'g');
  return message.match(regex);
}
