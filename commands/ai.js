const axios = require("axios");

module.exports = {
  name: "ai",
  description: "Interact with GPT-4 using a custom API and receive responses.",
  author: "Churchill",

  async execute(senderId, args, pageAccessToken, sendMessage) {
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
      sendLongMessage(senderId, result, pageAccessToken, sendMessage);

    } catch (error) {
      console.error("Error while processing your request:", error);
      sendMessage(senderId, { text: "Error while processing your request. Please try again or use gpt4." }, pageAccessToken);
    }
  }
};


function sendLongMessage(senderId, text, pageAccessToken, sendMessage) {
  const maxMessageLength = 2000;
  const delayBetweenMessages = 1000; // 1 second

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

// Splits a message into chunks of the specified size
function splitMessageIntoChunks(message, chunkSize) {
  const regex = new RegExp(`.{1,${chunkSize}}`, 'g');
  return message.match(regex);
}
