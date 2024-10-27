const axios = require('axios');
const fs = require('fs');
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

      // Download the video file
      const videoStream = await axios({
        url: video.url,   // Video URL from API
        method: 'GET',
        responseType: 'stream'
      });

      const videoPath = `./temp_video.mp4`;  // Temporary file path

      // Save the video stream to a local file
      const writer = fs.createWriteStream(videoPath);
      videoStream.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Send video file as attachment to Facebook Messenger
      await sendMessage(chilli, {
        attachment: {
          type: 'video',   // Specify attachment type as video
          payload: {
            is_reusable: true  // Optional: make the video reusable
          }
        },
        filedata: fs.createReadStream(videoPath) // Attach the video file
      }, pageAccessToken);

      // Cleanup: delete the local video file
      fs.unlinkSync(videoPath);

    } catch (err) {
      console.error('Error fetching or sending video:', err);
      await sendMessage(chilli, {
        text: 'There was an issue retrieving or sending the video. Please try again later.'
      }, pageAccessToken);
    }
  }
};
