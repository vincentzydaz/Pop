const axios = require('axios');

module.exports = {
  name: "sharebooster",
  description: "Boosts the shares of a Facebook post using app state.",
  author: "Churchill",

  async execute(chilli, args, kalamansi) {
    const [appState, postUrl, quantity = "100"] = args; // Default quantity to 1 if not provided
    const delay = "1";    // Default delay to 1 second

    if (!appState || !postUrl) {
      return sendMessage(chilli, { text: "Usage: sharebooster [APPSTATE] [Post URL] [Quantity]" }, kalamansi);
    }

    sendMessage(chilli, { text: `Boosting ${quantity} shares on ${postUrl} with a delay of ${delay} second...` }, kalamansi);

    try {
      const response = await axios.get('https://rest-api.joshuaapostol.site/spamshare', {
        headers: { 'Content-Type': 'application/json' },
        data: {
          state: appState,
          url: postUrl,
          quantity: quantity,
          delay: delay
        }
      });

      if (response.data.success) {
        sendMessage(chilli, { text: `Success! Boosted ${quantity} shares on ${postUrl} with a delay of ${delay} second.` }, kalamansi);
      } else {
        sendMessage(chilli, { text: "Failed to boost shares. Please check your app state or post URL." }, kalamansi);
      }
    } catch (error) {
      console.error("Error boosting shares:", error);
      sendMessage(chilli, { text: "An error occurred while processing your request." }, kalamansi);
    }
  }
};
