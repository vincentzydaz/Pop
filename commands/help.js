const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'help',
  description: 'Show available commands',
  author: 'System',
  execute(senderId, args, pageAccessToken, sendMessage) {
    const commandsDir = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    // Create the buttons
    const buttons = commandFiles.map((file, index) => {
      const command = require(path.join(commandsDir, file));
      return {
        type: 'postback',
        title: `${command.name}`,
        payload: `${command.description}`
      };
    });

    const totalCommands = commandFiles.length;

    const helpMessage = `📋 | CMD List:\n🏷 Total Commands: ${totalCommands}\n\nIf you have any problems with the pagebot, contact the developer.`;

    // Prepare payload for Messenger's template
    const payload = {
      template_type: 'button',
      text: helpMessage,
      buttons: buttons.slice(0, 3) // Only 3 buttons per template allowed by Messenger API
    };

    // Add Contact Developer button
    payload.buttons.push({
      type: 'web_url',
      url: 'https://www.facebook.com/Churchill.Dev4100',
      title: 'Contact Developer'
    });

    // Send message with button template
    sendMessage(senderId, {
      attachment: {
        type: 'template',
        payload: payload
      }
    }, pageAccessToken);
  }
};
