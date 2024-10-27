const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { handleMessage } = require('./handles/handleMessage');
const { handlePostback } = require('./handles/handlePostback');
const { exec, spawn } = require("child_process");

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = 'pagebot';
const PAGE_ACCESS_TOKEN = fs.readFileSync('token.txt', 'utf8').trim();
const SCRIPT_FILE = "index.js";
const SCRIPT_PATH = __dirname + "/" + SCRIPT_FILE;
const RESTART_FILE = './restart.json';
const GIT_REPO = "https://github.com/churchillitos/Pgiboka.git";

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      entry.messaging.forEach(event => {
        if (event.message) {
          handleMessage(event, PAGE_ACCESS_TOKEN);
        } else if (event.postback) {
          handlePostback(event, PAGE_ACCESS_TOKEN);
        }
      });
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: __dirname, shell: true }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${command}`, error);
        return reject(error);
      }
      console.log(stdout);
      if (stderr) console.error(stderr);
      resolve();
    });
  });
}

async function loadBot() {
  console.log("Starting the bot...");

  try {
    console.log("Pulling latest updates from the repository...");
    await executeCommand(`git pull ${GIT_REPO} main --ff-only`);
    console.log("Code updated successfully.");
  } catch (error) {
    console.log("Failed to update code from the repository. Proceeding without update.");
  }

  const executeBot = (cmd, args) => {
    return new Promise((resolve, reject) => {
      let process_ = spawn(cmd, args, {
        cwd: __dirname,
        stdio: "inherit",
        shell: true,
      });

      process_.on("close", (exitCode) => {
        if (exitCode === 1) {
          console.log("Restarting bot...");
          checkRestartFile();
        } else {
          console.log(`Bot stopped with code ${exitCode}`);
        }
        resolve();
      });
    });
  };

  executeBot("node", [SCRIPT_PATH]).catch(console.error);
}

function checkRestartFile() {
  if (fs.existsSync(RESTART_FILE)) {
    fs.unlinkSync(RESTART_FILE);
    loadBot();
  } else {
    console.log("No restart file found. Bot will not restart.");
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  checkRestartFile();
});
