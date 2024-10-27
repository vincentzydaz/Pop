const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

// Helper function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  name: 'remini',
  description: 'Upscale an image using the Remini API.',
  author: 'Churchill',

  async execute(chilli, args, pageAccessToken, chilliEvent, chilliImageUrl) {
    console.log("Starting Remini command execution...");

    // Step 1: Retrieve image URL if not provided
    if (!chilliImageUrl) {
      if (chilliEvent.message.reply_to && chilliEvent.message.reply_to.mid) {
        try {
          console.log("Fetching image from replied message...");
          chilliImageUrl = await getAttachments(chilliEvent.message.reply_to.mid, pageAccessToken);
          console.log("Image URL retrieved:", chilliImageUrl);
        } catch (error) {
          console.error("Error retrieving image from reply:", error);
          return sendMessage(chilli, {
            text: 'Failed to retrieve the image from the reply. Please try again.'
          }, pageAccessToken);
        }
      } else {
        return sendMessage(chilli, {
          text: 'Usage: To enhance an image, please reply to the image attachment with the command "remini". Note: This feature requires using Messenger, as Facebook Lite does not support reply functionality in page bots.'
        }, pageAccessToken);
      }
    }

    // Step 2: Notify user that the image is being processed
    await sendMessage(chilli, { text: 'Enhancing the image, please wait... 🖼️' }, pageAccessToken);
    console.log("User notified about image processing...");

    // Retry mechanism with 3 attempts and delay between each attempt
    const reminiApiUrl = `https://ccprojectapis.ddns.net/api/upscale?url=${encodeURIComponent(chilliImageUrl)}&model=1`;
    let chilliUpscaledImageUrl;
    let success = false;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Attempt ${attempt}: Sending request to Remini API...`);
        const response = await axios.get(reminiApiUrl, { timeout: 15000 }); // 15 seconds timeout

        if (response.data && response.data.image_url) {
          chilliUpscaledImageUrl = response.data.image_url;
          success = true;
          console.log("Image successfully upscaled:", chilliUpscaledImageUrl);
          break; // Exit loop if successful
        } else {
          throw new Error("Invalid response from the API");
        }
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);

        if (attempt < 3) {
          console.log("Retrying in 2 seconds...");
          await delay(2000); // Wait 2 seconds before retrying
        } else {
          console.error("All attempts to upscale the image failed.");
        }
      }
    }

    // Step 3: Send result back to user if successful, otherwise send error message
    if (success) {
      console.log("Sending upscaled image back to user...");
      try {
        await sendMessage(chilli, {
          attachment: {
            type: 'image',
            payload: {
              url: chilliUpscaledImageUrl
            }
          }
        }, pageAccessToken);
        console.log("Image sent successfully.");
      } catch (error) {
        console.error("Failed to send upscaled image:", error);
        await sendMessage(chilli, {
          text: 'An error occurred while sending the enhanced image. Please try again later.'
        }, pageAccessToken);
      }
    } else {
      console.log("Sending failure notification to user...");
      await sendMessage(chilli, {
        text: 'An error occurred while processing the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};

// Updated sendMessage function to include additional logging
async function sendMessage(chilli, messageData, pageAccessToken) {
  console.log("Preparing to send message with data:", messageData);
  
  try {
    const response = await axios.post(`https://graph.facebook.com/v12.0/me/messages`, {
      recipient: { id: chilli.senderId },
      message: messageData
    }, {
      headers: { Authorization: `Bearer ${pageAccessToken}` }
    });
    console.log("Message sent, response from Messenger API:", response.data);
  } catch (error) {
    console.error("Error sending message to Messenger API:", error.response ? error.response.data : error.message);
    throw error;
  }
}

// Helper function to get the image URL from a reply message
async function getAttachments(mid, pageAccessToken) {
  if (!mid) {
    throw new Error("No message ID provided.");
  }

  try {
    console.log("Attempting to fetch attachments for message ID:", mid);
    const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
      params: { access_token: pageAccessToken }
    });

    if (data && data.data.length > 0 && data.data[0].image_data) {
      console.log("Attachment data retrieved successfully.");
      return data.data[0].image_data.url;
    } else {
      throw new Error("No image found in the replied message.");
    }
  } catch (error) {
    console.error("Failed to fetch attachments:", error);
    throw new Error("Failed to retrieve the image.");
  }
}
