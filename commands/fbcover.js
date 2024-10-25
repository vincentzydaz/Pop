const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'fbcover',
  description: 'Generate a custom Facebook cover image',
  usage: 'fbcover <name> | <subname> | <sdt> | <address> | <email> | <color>',
  author: 'churchill',
  async execute(senderId, args, pageAccessToken) {
    const input = args.join(' ').split('|').map(item => item.trim());

    if (input.length < 6) {
      await sendMessage(senderId, { text: 'Please provide all necessary details in the format: fbcover name | subname | sdt | address | email | color' }, pageAccessToken);
      return;
    }

    const [name, subname, sdt, address, email, color] = input;
    const apiUrl = `https://joshweb.click/canvas/fbcover?name=${encodeURIComponent(name)}&subname=${encodeURIComponent(subname)}&sdt=${encodeURIComponent(sdt)}&address=${encodeURIComponent(address)}&email=${encodeURIComponent(email)}&uid=${senderId}&color=${encodeURIComponent(color)}`;

    try {
      // Send the image back as a direct URL in the response
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: { url: apiUrl } // Direct image URL from API
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error creating Facebook cover image:', error);
      await sendMessage(senderId, { text: 'Failed to generate the Facebook cover. Please try again later.' }, pageAccessToken);
    }
  }
};
