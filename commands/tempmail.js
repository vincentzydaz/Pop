const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'tempmail',
  description: 'Generate a temporary email and retrieve confirmation codes automatically.',
  author: 'chilli',

  async execute(kupal, args, chilli) {
    try {
      const { data: createResponse } = await axios.get('https://nethwieginedev.vercel.app/tempmail/create');
      if (!createResponse.status || !createResponse.address) {
        return sendMessage(kupal, { text: 'Failed to generate a temporary email. Please try again.' }, chilli);
      }
      
      const tempEmail = createResponse.address;

      await sendMessage(kupal, { text: tempEmail }, chilli);

      const checkInterval = setInterval(async () => {
        try {
          const { data: checkResponse } = await axios.get(`https://nethwieginedev.vercel.app/tempmail/get/?email=${encodeURIComponent(tempEmail)}`);
          if (checkResponse.status && checkResponse.messages.length > 0) {
            const latestMessage = checkResponse.messages[0];

            if (latestMessage) {
              const fullMessage = `From: ${latestMessage.from}\nSubject: ${latestMessage.subject}\nDate: ${latestMessage.date}\n\nMessage:\n${latestMessage.message}`;

              await sendMessage(kupal, { text: fullMessage }, chilli);
              clearInterval(checkInterval);
            }
          }
        } catch (error) {
          console.error('Error checking email:', error);
        }
      }, 10000);

    } catch (error) {
      console.error('Error generating temp email:', error);
      await sendMessage(kupal, { text: 'An error occurred while creating the temporary email. Please try again.' }, chilli);
    }
  }
};
