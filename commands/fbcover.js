const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const FormData = require('form-data');

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
      // Fetch the image from the API
      const response = await axios({
        url: apiUrl,
        method: 'GET',
        responseType: 'stream'  // Stream the image to handle the upload properly
      });

      // Create a form to upload the image
      const formData = new FormData();
      formData.append('filedata', response.data, {
        filename: 'fbcover.png',
        contentType: 'image/png'
      });

      const uploadUrl = `https://graph.facebook.com/v15.0/me/messages?access_token=${pageAccessToken}`;

      // Upload the image as an attachment
      const uploadResponse = await axios.post(uploadUrl, formData, {
        headers: {
          ...formData.getHeaders()
        }
      });

      // Send the image as an attachment using its ID
      const attachmentId = uploadResponse.data.attachment_id;
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: { attachment_id: attachmentId }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error creating Facebook cover image:', error.response ? error.response.data : error);
      await sendMessage(senderId, { text: 'Failed to generate the Facebook cover. Please try again later.' }, pageAccessToken);
    }
  }
};
