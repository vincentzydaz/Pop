const Deku = require("dekuai");
const deku = new Deku();
const fs = require("fs").promises;
const path = require("path");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "avatar",
  description: "Generate Anime Profile",
  usage: "-avatar <signature> | <bgText> | <charId> | <color>",
  author: "Churchill",
  async execute(senderId, args, pageAccessToken) {
    const filePath = path.join(__dirname, "cache", "profile.png");
    const formatMessage = `Wrong Format\nUsage: ${this.name} <signature> | <bgText> | <charId> | <color>`;

    const validate = (inp) => {
      const [signature, bgText, charId, color] = inp;
      if (!signature) throw new Error("Signature is required.");
      if (!bgText) throw new Error("Background text is required.");
      if (!charId) throw new Error("Character ID is required.");
      if (!color) throw new Error("Color is required.");
      return { signature, bgText, charId, color };
    };

    try {
      const input = args.join(" ");
      if (!input) {
        await sendMessage(senderId, { text: formatMessage }, pageAccessToken);
        return;
      }

      const inpArgs = input.split(" | ");
      const { signature, bgText, charId, color } = validate(inpArgs);

      await sendMessage(senderId, { text: "Generating the image..." }, pageAccessToken);

      // Generate the profile image using deku API
      const profileImage = await deku.profile(charId, bgText, signature, color);
      await fs.writeFile(filePath, profileImage);

      // Send the generated image with details
      const message = {
        text: `Background text: ${bgText}\nSignature: ${signature}\nCharacter ID: ${charId}\nColor: ${color}`,
        attachment: {
          type: 'image',
          payload: {
            url: filePath,
            is_reusable: true
          }
        }
      };

      await sendMessage(senderId, message, pageAccessToken);
      await fs.unlink(filePath);

    } catch (error) {
      await sendMessage(senderId, { text: `Error: ${error.message}` }, pageAccessToken);
    }
  }
};
