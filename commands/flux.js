const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
    name: "flux",
    description: "Generate an image based on a given prompt using the Flux API.",
    author: "chilli",

    async execute(senderId, args, pageAccessToken) {
        if (args.length === 0) {
            return sendMessage(
                senderId,
                {
                    text: `Please provide a prompt to generate an image.\n\nUsage:\n` +
                          `flux <prompt> [model 1-5]\n` +
                          `Example without model: flux dog\n` +
                          `Example with model: flux dog 5`
                },
                pageAccessToken
            );
        }

        let model = 4;
        const lastArg = args[args.length - 1];
        if (/^[1-5]$/.test(lastArg)) {
            model = lastArg;
            args.pop();
        }

        const prompt = args.join(" ");

        sendMessage(senderId, { text: "Generating image... Please wait." }, pageAccessToken);

        try {
            const apiUrl = `https://joshweb.click/api/flux?prompt=${encodeURIComponent(prompt)}&model=${model}`;

            const response = await axios({
                method: "GET",
                url: apiUrl,
                responseType: "stream",
            });

            const cacheDir = path.join(__dirname, "cache");
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir);
            }

            const fileName = `flux_${Date.now()}.png`;
            const filePath = path.join(cacheDir, fileName);
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            writer.on("finish", async () => {
                await sendMessage(
                    senderId,
                    {
                        attachment: {
                            type: "image",
                            payload: {
                                url: filePath,
                            },
                        },
                    },
                    pageAccessToken
                );

                fs.unlink(filePath, (err) => {
                    if (err) console.error("Error deleting file:", err);
                });
            });

            writer.on("error", () => {
                sendMessage(
                    senderId,
                    { text: "There was an error generating the image. Please try again later." },
                    pageAccessToken
                );
                fs.unlink(filePath, (err) => {
                    if (err) console.error("Error deleting file:", err);
                });
            });
        } catch (error) {
            console.error("Error generating image:", error);
            sendMessage(senderId, { text: "An error occurred while generating the image. Please try again later." }, pageAccessToken);
        }
    },
};
