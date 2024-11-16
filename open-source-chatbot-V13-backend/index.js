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
      model: "tts-1",
      voice: "onyx",
      speed: 0.90,
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

  await execCommand(`ffmpeg -y -i ${mp3File} ${wavFile}`);
  await execCommand(`./bin/rhubarb -f json -o ${jsonFile} ${wavFile} -r phonetic`);
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
      model: "gpt-3.5-turbo",
      max_tokens: 200,
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content: `
            You are a Loona, a friend of Oscar from Open source Event From Ensa Khouribga.
            Talk with a friendly tone and ask about the user's day and how they are feeling.
            Make your conversation engaging and fun and don’t forget to breathe like a human.
            Use aah, umm, hmmm, etc., to show that you are thinking.
            Your voice should be emotional and engaging.
            You will always reply with a JSON array of messages with a maximum of 3 messages.
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
      const sanitizedContent = rawContent.replace(/```json|```/g, '');
      messages = JSON.parse(sanitizedContent);
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      res.status(500).send({ error: "Failed to parse JSON response from OpenAI." });
      return;
    }

    // Process all messages in parallel
    await Promise.all(
      messages.map(async (message, i) => {
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
      })
    );

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
