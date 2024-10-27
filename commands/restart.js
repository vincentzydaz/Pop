const fs = require('fs');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'restart',
  description: 'Restart the bot (admin access only)',
  author: 'Churchill',

  async execute(senderId, args, pageAccessToken, event) {
    const adminId = '8731046750250922';

    // Check if the sender is the admin
    if (senderId !== adminId) {
      return sendMessage(senderId, { text: 'Admin access only.' }, pageAccessToken);
    }

    try {
      // Notify the admin that the bot is restarting
      await sendMessage(senderId, { text: 'Bot is restarting...' }, pageAccessToken);
      
      // Write restart information to a file
      const restartFile = './restart.json';
      fs.writeFileSync(restartFile, JSON.stringify({ restartId: senderId, time: Date.now() }, null, 4));

      // Delay to allow the message to send before restarting
      setTimeout(() => {
        console.log('Exiting process...');
        process.exit(1); // Exit the process after 2 seconds
      }, 2000);
    } catch (error) {
      console.error('Error executing the restart command:', error);
      await sendMessage(senderId, { text: 'There was an error executing the command "restart". Please try again later.' }, pageAccessToken);
    }
  }
};
