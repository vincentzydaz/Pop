const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "lyrics",
  description: "Get song lyrics by title",
  author: "chilli",

  async execute(senderId, args, pageAccessToken) {
    const songTitle = args.join(" ");

    if (!songTitle) {
      return sendMessage(senderId, {
        text: `Usage: lyrics [song title]`
      }, pageAccessToken);
    }

    try {
      const res = await axios.get(`https://markdevs69v2-679r.onrender.com/api/lyrics/song`, {
        params: { title: songTitle }
      });

      if (!res.data || !res.data.content) {
        throw new Error("No lyrics found for this song.");
      }

      const { title, artist, lyrics, url, song_thumbnail } = res.data.content;
      const lyricsMessage = `🎵 *${title}* by *${artist}*\n\n${lyrics}\n\n🔗 Read more: ${url}`;

      sendChunkedMessage(senderId, lyricsMessage, pageAccessToken);

      if (song_thumbnail) {
        await sendMessage(senderId, {
          attachment: {
            type: "image",
            payload: {
              url: song_thumbnail
            }
          }
        }, pageAccessToken);
      }

    } catch (error) {
      console.error("Error retrieving lyrics:", error);
      sendMessage(senderId, {
        text: `Error retrieving lyrics. Please try again or check your input.`
      }, pageAccessToken);
    }
  }
};

function sendChunkedMessage(senderId, text, pageAccessToken) {
  const maxMessageLength = 2000;
  const delayBetweenMessages = 2000; // Delay of 2 seconds

  if (text.length > maxMessageLength) {
    const halfLength = Math.ceil(text.length / 2);
    const firstHalf = text.slice(0, halfLength);
    const secondHalf = text.slice(halfLength);

    sendMessage(senderId, { text: firstHalf }, pageAccessToken);

    setTimeout(() => {
      sendMessage(senderId, { text: secondHalf }, pageAccessToken);
    }, delayBetweenMessages);
  } else {
    sendMessage(senderId, { text }, pageAccessToken);
  }
}
