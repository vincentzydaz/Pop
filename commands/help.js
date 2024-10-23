const fs = require('fs');
const path = require('path');
const { sendMessage } = require('../handles/sendMessage');
 

module.exports = {
  name: 'help',
  description: 'Show available commands',
  author: 'chilli',
  execute(senderId, args, pageAccessToken) {
    const commandsDir = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    const commands = commandFiles.map((file, index) => {
      const command = require(path.join(commandsDir, file));
      return `${index + 1}. ${command.name} - ${command.description}`;
    });

    const totalCommands = commandFiles.length;
    const commandsPerPage = 5; // Number of commands per page
    const totalPages = Math.ceil(totalCommands / commandsPerPage);
    let page = parseInt(args[0], 10);

    if (isNaN(page) || page < 1) {
      page = 1;
    }

    if (args[0] && args[0].toLowerCase() === 'all') {
      const helpMessage = `📋 | CMD List:\n🏷 Total Commands: ${totalCommands}\n\n${commands.join('\n\n')}\n\nIf you have any problems with the pagebot, contact the developer:\nFB Link: https://www.facebook.com/Churchill.Dev4100`;
      return sendMessage(senderId, { text: helpMessage }, pageAccessToken);
    }

    const startIndex = (page - 1) * commandsPerPage;
    const endIndex = startIndex + commandsPerPage;
    const commandsForPage = commands.slice(startIndex, endIndex);

    if (commandsForPage.length === 0) {
      return sendMessage(senderId, { text: `Invalid page number. There are only ${totalPages} pages.` }, pageAccessToken);
    }

    const helpMessage = `📋 | CMD List (Page ${page} of ${totalPages}):\n🏷 Total Commands: ${totalCommands}\n\n${commandsForPage.join('\n\n')}\n\nType "help [page]" to see another page, or "help all" to show all commands.\n\nIf you have any problems with the pagebot, contact the developer:\nFB Link: https://www.facebook.com/Churchill.Dev4100`;

    sendMessage(senderId, { text: helpMessage }, pageAccessToken);
  }
};
