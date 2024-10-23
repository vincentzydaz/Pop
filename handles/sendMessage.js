const request = require('request');

async function sendMessage(senderId, message, mid = null, pageAccesToken) {
  try {
    await axios.post(`https://graph.facebook.com/v21.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      recipient: { id: senderId },
      sender_action: "typing_on"
    });

    const messagePayload = {
      recipient: { id: senderId },
      message: message.text ? { text: message.text } : { attachment: message.attachment }
    };

    const res = await axios.post(`https://graph.facebook.com/v21.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, messagePayload);

    await axios.post(`https://graph.facebook.com/v21.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      recipient: { id: senderId },
      sender_action: "typing_off"
    });

    return res.data;
  } catch (error) {
    console.error();
  }
}


async function handleMessage(event, pageAccessToken) {
  if (!event || !event.sender || !event.message) {
    console.error();
    return;
  }
