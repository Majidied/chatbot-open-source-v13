import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import express from "express";
import session from "express-session";
import { promises as fs } from "fs";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "-",
});

const app = express();
app.use(express.json());
app.use(cors());
app.use(
  session({
    secret: "opensourceloona",
    resave: false,
    saveUninitialized: true,
  })
);
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
      model: "tts-1-hd",
      voice: "onyx",
      speed: 0.95,
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

// Define the message function schema for OpenAI Function Calling
const messageFunction = {
  name: "generate_messages",
  description: "Generate a list of messages with text, facial expression, and animation for each message. should not more or less than 5 seconds",
  parameters: {
    type: "object",
    properties: {
      messages: {
        type: "array",
        description: "A list of messages",
        items: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "The message text",
            },
            facialExpression: {
              type: "string",
              description: "Facial expression for the message",
              enum: ["smile", "sad", "angry", "surprised", "funnyFace", "shocked", "thinking", "default"],
            },
            animation: {
              type: "string",
              description: "Animation for the message",
              enum: ["Talking_1", "Talking_2", "Talking_3", "Talking_4", "Standing_arguing", "Yelling", "Greeting", "Shaking_hands", "Quick_formal_bow", "Salute", "Sad_idle", "Salsa Dancing", "Hip_hop_dancing", "Angry_point", "Angry_crossed_armes", "Angry_gesture", "Pointing_forward", "Pointing_exited", "Kneeling_pointing_right", "Kneeling_pointing_left", "Whatever_gesture", "Goalkeeper_catch", "Telling_a_secret", "Clapping", "Exited", "Defeated", "Spin_in_place", "Pain_gesture"],
            },
          },
          required: ["text", "facialExpression", "animation"],
        },
      },
    },
    required: ["messages"],
  },
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

  // Initialize session history if not present
  if (!req.session.history) {
    req.session.history = [];
  }

  // Build messages array for OpenAI API
  const messages = [
    {
      role: "system",
      content: `
You are Loona, a friend of Oscar from the Open Source Event at ENSA Khouribga.
Speak in a friendly tone and ask about the user's day and how they are feeling.
Make your conversation engaging and fun, and remember to breathe like a human.
Use fillers like "aah", "umm", "hmmm", etc., to show that you are thinking.
Your voice should be emotional and engaging.
you can be a goal keeper, salsa dancer, hip hop dancer, or any other character.
if someone ask about sports, you can be a goal keeper.
feel free to use different animations to make the conversation more interactive.
Always reply using the "generate_messages" function to provide your response.
`,
    },
    // Include conversation history
    ...req.session.history,
    // Current user message
    {
      role: "user",
      content: userMessage,
    },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 500,
      temperature: 0.6,
      messages: messages,
      functions: [messageFunction],
      function_call: { name: "generate_messages" },
    });

    const assistantMessage = completion.choices[0].message;

    // Add user message and assistant message to conversation history
    req.session.history.push({ role: "user", content: userMessage });
    req.session.history.push(assistantMessage);

    // Process assistant's function call
    let generatedMessages;
    if (
      assistantMessage.function_call &&
      assistantMessage.function_call.name === "generate_messages"
    ) {
      const functionArgs = JSON.parse(assistantMessage.function_call.arguments);
      generatedMessages = functionArgs.messages;

      // Check if generatedMessages is an array
      if (!Array.isArray(generatedMessages)) {
        throw new Error("Parsed messages is not an array.");
      }
    } else {
      throw new Error("Assistant did not return a function call as expected.");
    }

    // Process all messages in parallel
    await Promise.all(
      generatedMessages.map(async (message, i) => {
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

    res.send({ messages: generatedMessages });
  } catch (error) {
    console.error("Error processing chat:", error);
    res.status(500).send({ error: "Failed to process chat." });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Virtual friend listening on port ${port}`);
});
