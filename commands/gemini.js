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
      let imageUrl = "";

      if (event.message.reply_to && event.message.reply_to.mid) {
        imageUrl = await getRepliedImage(event.message.reply_to.mid, kalamansi);
      } else if (event.message?.attachments && event.message.attachments[0]?.type === 'image') {
        imageUrl = event.message.attachments[0].payload.url;
      }

      const apiUrl = `https://joshweb.click/gemini`;

      const chilliResponse = await handleImageRecognition(apiUrl, kalamansiPrompt, imageUrl);
      const result = chilliResponse.gemini;

      sendLongMessage(chilli, result, kalamansi);

    } catch (error) {
      console.error("Error in Gemini command:", error);
      sendMessage(chilli, { text: `Error: ${error.message || "Something went wrong."}` }, kalamansi);
    }
  }
};

async function handleImageRecognition(apiUrl, prompt, imageUrl) {
  const { data } = await axios.get(apiUrl, {
    params: {
      prompt,
      url: imageUrl || ""
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

async function sendLongMessage(chilli, text, kalamansi) {
  const maxMessageLength = 2000;
  const delayBetweenMessages = 1000; // 1 second delay between messages

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    for (const message of messages) {
      await sendMessage(chilli, { text: message }, kalamansi);
      await delay(delayBetweenMessages);
    }
  } else {
    await sendMessage(chilli, { text }, kalamansi);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function splitMessageIntoChunks(message, chunkSize) {
  const regex = new RegExp(`.{1,${chunkSize}}`, 'g');
  return message.match(regex);
}
