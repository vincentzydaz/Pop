const fs = require('fs');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "restart",
  description: "Restart the bot (admin access only)",
  author: "Churchill",

  async execute(chilli, args, kalamansi) {
    const adminId = '8731046750250922';

    // Check if the sender is the admin
    if (chilli.sender.id !== adminId) {
      console.log("Unauthorized access attempt by:", chilli.sender.id); // Log unauthorized access
      return sendMessage(chilli, { text: "Admin access only." }, kalamansi);
    }

    try {
      console.log("Sending restart message to admin..."); // Log before sending message
      await sendMessage(chilli, { text: "Bot is restarting..." }, kalamansi);
      
      const restartFile = './restart.json';
      console.log("Writing to restart file..."); // Log before writing file
      fs.writeFileSync(restartFile, JSON.stringify({ restartId: chilli.sender.id, time: Date.now() }, null, 4));

      // Delay to allow the message to send before restarting
      console.log("Restarting in 2 seconds..."); // Log before timeout
      setTimeout(() => {
        console.log("Exiting process..."); // Log before exiting
        process.exit(1); // Exit the process after 2 seconds
      }, 2000); 
    } catch (error) {
      console.error("Error executing the restart command:", error);
      sendMessage(chilli, { text: "There was an error executing the command 'restart'. Please try again later." }, kalamansi);
    }
  }
};
