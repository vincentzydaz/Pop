const axios = require("axios");
const fs = require("fs");
const path = __dirname + "/cache/spotify/spotify.mp3";
const { spotify, spotifydl } = require("betabotz-tools");

module.exports = {
    name: "music",
    description: "Play and Download music",
    author: "chilli",
    
    async execute(senderId, args, pageAccessToken) {
        try {
            const q = args.join(" ");
            if (!q) {
                await sendMessage(senderId, { text: "[ ! ] Please input a music title..." }, pageAccessToken);
                return;
            }

            await sendMessage(senderId, { text: `🔍 Searching for the music: ${q}...` }, pageAccessToken);

            // Step 1: Search for the music on Spotify
            const results = await spotify(encodeURI(q));
            if (!results || !results.result || !results.result.data || results.result.data.length === 0) {
                await sendMessage(senderId, { text: "[ ! ] No results found for the specified title." }, pageAccessToken);
                return;
            }

            const songUrl = results.result.data[0].url;

            // Step 2: Download the music using spotifydl
            const downloadResult = await spotifydl(songUrl);
            const dl = (await axios.get(downloadResult.result, { responseType: "arraybuffer" })).data;
            fs.writeFileSync(path, Buffer.from(dl, "utf-8"));

            // Step 3: Send the audio file
            await sendMessage(senderId, {
                attachment: {
                    type: "audio",
                    payload: {
                        is_reusable: true,
                        url: downloadResult.result
                    }
                }
            }, pageAccessToken);

            // Clean up
            fs.unlinkSync(path);
        } catch (error) {
            console.error("Error occurred:", error);
            await sendMessage(senderId, { text: `Error: ${error.message}` }, pageAccessToken);
        }
    }
};

// Helper function to send messages through the Facebook API
async function sendMessage(senderId, message, pageAccessToken) {
    try {
        await axios.post(
            `https://graph.facebook.com/v11.0/me/messages?access_token=${pageAccessToken}`,
            {
                recipient: { id: senderId },
                message: message
            }
        );
    } catch (error) {
        console.error("Failed to send message:", error);
    }
}
