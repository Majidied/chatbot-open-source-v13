import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express from "express";
import { promises as fs } from "fs";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = "kgG7dCoKCfLehAPWkJOE";

const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 3000;

// Utility functions
const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

const lipSyncMessage = async (messageIndex) => {
  const startTime = Date.now();
  const mp3File = `audios/message_${messageIndex}.mp3`;
  const wavFile = `audios/message_${messageIndex}.wav`;
  const jsonFile = `audios/message_${messageIndex}.json`;

  console.log(`Starting conversion for message ${messageIndex}`);
  await execCommand(`ffmpeg -y -i ${mp3File} ${wavFile}`);
  console.log(`Conversion done in ${Date.now() - startTime}ms`);

  console.log(`Starting lip sync for message ${messageIndex}`);
  await execCommand(`./bin/rhubarb -f json -o ${jsonFile} ${wavFile} -r phonetic`);
  console.log(`Lip sync done in ${Date.now() - startTime}ms`);
};

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/voices", async (req, res) => {
  try {
    const voices = await voice.getVoices(elevenLabsApiKey);
    res.send(voices);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch voices." });
  }
});

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!elevenLabsApiKey || !openai.apiKey) {
    res.send({
      messages: [
        {
          text: "Please my dear, don't forget to add your API keys!",
          audio: await audioFileToBase64("audios/api_0.wav"),
          lipsync: await readJsonTranscript("audios/api_0.json"),
          facialExpression: "thinking",
          animation: "Angry",
        },
        {
          text: "You don't want to ruin Wawa Sensei with a crazy ChatGPT and ElevenLabs bill, right?",
          audio: await audioFileToBase64("audios/api_1.wav"),
          lipsync: await readJsonTranscript("audios/api_1.json"),
          facialExpression: "smile",
          animation: "Talking_1",
        },
      ],
    });
    return;
  }

  const defaultMessages = [
    {
      text: "Hey dear... How was your day?",
      audio: await audioFileToBase64("audios/intro_0.wav"),
      lipsync: await readJsonTranscript("audios/intro_0.json"),
      facialExpression: "smile",
      animation: "Talking_1",
    },
    {
      text: "I missed you so much... Please don't go for so long!",
      audio: await audioFileToBase64("audios/intro_1.wav"),
      lipsync: await readJsonTranscript("audios/intro_1.json"),
      facialExpression: "sad",
      animation: "Crying",
    },
  ];

  if (!userMessage) {
    res.send({ messages: defaultMessages });
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 200,
      temperature: 0.6,
      response_format: "json_object",
      messages: [
        {
          role: "system",
          content: `
            You are a virtual girlfriend.
            You will always reply with a JSON array of messages. With a maximum of 3 messages.
            Each message has a text, facialExpression, and animation property.
            The different facial expressions are: smile, sad, angry, surprised, funnyFace, shocked, thinking, and default.
            The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, Angry, and Rumba. 
          `,
        },
        {
          role: "user",
          content: userMessage || "Hello",
        },
      ],
    });

    let messages = JSON.parse(completion.choices[0].message.content);
    if (messages.messages) {
      messages = messages.messages;
    }

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const fileName = `audios/message_${i}.mp3`;
      await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, message.text);
      await lipSyncMessage(i);
      message.audio = await audioFileToBase64(fileName);
      message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
    }

    res.send({ messages });
  } catch (error) {
    console.error("Error processing chat:", error);
    res.status(500).send({ error: "Failed to process chat." });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Virtual friend listening on port ${port}`);
});
