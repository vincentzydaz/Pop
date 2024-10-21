const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'help',
  description: 'Show available commands',
  author: 'System',
  execute(senderId, args, pageAccessToken, sendMessage) {
    const commandsDir = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    const commands = commandFiles.map((file, index) => {
      const command = require(path.join(commandsDir, file));
      return `${index + 1}. ${command.name} - ${command.description}`;
    });

    const totalCommands = commandFiles.length;

    const helpMessage = `📋 | CMD List:\n🏷 Total Commands: ${totalCommands}\n\nIf you have any problems with the pagebot, contact the developer.`;

    const buttons = [
      {
        type: 'web_url',
        url: 'https://www.facebook.com/Churchill.Dev4100',
        title: 'Contact Developer'
      }
    ];

    // Send the message with one button
    sendMessage(senderId, {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: helpMessage,
          buttons: buttons
        }
      }
    }, pageAccessToken);
  }
};
