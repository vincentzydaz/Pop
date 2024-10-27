const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "tiktrend",
  description: "Fetch and send trending TikTok videos",
  author: "Churchill",

  async execute(senderId, args, pageAccessToken) {
    try {
      const waitingMessage = await sendMessage(senderId, { text: "⏱️ | Fetching a trending TikTok video..." }, pageAccessToken);

      const response = await axios.get("https://ccexplorerapisjonell.vercel.app/api/tiktrend");
      const videos = response.data.data;

      if (!videos || videos.length === 0) {
        await sendMessage(senderId, { text: "No trending videos found." }, pageAccessToken);
        return;
      }

      const randomVideo = videos[Math.floor(Math.random() * videos.length)];
      const videoUrl = randomVideo.play;
      const title = randomVideo.title;
      const duration = randomVideo.duration;
      const cover = randomVideo.cover;
      const authorName = randomVideo.author.nickname;

      const messageBody = `🎥 Trending TikTok Video\n\n`
                        + `Title: ${title}\n`
                        + `Duration: ${duration} seconds\n`
                        + `Author: ${authorName}\n`
                        + `Views: ${randomVideo.play_count}\n`
                        + `Likes: ${randomVideo.digg_count}\n`
                        + `Shares: ${randomVideo.share_count}\n\n`
                        + `Thumbnail: ${cover}`;

      await sendMessage(senderId, { text: messageBody }, pageAccessToken);

      await sendMessage(senderId, {
        attachment: {
          type: "video",
          payload: {
            url: videoUrl
          }
        }
      }, pageAccessToken);

      if (waitingMessage && waitingMessage.message_id) {
        await sendMessage(senderId, { message_id: waitingMessage.message_id, delete: true }, pageAccessToken);
      }
    } catch (error) {
      console.error("An error occurred while fetching the TikTok video:", error);
      await sendMessage(senderId, { text: "An error occurred while fetching the TikTok video." }, pageAccessToken);
    }
  }
};
