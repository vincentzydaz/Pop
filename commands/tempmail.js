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

      await sendMessage(kupal, { text: `Temporary email created: ${tempEmail}\nUse this email to receive the confirmation code.` }, chilli);

      const checkInterval = setInterval(async () => {
        try {
          const { data: checkResponse } = await axios.get(`https://nethwieginedev.vercel.app/tempmail/get/?email=${encodeURIComponent(tempEmail)}`);
          if (checkResponse.status && checkResponse.messages.length > 0) {
            const latestMessage = checkResponse.messages.find(msg => msg.subject && msg.subject.includes('confirmation code'));

            if (latestMessage && latestMessage.message) {
              const codeMatch = latestMessage.message.match(/\b\d{5,6}\b/);
              const confirmationCode = codeMatch ? codeMatch[0] : null;

              if (confirmationCode) {
                await sendMessage(kupal, { text: `Your confirmation code is: ${confirmationCode}` }, chilli);
                clearInterval(checkInterval);
              }
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
