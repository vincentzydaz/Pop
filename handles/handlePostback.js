const { sendMessage } = require('./sendMessage');

const handlePostback = (event, pageAccessToken) => {
  const senderId = event.sender?.id;
  const payload = event.postback?.payload;

  if (senderId && payload) {
    if (payload === 'GET_STARTED_PAYLOAD') {
      const welcomeMessage = {
        text: `🔥 Welcome to CHILLI BOT! 🔥\n\nI'm your AI-powered assistant, here to make things spicier and smoother! 🌶️\n\nType 'help' or click below to see my commands.`,
        quick_replies: [
          {
            content_type: "text",
            title: "Help",
            payload: "HELP_PAYLOAD"  // Ensure this payload matches your case structure in the bot
          },
          {
            content_type: "text",
            title: "Privacy",
            payload: "PRIVACY_PAYLOAD"  // Define this payload to handle privacy inquiries
          }
        ]
      };
      sendMessage(senderId, welcomeMessage, pageAccessToken);
    } else {
      sendMessage(senderId, { text: `You sent a postback with payload: ${payload}` }, pageAccessToken);
    }
  } else {
    console.error('Invalid postback event data');
  }
};

module.exports = { handlePostback };
