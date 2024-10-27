const fs = require('fs');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "restart",
  description: "Restart the bot (admin access only)",
  author: "Churchill",

  async execute(chilli, args, kalamansi) {
    const adminId = '8731046750250922';
    
    if (chilli.sender.id !== adminId) {
      return sendMessage(chilli, { text: "Admin access only." }, kalamansi);
    }

    sendMessage(chilli, { text: "Bot is restarting..." }, kalamansi);

    const restartFile = './restart.json';
    fs.writeFileSync(restartFile, JSON.stringify({ restartId: chilli.sender.id, time: Date.now() }, null, 4));
    
    setTimeout(() => process.exit(1), 2000); // Exit the process after 2 seconds
  }
};
