const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "gemini",
  description: "Interact with Google Gemini for image recognition and text queries.",
  author: "Churchill",

  async execute(chilli, pogi, kalamansi, event) {
    const kalamansiPrompt = pogi.join(" ");
    if (!kalamansiPrompt) {
      return sendMessage(chilli, { text: `Please enter your question!\n\nExample: gemini what is love?` }, kalamansi);
    }

    sendMessage(chilli, { text: "Please wait... 🔎" }, kalamansi);

    try {
      // Check if the message contains image attachments or is a reply to an image
      const attachments = event.message?.attachments && event.message.attachments[0]?.type === 'image'
        ? event.message.attachments
        : null;
      const imageUrl = attachments ? attachments[0].payload.url : "";

      const apiUrl = `https://joshweb.click/gemini`;

      // Use the handleImageRecognition function
      const chilliResponse = await handleImageRecognition(apiUrl, kalamansiPrompt, imageUrl);
      const result = chilliResponse.gemini;

      sendLongMessage(chilli, result, kalamansi);

    } catch (error) {
      sendMessage(chilli, { text: `Error: ${error.message || "Something went wrong."}` }, kalamansi);
    }
  }
};

// Function to handle image recognition
async function handleImageRecognition(apiUrl, prompt, imageUrl) {
  const { data } = await axios.get(apiUrl, {
    params: {
      prompt,
      url: imageUrl || "" // Use imageUrl if available, or pass an empty string
    }
  });

  return data;
}

function sendLongMessage(chilli, text, kalamansi) {
  const maxMessageLength = 2000;
  const delayBetweenMessages = 1000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    sendMessage(chilli, { text: messages[0] }, kalamansi);

    messages.slice(1).forEach((message, index) => {
      setTimeout(() => sendMessage(chilli, { text: message }, kalamansi), (index + 1) * delayBetweenMessages);
    });
  } else {
    sendMessage(chilli, { text }, kalamansi);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const regex = new RegExp(`.{1,${chunkSize}}`, 'g');
  return message.match(regex);
}
