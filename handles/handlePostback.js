const { sendMessage } = require('./sendMessage');

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
            text: "Welcome to Chillibot! Ready to explore our AI and utility commands? If you want to see a list of commands, type 'help' or click the 'Commands' button below.",
            buttons: [
              {
                type: "postback",
                title: "Commands",
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
  } else {
    console.error('Invalid postback event data');
  }
}

module.exports = { handlePostback };
