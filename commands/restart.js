const fs = require('fs');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'restart',
  description: 'Restart the bot (admin access only)',
  author: 'Churchill',

  async execute(senderId, args, pageAccessToken, event) {
    const adminId = '8731046750250922';

    if (senderId !== adminId) {
      return sendMessage(senderId, { text: 'Admin access only.' }, pageAccessToken);
    }

    try {
      await sendMessage(senderId, { text: 'Bot is restarting...' }, pageAccessToken);
      
      const restartFile = './restart.json';
      fs.writeFileSync(restartFile, JSON.stringify({ restartId: senderId, time: Date.now() }, null, 4));

      setTimeout(() => {
        console.log('Exiting process...');
        process.exit(1);
      }, 2000);
    } catch (error) {
      console.error('Error executing the restart command:', error);
      await sendMessage(senderId, { text: 'There was an error executing the command "restart". Please try again later.' }, pageAccessToken);
    }
  }
};
