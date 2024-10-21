const axios = require("axios");

module.exports = {
  name: "gpt4o",
  description: "Interact with GPT-4 using a custom API and receive responses.",
  author: "Churchill",

  async execute({ senderId, args, pageAccessToken, sendMessage }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return sendMessage(senderId, { text: `Usage: gpt4o [your question]` }, pageAccessToken);
    }

    sendMessage(senderId, { text: `🔍 Searching...\nQuestion: ${prompt}` }, pageAccessToken);

    try {
      const response = await axios.get("https://appjonellccapis.zapto.org/api/gpt4o", {
        params: {
          ask: prompt,
          id: 1
        }
      });

      if (response.data.status) {
        const result = `💬| 𝙂𝙋𝙏𝙊\n\n${response.data.response}`;
        sendLongMessage(senderId, result, pageAccessToken, sendMessage);
      } else {
        sendMessage(senderId, { text: "Sorry, something went wrong. Please try again later." }, pageAccessToken);
      }
    } catch (error) {
      sendMessage(senderId, { text: "Error while processing your request. Please try again." }, pageAccessToken);
    }
  }
};

function sendLongMessage(senderId, text, pageAccessToken, sendMessage) {
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
