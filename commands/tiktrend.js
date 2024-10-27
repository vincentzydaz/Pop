const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "tiktrend",
  description: "Fetch and send trending TikTok videos",
  author: "chilli",

  async execute(senderId, args, pageAccessToken) {
    try {
      const pogi = await sendMessage(senderId, { text: "⏱️ | Fetching a trending TikTok video..." }, pageAccessToken);

      const response = await axios.get("https://ccexplorerapisjonell.vercel.app/api/tiktrend");
      const videos = response.data.data;

      if (!videos || videos.length === 0) {
        await sendMessage(senderId, { text: "No trending videos found." }, pageAccessToken);
        return;
      }

      const chilli = videos[Math.floor(Math.random() * videos.length)];
      const videoUrl = chilli.play;
      const title = chilli.title;
      const duration = chilli.duration;
      const authorName = chilli.author.nickname;

      const messageBody = `🎥 Trending TikTok Video\n\n`
                        + `Title: ${title}\n`
                        + `Duration: ${duration} seconds\n`
                        + `Author: ${authorName}\n`
                        + `Views: ${chilli.play_count}\n`
                        + `Likes: ${chilli.digg_count}\n`
                        + `Shares: ${chilli.share_count}`;

      await sendMessage(senderId, { text: messageBody }, pageAccessToken);

      await sendMessage(senderId, {
        attachment: {
          type: "video",
          payload: {
            url: videoUrl
          }
        }
      }, pageAccessToken);

      if (pogi && pogi.message_id) {
        await sendMessage(senderId, { message_id: pogi.message_id, delete: true }, pageAccessToken);
      }
    } catch (error) {
      console.error("An error occurred while fetching the TikTok video:", error);
      await sendMessage(senderId, { text: "An error occurred while fetching the TikTok video." }, pageAccessToken);
    }
  }
};
