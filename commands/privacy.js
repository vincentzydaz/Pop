module.exports = {
  name: 'privacy',
  description: 'Rules for using the page bot',
  usage: 'privacy',
  author: 'cliff',
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const termsAndConditions = `𝗧𝗘𝗥𝗠𝗦 𝗢𝗙 𝗦𝗘𝗥𝗩𝗜𝗖𝗘 & 𝗣𝗥𝗜𝗩𝗔𝗖𝗬 𝗣𝗢𝗟𝗜𝗖𝗬

By using this bot, you agree to:
1. 𝗜𝗻𝘁𝗲𝗿𝗮𝗰𝘁𝗶𝗼𝗻: Automated responses may log interactions to improve service.
2. 𝗗𝗮𝘁𝗮: We collect data to enhance functionality without sharing it.
3. 𝗦𝗲𝗰𝘂𝗿𝗶𝘁𝘆: Your data is protected.
4. 𝗖𝗼𝗺𝗽𝗹𝗶𝗮𝗻𝗰𝗲: Follow Facebook's terms or risk access restrictions.
5. 𝗨𝗽𝗱𝗮𝘁𝗲𝘀: Terms may change, and continued use implies acceptance.

Failure to comply may result in access restrictions.`;

    const kupal = {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: termsAndConditions,
          buttons: [
            {
              type: "web_url",
              url: "https://privacy-policy-jet-sigma.vercel.app/",
              title: "PRIVACY POLICY"
            }
          ]
        }
      }
    };
    sendMessage(senderId, kupal, pageAccessToken);
  }
};
