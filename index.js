const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { handleMessage } = require('./handles/handleMessage');
const { handlePostback } = require('./handles/handlePostback');
const { sendMessage } = require('./handles/sendMessage');

const app = express();
app.use(express.json());

const VERIFY_TOKEN = 'pagebot';
const PAGE_ACCESS_TOKEN = fs.readFileSync('token.txt', 'utf8').trim();
const COMMANDS_PATH = path.join(__dirname, 'commands');

app.get('/webhook', (req, res) => {
  const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }
});

app.post('/webhook', (req, res) => {
  const { body } = req;

  if (body.object === 'page') {
    body.entry?.forEach(entry => {
      entry.messaging?.forEach(event => {
        if (event.message) {
          handleMessage(event, PAGE_ACCESS_TOKEN);
        } else if (event.postback) {
          handlePostback(event, PAGE_ACCESS_TOKEN);
        }
      });
    });

    return res.status(200).send('EVENT_RECEIVED');
  }

  res.sendStatus(404);
});

const loadCommands = () => fs.readdirSync(COMMANDS_PATH)
  .filter(file => file.endsWith('.js'))
  .map(file => {
    const command = require(path.join(COMMANDS_PATH, file));
    return command.name && command.description ? { name: `-${command.name}`, description: command.description } : null;
  })
  .filter(Boolean);

const loadMenuCommands = async () => {
  const commands = loadCommands();

  try {
    await axios.post(`https://graph.facebook.com/v21.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`, {
      commands: [{ locale: "default", commands }],
    }, {
      headers: { "Content-Type": "application/json" }
    });

    console.log("Menu commands loaded successfully.");
  } catch (error) {
    console.error("Error loading menu commands:", error);
  }
};

const reloadMenuCommands = async () => {
  try {
    await axios.delete(`https://graph.facebook.com/v21.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}&fields=commands`, {
      headers: { "Content-Type": "application/json" }
    });

    console.log("Menu commands deleted successfully.");
    await loadMenuCommands();
  } catch (error) {
    console.error("Error reloading menu commands:", error);
  }
};

fs.watch(COMMANDS_PATH, (eventType, filename) => {
  if ((eventType === 'change' || eventType === 'rename') && filename.endsWith('.js')) {
    reloadMenuCommands();
  }
});

const setupGetStartedButton = async () => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
      { get_started: { payload: 'GET_STARTED_PAYLOAD' } },
      { headers: { "Content-Type": "application/json" } }
    );
    console.log('Get Started button set up successfully:', response.data);
  } catch (error) {
    console.error('Error setting up Get Started button:', error.response ? error.response.data : error);
  }
};

const setupGreetingMessage = async () => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
      { greeting: [{ locale: 'default', text: 'Hello! Welcome to our bot. Click "Get Started" to begin!' }] },
      { headers: { "Content-Type": "application/json" } }
    );
    console.log('Greeting message set up successfully:', response.data);
  } catch (error) {
    console.error('Error setting up greeting message:', error.response ? error.response.data : error);
  }
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await loadMenuCommands();
  await setupGetStartedButton();
  await setupGreetingMessage();
});
