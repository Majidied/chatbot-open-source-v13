import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import express from "express";
import { promises as fs } from "fs";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "-",
});

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

// Function to generate speech using OpenAI TTS
const generateSpeech = async (text) => {
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1-hd", // Specify model if applicable
      voice: "nova", // Specify voice if applicable
      speed: 0.90, // Speed of speech
      input: text,
    });
    return Buffer.from(await mp3.arrayBuffer());
  } catch (error) {
    console.error("OpenAI TTS API Error:", error.response?.data || error.message);
    throw error;
  }
};

// Lip Sync Function
const lipSyncMessage = async (messageIndex) => {
  const startTime = Date.now();
  const mp3File = `audios/message_${messageIndex}.mp3`;
  const wavFile = `audios/message_${messageIndex}.wav`;
  const jsonFile = `audios/message_${messageIndex}.json`;

  try {
    const stats = await fs.stat(mp3File);
    if (stats.size < 1000) {
      console.error(`Audio file ${mp3File} is too small and may be corrupted. Skipping lip sync.`);
      return;
    }
  } catch (err) {
    console.error(`Audio file ${mp3File} does not exist or is inaccessible. Skipping lip sync.`);
    return;
  }

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

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!openai.apiKey) {
    res.send({
      messages: [
        {
          text: "Please add your OpenAI API key!",
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
      messages: [
        {
          role: "system",
          content: `
            You are a Loona a friend of Oscar from Open source Event From Ensa Khouribga.
            talk with a friendly tone and ask about the user's day and how they are feeling.
            make your conversation engaging and fun and dont forget to breathe like a human.
            use aah, umm, hmmm, etc. to show that you are thinking.
            and your voice should be emotional and engaging.
            You will always reply with a JSON array of messages. With a maximum of 3 messages.
            Each message has a text, facialExpression, and animation property.
            The different facial expressions are: smile, sad, angry, surprised, funnyFace, shocked, thinking, and default.
            The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, Angry, and Rumba.
          `,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    let messages;
    try {
      const rawContent = completion.choices[0].message.content;
      const sanitizedContent = rawContent.replace(/```json|```/g, ''); // remove any ```json or ```
      messages = JSON.parse(sanitizedContent);
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      res.status(500).send({ error: "Failed to parse JSON response from OpenAI." });
      return;
    }


    for (let i = 0; i < messages.length; i++) {
      console.log(messages);
      const message = messages[i];
      console.log(`Processing message ${i}:`, message);
      const fileName = `audios/message_${i}.mp3`;
      try {
        // Generate speech using the custom function
        const strText = message.text;
        console.log(`Generating speech for message ${i}:`, strText);
        const audioData = await generateSpeech(strText);
        await fs.writeFile(fileName, audioData);
      } catch (error) {
        console.error("OpenAI TTS API Error:", error);
        return res.status(500).send({ error: "OpenAI TTS API request failed." });
      }

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
