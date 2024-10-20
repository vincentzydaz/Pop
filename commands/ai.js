const axios = require("axios");

module.exports = {
  name: "ai",
  description: "Interact with GPT-4 using a custom API and receive responses in Gothic font.",
  author: "Churchill",

  async execute(senderId, args, pageAccessToken, sendMessage) {
    const prompt = args.join(" ");
    if (!prompt) {
      return sendMessage(senderId, { text: `Usage: ai [your question]` }, pageAccessToken);
    }

    sendMessage(senderId, { text: "Processing your request..." }, pageAccessToken);

    try {
      const response = await axios.get("https://ccprojectapis.ddns.net/api/gpt4o-v2", {
        params: { prompt: prompt }
      });

      const result = convertToGothic(response.data.response);
      sendLongMessage(senderId, result, pageAccessToken, sendMessage);

    } catch (error) {
      console.error("Error while processing your request:", error);
      sendMessage(senderId, { text: "Error while processing your request. Please try again." }, pageAccessToken);
    }
  }
};

// Converts text to Gothic font using the gothicFont map
function convertToGothic(text) {
  const gothicFont = {
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩",
    K: "𝖪", L: "𝖫", M: "𝖬", N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳",
    U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹", a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽",
    e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏",
    w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓", 0: "𝟢", 1: "𝟣", 2: "𝟤", 3: "𝟥", 4: "𝟦",
    5: "𝟧", 6: "𝟨", 7: "𝟩", 8: "𝟪", 9: "𝟫"
  };

  return text.split('').map(char => gothicFont[char] || char).join('');
}

// Sends a long message in chunks
function sendLongMessage(senderId, text, pageAccessToken, sendMessage) {
  const maxMessageLength = 2000;
  const delayBetweenMessages = 1000; // 1 second

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);

    sendMessage(senderId, { text: messages[0] }, pageAccessToken);

    messages.slice(1).forEach((message, index) => {
      setTimeout(() => sendMessage(senderId, { text: message }, pageAccessToken), (index + 1) * delayBetweenMessages);
    });
  } else {
    sendMessage(senderId, { text }, pageAccessToken);
  }
}

// Splits a message into chunks of the specified size
function splitMessageIntoChunks(message, chunkSize) {
  const regex = new RegExp(`.{1,${chunkSize}}`, 'g');
  return message.match(regex);
}
