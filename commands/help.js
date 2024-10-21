const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'help',
  description: 'Show available commands',
  author: 'chilli',
  execute(senderId, args, pageAccessToken, sendMessage) {
    const commandsDir = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    const commands = commandFiles.map((file, index) => {
      const command = require(path.join(commandsDir, file));
      return `${index + 1}. ${command.name} - ${command.description}`;
    });

    const totalCommands = commandFiles.length;
    
    const helpMessage = `📋 | CMD List:\n🏷 Total Commands: ${totalCommands}\n\n${commands.join('\n\n')}\n\nIf you have any problems with the pagebot, contact the developer:\nFB Link: https://www.facebook.com/Churchill.Dev4100`;
    
    sendMessage(senderId, { text: helpMessage }, pageAccessToken);
  }
};
