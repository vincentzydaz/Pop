const axios = require("axios");

async function sendMessage(senderId, message, pageAccessToken) {
  try {
    // Turn on the typing indicator
    await setTypingIndicator(senderId, true, pageAccessToken);

    // Prepare the message payload
    const messagePayload = {
      recipient: { id: senderId },
      message: message.text ? { text: message.text } : { attachment: message.attachment }
    };

    // Send the message
    const res = await axios.post(`https://graph.facebook.com/v21.0/me/messages?access_token=${pageAccessToken}`, messagePayload);

    // Turn off the typing indicator
    await setTypingIndicator(senderId, false, pageAccessToken);

    return res.data;
  } catch (error) {
    console.error("Error sending message:", error.response ? error.response.data : error.message);
    // Turn off the typing indicator in case of an error
    await setTypingIndicator(senderId, false, pageAccessToken);
    throw error;
  }
}

async function setTypingIndicator(senderId, isTyping, pageAccessToken) {
  try {
    const senderAction = isTyping ? "typing_on" : "typing_off";
    const form = {
      recipient: { id: senderId },
      sender_action: senderAction
    };
    await axios.post(`https://graph.facebook.com/v21.0/me/messages?access_token=${pageAccessToken}`, form);
  } catch (error) {
    console.error("Unable to send Typing Indicator:", error.response ? error.response.data : error.message);
  }
}
