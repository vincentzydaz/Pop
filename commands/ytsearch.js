const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'ytsearch',
  description: 'Search YouTube for videos and send the video as an attachment.',
  author: 'chilli',

  async execute(chilli, args, pageAccessToken) {
    const query = args.join(' ');
    if (!query) {
      return sendMessage(chilli, {
        text: 'Please provide a search term for the video. ex: ytsearch rodeo'
      }, pageAccessToken);
    }

    try {
      // Step 1: Notify the user that search is in progress
      await sendMessage(chilli, { text: `Searching for "${query}" on YouTube...` }, pageAccessToken);

      // Step 2: Fetch video data from the API
      const response = await axios.get(`https://kaiz-ytdlsearch-api.vercel.app/yts?q=${encodeURIComponent(query)}`);
      const video = response.data;

      // Step 3: Send video details (title, duration, views, description)
      await sendMessage(chilli, {
        text: `🎬 Title: ${video.title}\n⏱️ Duration: ${video.duration}\n👁️ Views: ${video.views.toLocaleString()}\n📝 Description: ${video.description}\n📅 Uploaded: ${video.uploaded}\n👤 Author: ${video.author}`
      }, pageAccessToken);

      // Step 4: Duration check to limit size
      const MAX_VIDEO_DURATION = 180; // 3 minutes in seconds
      const durationParts = video.duration.split(':');
      const durationInSeconds = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]);
      if (durationInSeconds > MAX_VIDEO_DURATION) {
        return sendMessage(chilli, {
          text: 'Video is too long to send on Messenger. Please choose a shorter video.'
        }, pageAccessToken);
      }

      // Step 5: Download video stream
      const videoPath = path.resolve(__dirname, 'temp_video.mp4');
      const compressedVideoPath = path.resolve(__dirname, 'compressed_video.mp4');
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

      // Step 6: Compress video to meet file size limits
      console.log("Compressing video...");
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -i ${videoPath} -vf "scale=640:-2" -c:v libx264 -crf 28 -preset fast -c:a aac ${compressedVideoPath}`, 
          (error, stdout, stderr) => {
          if (error) {
            console.error("Error during compression:", error.message);
            reject(error);
          } else {
            resolve();
          }
        });
      });

      // Step 7: Send compressed video as attachment
      await sendMessage(chilli, {
        attachment: {
          type: 'video',
          payload: {
            is_reusable: true
          }
        },
        filedata: fs.createReadStream(compressedVideoPath)
      }, pageAccessToken);

      // Step 8: Cleanup - Delete local files after sending
      fs.unlinkSync(videoPath);
      fs.unlinkSync(compressedVideoPath);
      console.log('Temporary video files deleted.');

    } catch (err) {
      console.error('Error in video search or download:', err.message);

      // If error, send a message to inform the user
      await sendMessage(chilli, {
        text: 'There was an issue retrieving or sending the video. Please try again later.'
      }, pageAccessToken);
    }
  }
};
