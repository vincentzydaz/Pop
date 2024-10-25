const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'fbcover',
  description: 'Generate a Facebook cover image using the JoshWeb API.',
  usage: 'fbcover name | subname | address | location | email | color\nExample: fbcover kupal | alyas kupal | dito kupal | taga kupal city | kupalgmail.com | cyan',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    if (args.length < 1) {
      await sendMessage(senderId, {
        text: 'Please provide all required arguments in the format: fbcover name | subname | address | location | email | color'
      }, pageAccessToken);
      return;
    }

    const params = args.join(' ').split('|').map(param => param.trim());

    if (params.length < 6) {
      await sendMessage(senderId, {
        text: 'Incomplete parameters. Please provide all fields in the format: fbcover name | subname | address | location | email | color'
      }, pageAccessToken);
      return;
    }

    const [name, subname, address, location, email, color = 'Cyan'] = params;
    const apiUrl = `https://joshweb.click/canvas/fbcover?name=${encodeURIComponent(name)}&subname=${encodeURIComponent(subname)}&address=${encodeURIComponent(address)}&location=${encodeURIComponent(location)}&email=${encodeURIComponent(email)}&color=${encodeURIComponent(color)}`;

    await sendMessage(senderId, { text: 'Generating Facebook cover image... Please wait.' }, pageAccessToken);

    try {
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: apiUrl
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error generating Facebook cover image:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while generating the Facebook cover. Please try again later.'
      }, pageAccessToken);
    }
  }
};
