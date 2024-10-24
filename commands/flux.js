const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
    name: "flux",
    description: "Generate an image based on a given prompt using the Flux API.",
    author: "Churchill",

    async execute(senderId, args, pageAccessToken) {
        if (args.length === 0) {
            return sendMessage(senderId, { 
                text: `Please provide a prompt to generate an image.\n\nUsage:\n` + 
                      `flux <prompt> [model 1-5]\n` + 
                      `Example without model: flux dog\n` + 
                      `Example with model: flux dog 5`
            }, pageAccessToken);
        }

        let model = 4; // Default model
        const lastArg = args[args.length - 1];
        if (/^[1-5]$/.test(lastArg)) {
            model = lastArg;
            args.pop();
        }

        const prompt = args.join(' ');

        const apiUrl = `https://joshweb.click/api/flux?prompt=${encodeURIComponent(prompt)}&model=${model}`;

        sendMessage(senderId, { text: "Generating image... Please wait." }, pageAccessToken);

        try {
            const response = await axios.get(apiUrl);
            const imageUrl = response.data.imageUrl; // Assuming API returns image URL

            if (imageUrl) {
                await sendMessage(senderId, {
                    attachment: {
                        type: 'image',
                        payload: {
                            url: imageUrl
                        }
                    }
                }, pageAccessToken);
            } else {
                sendMessage(senderId, { text: "Failed to retrieve the image. Please try again." }, pageAccessToken);
            }

        } catch (error) {
            console.error('Error generating image:', error);
            sendMessage(senderId, { text: "An error occurred while generating the image. Please try again later." }, pageAccessToken);
        }
    }
};
