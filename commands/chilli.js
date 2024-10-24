const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'chilli',
  description: 'Get a response from Chilli AI using the Akhiro API.',
  usage: 'chilli <question>\nExample: chilli who are you?',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide a question to ask Chilli AI.\n\nUsage:\nchilli <question>\nExample: chilli who are you?'
      }, pageAccessToken);
      return;
    }

    const question = args.join(' ');
    const apiUrl = `https://akhiro-tech.vercel.app/api?model=chilli&q=${encodeURIComponent(question)}`;

    try {
      const response = await axios.get(apiUrl);
      const { code, message } = response.data;

      if (code === 200) {
        await sendConcatenatedMessage(senderId, message, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: 'There was an issue retrieving the response. Please try again later.'
        }, pageAccessToken);
      }

    } catch (error) {
      console.error('Error retrieving response:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while processing your request. Please try again later.'
      }, pageAccessToken);
    }
  }
};

async function sendConcatenatedMessage(chilli, text, kalamansi) {
  const maxMessageLength = 2000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);

    for (let i = 0; i < messages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await sendMessage(chilli, { text: messages[i] }, kalamansi);
    }
  } else {
    await sendMessage(chilli, { text }, kalamansi);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const regex = new RegExp(`.{1,${chunkSize}}`, 'g');
  return message.match(regex);
}
