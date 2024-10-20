const axios = require('axios');

module.exports = {
  name: "shoti",
  description: "Nagpapadala ng random na Chilli video",
  author: "Chilli",

  async execute(senderId, args, pageAccessToken, sendMessage) {
    try {
      const response = await axios.get('https://betadash-shoti-yazky.vercel.app/shotizxx?apikey=shipazu');
      const { shotiurl: pogiurl, username: chilliName, nickname: pogiName, duration: pogiDuration } = response.data;

      await sendMessage(senderId, {
        text: `Username: ${chilliName}\nNickname: ${pogiName}\nDuration: ${pogiDuration} seconds`
      }, pageAccessToken);

      await sendMessage(senderId, {
        attachment: {
          type: "video",
          payload: {
            url: pogiurl
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error("Nabigong kunin ang Chilli video:", error);
      sendMessage(senderId, {
        text: `Nabigong kunin ang Chilli video. Error: ${error.message || error}`
      }, pageAccessToken);
    }
  }
};
