const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "ai",
  description: "Interact with GPT-4 using a custom API and receive responses, including images.",
  author: "Churchill",

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(" ");
    if (!prompt) {
      return sendMessage(senderId, { text: `Usage: ai [your question]` }, pageAccessToken);
    }

    sendMessage(senderId, { text: "Processing your request..." }, pageAccessToken);

    try {
      const response = await axios.get("https://appjonellccapis.zapto.org/api/gpt4o-v2", {
        params: { prompt: prompt }
      });

      const result = response.data.response;

      if (result.includes('TOOL_CALL: generateImage')) {
        const imageUrlMatch = result.match(/\!\[.*?\]\((https:\/\/.*?)\)/);
        
        if (imageUrlMatch && imageUrlMatch[1]) {
          const imageUrl = imageUrlMatch[1];

          await sendMessage(senderId, {
            attachment: {
              type: 'image',
              payload: {
                url: imageUrl
              }
            }
          }, pageAccessToken);
        } else {
          sendLongMessage(senderId, result, pageAccessToken);
        }
      } else {
        sendLongMessage(senderId, result, pageAccessToken);
      }

    } catch (error) {
      sendMessage(senderId, { text: "Error while processing your request. Please try again or use gpt4." }, pageAccessToken);
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
