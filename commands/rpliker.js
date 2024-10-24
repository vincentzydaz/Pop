const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "rpliker",
  description: "React to a Facebook post using the specified reaction and user's cookie.",
  author: "Churchill",

  async execute(chilli, pogi, kalamansi, event) {
    const kalamansiPrompt = pogi.join(" ");
    const parts = kalamansiPrompt.split(" ").map(part => part.trim());
    
    const [reaction, userCookie, link] = parts;

    if (!reaction || !userCookie || !link) {
      return sendMessage(chilli, { text: `Missing required fields. Please provide the reaction, cookie, and link.\n\nExample:\n\nrpliker LOVE your_cookie_here https://facebook.com/some-post` }, kalamansi);
    }

    if (reaction !== reaction.toUpperCase()) {
      return sendMessage(chilli, { text: `Invalid reaction. Please enter the reaction in uppercase format.` }, kalamansi);
    }

    sendMessage(chilli, { text: "Sending your reaction... 🔎" }, kalamansi);

    try {
      const apiUrl = "https://fbpython.click/android_get_react";

      const payload = {
        reaction: reaction.toUpperCase(),
        cookie: userCookie,
        link: link,
        version: "2.1"
      };

      const headers = {
        "Content-Type": "application/json; charset=utf-8",
        "User-Agent": "okhttp/3.9.1"
      };

      const response = await axios.post(apiUrl, payload, { headers });

      if (response.status === 200 && response.data.status === 'success') {
        sendMessage(chilli, { text: `Well done! ${response.data.message}` }, kalamansi);
      } else {
        sendMessage(chilli, { text: `Failed to send reaction: ${response.data.message}` }, kalamansi);
      }

    } catch (error) {
      console.error("Error in Rpliker command:", error);
      sendMessage(chilli, { text: `Error: ${error.message || "Something went wrong."}` }, kalamansi);
    }
  }
};
