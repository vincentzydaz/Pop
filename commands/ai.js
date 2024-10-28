const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "ai",
  description: "Interact with GPT-4 using a custom API and receive responses, including images.",
  author: "chilli",

  async execute(chilli, args, kalamansi) {
    const prompt = args.join(" ");
    if (!prompt) {
      return sendMessage(chilli, { text: `Usage: ai [your question]` }, kalamansi);
    }

    // Updated search indicator
    sendMessage(chilli, { text: `🔍 : "${prompt}"` }, kalamansi);

    try {
      const response = await axios.get("https://appjonellccapis.zapto.org/api/gpt4o-v2", {
        params: { prompt: prompt }
      });

      const result = response.data.response;

      if (result.includes('TOOL_CALL: generateImage')) {
        const imageUrlMatch = result.match(/\!\[.*?\]\((https:\/\/.*?)\)/);
        
        if (imageUrlMatch && imageUrlMatch[1]) {
          const imageUrl = imageUrlMatch[1];

          await sendMessage(chilli, {
            attachment: {
              type: 'image',
              payload: {
                url: imageUrl
              }
            }
          }, kalamansi);
        } else {
          await sendConcatenatedMessage(chilli, result, kalamansi);
        }
      } else {
        await sendConcatenatedMessage(chilli, result, kalamansi);
      }

    } catch (error) {
      sendMessage(chilli, { text: "Error while processing your request. Please try again or use gpt4." }, kalamansi);
    }
  }
};

async function sendConcatenatedMessage(chilli, text, kalamansi) {
  const maxMessageLength = 2000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);

    for (const message of messages) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await sendMessage(chilli, { text: message }, kalamansi);
    }
  } else {
    await sendMessage(chilli, { text }, kalamansi);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}
