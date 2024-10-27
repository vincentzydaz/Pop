const path = __dirname + "/cache/spotify/spotify.mp3";
const axios = require("axios");
const fs = require("fs");

module.exports = {
    name: "music",
    description: "Play and Download music",
    author: "chilli",

    async execute(senderId, args, pageAccessToken) {
        try {
            const { spotify, spotifydl } = require("betabotz-tools");
            const q = args.join(" ");
            if (!q) {
                return await sendMessage(senderId, { text: "[ ? ] Please input a music title..." }, pageAccessToken);
            }

            await sendMessage(senderId, { text: "🔍 Searching for the music: " + q + "..." }, pageAccessToken);

            const lyricsResponse = await axios.get(`https://lyrist.vercel.app/api/${encodeURIComponent(q)}`);
            const { lyrics, title } = lyricsResponse.data;

            const results = await spotify(encodeURI(q));
            console.log("Spotify Results:", results); // Debugging line

            if (!results.result || !results.result.data || results.result.data.length === 0) {
                return await sendMessage(senderId, { text: "[ ! ] No results found for the specified title." }, pageAccessToken);
            }

            const url = results.result.data[0].url;
            const result1 = await spotifydl(url);

            const dl = (
                await axios.get(result1.result, { responseType: "arraybuffer" })
            ).data;
            fs.writeFileSync(path, Buffer.from(dl, "utf-8"));

            await sendMessage(senderId, {
                attachment: {
                    type: "audio",
                    payload: {
                        is_reusable: true,
                        url: result1.result
                    }
                }
            }, pageAccessToken);

            fs.unlinkSync(path);

        } catch (error) {
            console.error("Error occurred:", error);
            await sendMessage(senderId, { text: `Error: ${error.message}` }, pageAccessToken);
        }
    }
};

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

async function sendConcatenatedMessage(senderId, text, pageAccessToken) {
    const maxMessageLength = 2000;

    if (text.length > maxMessageLength) {
        const messages = splitMessageIntoChunks(text, maxMessageLength);

        for (const message of messages) {
            await new Promise(resolve => setTimeout(resolve, 500));
            await sendMessage(senderId, { text: message }, pageAccessToken);
        }
    } else {
        await sendMessage(senderId, { text }, pageAccessToken);
    }
}

function splitMessageIntoChunks(message, chunkSize) {
    const chunks = [];
    for (let i = 0; i < message.length; i += chunkSize) {
        chunks.push(message.slice(i, i + chunkSize));
    }
    return chunks;
}
