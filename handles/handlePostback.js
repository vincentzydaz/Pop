const axios = require('axios');

function handlePostback(event, pageAccessToken) {
  const senderId = event.sender.id;
  const payload = event.postback.payload;

  if (senderId && payload) {
    if (payload === 'GET_STARTED_PAYLOAD') {
      const welcomeMessage = {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: "Welcome to Chilli Bot! Ready to explore our AI and utility commands? Type 'help' or click the 'Commands' button below.",
            buttons: [
              {
                type: "postback",
                title: "help",
                payload: "HELP"
              }
            ]
          }
        }
      };
      sendMessage(senderId, welcomeMessage, pageAccessToken);
    } else {
      sendMessage(senderId, { text: `You sent a postback with payload: ${payload}` }, pageAccessToken);
    }
  }
}

async function sendMessage(senderId, message, pageAccessToken) {
  try {
    await axios.post(`https://graph.facebook.com/v13.0/me/messages`, {
      recipient: { id: senderId },
      message: message,
    }, {
      params: { access_token: pageAccessToken },
    });
  } catch (error) {
    console.error('Error sending message:', error.message);
  }
}

module.exports = { handlePostback };
