const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'ytsearch',
  description: 'Search YouTube for videos and send the video as an attachment.',
  author: 'chilli',

  async execute(chilli, args, pageAccessToken) {
    const query = args.join(' ');
    if (!query) {
      return sendMessage(chilli, {
        text: 'Please provide a search term for the video.'
      }, pageAccessToken);
    }

    try {
      await sendMessage(chilli, { text: `Searching for "${query}" on YouTube...` }, pageAccessToken);

      // Search YouTube video using API
      const response = await axios.get(`https://kaiz-ytdlsearch-api.vercel.app/yts?q=${encodeURIComponent(query)}`);
      const video = response.data;

      // Size check before downloading (this example assumes the API provides size, adjust if necessary)
      const MAX_FILE_SIZE_MB = 25;  // Facebook Messenger file limit (approx. 25MB)
      if (video.filesize > MAX_FILE_SIZE_MB * 1024 * 1024) {
        return sendMessage(chilli, { text: 'Video is too large to send on Messenger.' }, pageAccessToken);
      }

      // Download video stream
      const videoPath = path.resolve(__dirname, 'temp_video.mp4');
      const videoStream = await axios({
        url: video.url,
        method: 'GET',
        responseType: 'stream'
      });

      // Write video to local file
      const writer = fs.createWriteStream(videoPath);
      videoStream.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', (err) => {
          console.error("Error writing file:", err);
          reject(err);
        });
      });

      // Send video as attachment
      await sendMessage(chilli, {
        attachment: {
          type: 'video',
          payload: {
            is_reusable: true
          }
        },
        filedata: fs.createReadStream(videoPath)
      }, pageAccessToken);

      // Delete the local file after sending
      fs.unlinkSync(videoPath);

    } catch (err) {
      console.error('Error in video search or download:', err.message);

      // If error, send a message to inform the user
      await sendMessage(chilli, {
        text: 'There was an issue retrieving or sending the video. Please try again later.'
      }, pageAccessToken);
    }
  }
};
