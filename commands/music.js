const path = __dirname + "/cache/spotify/spotify.mp3";
const axios = require("axios");
const fs = require("fs");

module.exports = {
    name: "music",
    description: "Play and Download music",
    author: "deku",

    async execute(bundas, yakzy, kupalboss) {
        try {
            const { spotify, spotifydl } = require("betabotz-tools");
            const q = yakzy.join(" ");
            if (!q) {
                return sendMessage(bundas, { text: "[ ! ] Please input a music title..." }, kupalboss);
            }

            await sendMessage(bundas, { text: "🔍 Searching for the music: " + q + "..." }, kupalboss);

            const lyricsResponse = await axios.get(`https://lyrist.vercel.app/api/${encodeURIComponent(q)}`);
            const { lyrics, title } = lyricsResponse.data;

            const results = await spotify(encodeURI(q));
            const url = results.result.data[0].url;
            const result1 = await spotifydl(url);

            const dl = (
                await axios.get(result1.result, { responseType: "arraybuffer" })
            ).data;
            fs.writeFileSync(path, Buffer.from(dl, "utf-8"));

            await sendMessage(bundas, {
                attachment: {
                    type: "audio",
                    payload: {
                        is_reusable: true,
                        url: result1.result
                    }
                }
            }, kupalboss);

            fs.unlinkSync(path);

        } catch (error) {
            console.error("Error occurred:", error);
            return sendMessage(bundas, { text: `Error: ${error.message}` }, kupalboss);
        }
    }
};

async function sendMessage(bundas, message, kupalboss) {
    try {
        await axios.post(
            `https://graph.facebook.com/v11.0/me/messages?access_token=${kupalboss}`,
            {
                recipient: { id: bundas },
                message: message
            }
        );
    } catch (error) {
        console.error("Failed to send message:", error);
    }
}

async function sendConcatenatedMessage(bundas, text, kupalboss) {
    const maxMessageLength = 2000;

    if (text.length > maxMessageLength) {
        const messages = splitMessageIntoChunks(text, maxMessageLength);

        for (const message of messages) {
            await new Promise(resolve => setTimeout(resolve, 500));
            await sendMessage(bundas, { text: message }, kupalboss);
        }
    } else {
        await sendMessage(bundas, { text }, kupalboss);
    }
}

function splitMessageIntoChunks(message, chunkSize) {
    const chunks = [];
    for (let i = 0; i < message.length; i += chunkSize) {
        chunks.push(message.slice(i, i + chunkSize));
    }
    return chunks;
}
