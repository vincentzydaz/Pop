const axios = require('axios');

// Typing indicator function
async function typingIndicator(senderId, pageAccessToken) {
  try {
    await axios.post(`https://graph.facebook.com/v16.0/me/messages`, {
      recipient: { id: senderId },
      sender_action: 'typing_on',
    }, {
      params: { access_token: pageAccessToken },
    });
    console.log('Typing indicator sent.');
  } catch (error) {
    console.error('Error sending typing indicator:', error.message);
  }
}

// Send message function with axios
async function sendMessage(senderId, message, pageAccessToken) {
  if (!message || (!message.text && !message.attachment)) {
    console.error('Error: Message must provide valid text or attachment.');
    return;
  }

  // Construct the payload
  const payload = {
    recipient: { id: senderId },
    message: {}
  };

  if (message.text) {
    payload.message.text = message.text;
  }
  if (message.attachment) {
    payload.message.attachment = message.attachment;
  }
  if (message.quick_replies) {
    payload.message.quick_replies = message.quick_replies;
  }

  try {
    // Send typing indicator before the message
    await typingIndicator(senderId, pageAccessToken);

    // Send message payload
    const response = await axios.post(`https://graph.facebook.com/v16.0/me/messages`, payload, {
      params: { access_token: pageAccessToken },
    });

    // Check if response contains any errors
    if (response.data.error) {
      console.error('Error response:', response.data.error);
    } else {
      console.log('Message sent successfully:', response.data);
    }
  } catch (error) {
    // Detailed error logging
    console.error('Error sending message:', error.response ? error.response.data : error.message);
  }
}

module.exports = { sendMessage, typingIndicator };
