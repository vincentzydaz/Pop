const axios = require("axios");

module.exports = {
  name: "lyrics",
  description: "Get song lyrics by title",
  author: "chilli",

  async execute(senderId, args, pageAccessToken, sendMessage) {
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

      if (!res || !res.data || !res.data.content) {
        throw new Error("No lyrics found for this song.");
      }

      const { title, artist, lyrics, url, song_thumbnail } = res.data.content;

      const maxLyricsLength = 2000;
      let trimmedLyrics = lyrics;
      if (lyrics.length > maxLyricsLength) {
        trimmedLyrics = lyrics.substring(0, maxLyricsLength) + "...";
      }

      const lyricsMessage = `🎵 *${title}* by *${artist}*\n\n${trimmedLyrics}\n\n🔗 Read more: ${url}`;
      await sendMessage(senderId, { text: lyricsMessage }, pageAccessToken);

      // Send song thumbnail if available
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
