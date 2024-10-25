const axios = require('axios');

module.exports = {
  name: "sharebooster",
  description: "Boosts the shares of a Facebook post using app state.",
  author: "Churchill",

  async execute(chilli, args, kalamansi) {
    const [appState, postUrl] = args;
    const quantity = "1000000"; // Default quantity
    const delay = "1";    // Default delay

    if (!appState || !postUrl) {
      return sendMessage(chilli, { text: "Usage: sharebooster [APPSTATE] [Post URL]" }, kalamansi);
    }

    sendMessage(chilli, { text: `Boosting shares on ${postUrl} with ${quantity} share and a delay of ${delay} second...` }, kalamansi);

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
        sendMessage(chilli, { text: `Success! Boosted ${quantity} share on ${postUrl} with a delay of ${delay} second.` }, kalamansi);
      } else {
        sendMessage(chilli, { text: "Failed to boost shares. Please check your app state or post URL." }, kalamansi);
      }
    } catch (error) {
      console.error("Error boosting shares:", error);
      sendMessage(chilli, { text: "An error occurred while processing your request." }, kalamansi);
    }
  }
};
