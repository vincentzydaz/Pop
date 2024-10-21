// /commands/gpt4o.js
const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

async function sendLongMessage(senderId, text, pageAccessToken, sendMessage) {
  const maxMessageLength = 2000;
  const delayBetweenMessages = 1000; // 1 second

  let remainingText = text;

  while (remainingText.length > 0) {
    const messageChunk = remainingText.slice(0, maxMessageLength);
    await sendMessage(senderId, { text: messageChunk }, pageAccessToken);
    remainingText = remainingText.slice(maxMessageLength);
    
    if (remainingText.length > 0) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenMessages));
    }
  }
}

module.exports = {
  name: 'gpt4o',
  description: 'Send a query to GPT-40 API',
  usage: '-gpt4o <question>',
  author: 'isnchurchill',
  async execute(senderId, args, pageAccessToken) {
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a question for GPT-40.' }, pageAccessToken);
      return;
    }

    const question = args.join(' ');
    const apiUrl = `https://appjonellccapis.zapto.org/api/gpt4o?ask=${encodeURIComponent(question)}&id=1`;

    try {
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (data.status && data.response) {
        const formattedResponse = `💬 |  𝙂𝙋𝙏40\n━━━━━━━━━\n${data.response}\n━━━━━━━━━`;

        await sendLongMessage(senderId, formattedResponse, pageAccessToken, sendMessage);
      } else {
        await sendMessage(senderId, { text: 'Error: Could not retrieve response from GPT-40.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Could not communicate with GPT-40.' }, pageAccessToken);
    }
  }
};
