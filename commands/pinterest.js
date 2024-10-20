const axios = require('axios');

module.exports = {
  name: "pinterest",
  description: "Sends Pinterest images based on your search",
  author: "chilli",

  async execute(senderId, args, pageAccessToken, sendMessage) {
    try {
      if (args.length === 0) {
        return sendMessage(senderId, {
          text: `Invalid format! Use the command like this:\n\npinterest [search term] - [number of images]\nExample: pinterest cat - 10`
        }, pageAccessToken);
      }

      const [searchTerm, count] = args.join(" ").split(" - ");
      if (!searchTerm) {
        return sendMessage(senderId, {
          text: `Invalid format! Use the command like this:\n\npinterest [search term] - [number of images]\nExample: pinterest cat - 10`
        }, pageAccessToken);
      }

      const numOfImages = parseInt(count) || 5;
      const response = await axios.get(`https://api.kenliejugarap.com/pinterestbymarjhun/?search=${encodeURIComponent(searchTerm)}`);

      if (!response.data.status) {
        return sendMessage(senderId, { text: `No results found for "${searchTerm}".` }, pageAccessToken);
      }

      const imageUrls = response.data.data.slice(0, numOfImages);
      if (imageUrls.length === 0) {
        return sendMessage(senderId, { text: `No available images for "${searchTerm}".` }, pageAccessToken);
      }

      // Send each image URL as an attachment
      for (const url of imageUrls) {
        await sendMessage(senderId, {
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
      sendMessage(senderId, { text: `Failed to retrieve images from Pinterest. Error: ${error.message || error}` }, pageAccessToken);
    }
  }
};
