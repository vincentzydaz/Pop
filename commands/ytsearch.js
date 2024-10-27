const axios = require('axios');
const fs = require('fs');
const { sendMessage } = require('../handles/sendMessage');
const FormData = require('form-data');
const path = require('path');

module.exports = {
  name: 'ytsearch',
  description: 'Search for a YouTube video by title and retrieve its details, then send the video as an attachment.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken) {
    const query = args.join(' ');
    if (!query) {
      return sendMessage(senderId, {
        text: 'Please provide a search term to find a YouTube video.'
      }, pageAccessToken);
    }

    try {
      // Notify the user that the search is being performed
      await sendMessage(senderId, { text: `Searching for "${query}" on YouTube... 🔍` }, pageAccessToken);

      // Call the YouTube search API with the query
      const response = await axios.get(`https://kaiz-ytdlsearch-api.vercel.app/yts?q=${encodeURIComponent(query)}`);
      const videoData = response.data;
      const videoUrl = videoData.url;

      // Send the video details as a message to the user
      await sendMessage(senderId, {
        text: `🎬 *${videoData.title}*\n\n👤 Author: ${videoData.author}\n👁️ Views: ${videoData.views.toLocaleString()}\n⏱️ Duration: ${videoData.duration}\n📅 Uploaded: ${videoData.uploaded}\n\n📝 Description: ${videoData.description}`
      }, pageAccessToken);

      // Download the video to a temporary file
      const videoPath = path.resolve(__dirname, 'temp_video.mp4');
      const videoStream = await axios({
        url: videoUrl,
        method: 'GET',
        responseType: 'stream'
      });
      videoStream.data.pipe(fs.createWriteStream(videoPath));

      // Wait for the video to finish downloading
      await new Promise((resolve, reject) => {
        videoStream.data.on('end', resolve);
        videoStream.data.on('error', reject);
      });

      // Prepare the video for uploading to Facebook
      const form = new FormData();
      form.append('file', fs.createReadStream(videoPath));

      // Upload the video to Facebook
      const uploadResponse = await axios.post(
        `https://graph.facebook.com/v13.0/me/messages`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${pageAccessToken}`
          },
          params: {
            recipient: JSON.stringify({ id: senderId }),
            message: JSON.stringify({ attachment: { type: 'video', payload: {} } })
          }
        }
      );

      // Clean up the temporary video file
      fs.unlinkSync(videoPath);

    } catch (error) {
      console.error('Error fetching or sending video:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while processing the video. Please try again later.'
      }, pageAccessToken);
    }
  }
};
