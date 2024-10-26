const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "pinterest",
  description: "Sends Pinterest images based on your search",
  author: "chilli",

  async execute(chilli, args, pageAccessToken) {
    try {
      if (args.length === 0) {
        return sendMessage(chilli, {
          text: `Invalid format! Use the command like this:\n\npinterest [search term] - [number of images]\nExample: pinterest cat - 10`
        }, pageAccessToken);
      }

      const argString = args.join(" ").replace(/-/g, " ").trim();
      const parts = argString.split(/\s+/);
      const lastPart = parts[parts.length - 1];
      let searchTerm, numOfImages;

      if (!isNaN(lastPart)) {
        numOfImages = parseInt(lastPart);
        searchTerm = parts.slice(0, -1).join(" ");
      } else {
        numOfImages = 5;
        searchTerm = argString;
      }

      if (!searchTerm) {
        return sendMessage(chilli, {
          text: `Invalid format! Use the command like this:\n\npinterest [search term] - [number of images]\nExample: pinterest cat - 10`
        }, pageAccessToken);
      }

      const response = await axios.get(`https://api.kenliejugarap.com/pinterestbymarjhun/?search=${encodeURIComponent(searchTerm)}`);

      if (!response.data.status) {
        return sendMessage(chilli, { text: `No results found for "${searchTerm}".` }, pageAccessToken);
      }

      const imageUrls = response.data.data.slice(0, numOfImages);
      if (imageUrls.length === 0) {
        return sendMessage(chilli, { text: `No available images for "${searchTerm}".` }, pageAccessToken);
      }

      for (const url of imageUrls) {
        await sendMessage(chilli, {
          attachment: {
            type: "image",
            payload: {
              url: url
            }
          }
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Failed to retrieve images from Pinterest:", error);
      sendMessage(chilli, { text: `Failed to retrieve images from Pinterest. Error: ${error.message || error}` }, pageAccessToken);
    }
  }
};
