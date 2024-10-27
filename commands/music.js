const path = __dirname + "/cache/spotify/spotify.mp3";
const axios = require("axios");
const fs = require("fs");

module.exports = {
    name: "spotify",
    description: "Play and Download music from Spotify",
    author: "deku",

    async execute(senderId, args, pageAccessToken) {
        try {
            const { spotify, spotifydl } = require("betabotz-tools");
            const q = args.join(" ");
            if (!q) {
                return sendMessage(senderId, { text: "[ ! ] Please input a music title..." }, pageAccessToken);
            }

            // Notify user that the search is in progress
            await sendMessage(senderId, { text: "🔍 Searching for the music: " + q + "..." }, pageAccessToken);

            // Perform API calls to fetch song data
            const lyricsResponse = await axios.get(`https://lyrist.vercel.app/api/${encodeURIComponent(q)}`);
            const { lyrics, title } = lyricsResponse.data;

            const results = await spotify(encodeURI(q));
            const url = results.result.data[0].url;
            const result1 = await spotifydl(url);

            // Download the song as an audio buffer
            const dl = (
                await axios.get(result1.result, { responseType: "arraybuffer" })
            ).data;
            fs.writeFileSync(path, Buffer.from(dl, "utf-8"));

            // Send the downloaded audio file to the user
            await sendMessage(senderId, {
                attachment: {
                    type: "audio",
                    payload: {
                        is_reusable: true,
                        url: result1.result // use the direct Spotify download link
                    }
                }
            }, pageAccessToken);

            // Clean up the file after sending
            fs.unlinkSync(path);

        } catch (error) {
            console.error("Error occurred:", error);
            return sendMessage(senderId, { text: `Error: ${error.message}` }, pageAccessToken);
        }
    }
};

// Helper function to send messages to the user via the Page Bot API
async function sendMessage(recipientId, message, pageAccessToken) {
    try {
        await axios.post(
            `https://graph.facebook.com/v11.0/me/messages?access_token=${pageAccessToken}`,
            {
                recipient: { id: recipientId },
                message: message
            }
        );
    } catch (error) {
        console.error("Failed to send message:", error);
    }
}
