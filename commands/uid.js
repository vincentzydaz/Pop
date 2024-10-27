const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const pageAccessToken = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'uid',
  description: 'get ur actual id',
  author: 'coffee',
  
  async execute(senderId) {
    try {
      await sendMessage(senderId, { text: `${senderId}` }, pageAccessToken);
    } catch (error) {
      console.error('Error sending UID:', error);
      await sendMessage(senderId, { text: 'Error: Unable to retrieve your UID.' }, pageAccessToken);
    }
  },
};
