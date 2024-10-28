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

    sendMessage(chilli, { text: `🔍 : "${prompt}"...` }, kalamansi);

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
          await sendConcatenatedMessage(chilli, `🧩 | Chilli Gpt\n\n${result}`, kalamansi);
        }
      } else {
        await sendConcatenatedMessage(chilli, `🧩 | Chilli Gpt\n\n${result}`, kalamansi);
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

    for (let i = 0; i < messages.length; i++) {
      const messageText = i === 0 ? `🧩 | Chilli Gpt\n\n${messages[i]}` : messages[i];
      await new Promise(resolve => setTimeout(resolve, 500));
      await sendMessage(chilli, { text: messageText }, kalamansi);
    }
  } else {
    await sendMessage(chilli, { text: `🧩 | Chilli Gpt\n\n${text}` }, kalamansi);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}
