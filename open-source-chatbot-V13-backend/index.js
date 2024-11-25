import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import { promises as fs } from "fs";
import OpenAI from "openai";
import { franc } from "franc";
import ArabicReshaper from "arabic-reshaper";
import { content, trainingData } from "./content.js";

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
      if (error) reject(stderr);
      else resolve(stdout);
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
  const detectedLang = franc(text);
  const isArabic = detectedLang === "ara";

  let processedText = text;

  // Preprocess Arabic text
  if (isArabic) {
    console.log("Detected Arabic text. Reshaping for TTS...");
    processedText = ArabicReshaper.reshape(text);
    console.log("Reshaped Arabic Text:", processedText);
  }

  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: isArabic ? "fable" : "fable", // Adjust voice accordingly
      speed: isArabic ? 0.95 : 1.0, // Adjust speed for Arabic
      input: processedText,
    });
    return Buffer.from(await mp3.arrayBuffer());
  } catch (error) {
    console.error("OpenAI TTS API Error:", error.response?.data || error.message);
    throw error;
  }
};

// Function to process audio with FFmpeg
const processAudioWithFFmpeg = async (inputFile, outputFile) => {
  try {
    // Convert MP3 to high-quality WAV and adjust speed/pitch
    await execCommand(
      `ffmpeg -y -i ${inputFile} -ar 48000 -ac 2 -filter:a "atempo=1.05" ${outputFile}`
    );
    console.log(`Processed audio saved as ${outputFile}`);
  } catch (error) {
    console.error("FFmpeg Error:", error);
    throw new Error("Failed to process audio with FFmpeg");
  }
};

// Lip Sync Function
const lipSyncMessage = async (messageIndex, text) => {
  const mp3File = `audios/message_${messageIndex}.mp3`;
  const wavFile = `audios/message_${messageIndex}.wav`;
  const jsonFile = `audios/message_${messageIndex}.json`;

  try {
    const stats = await fs.stat(mp3File);
    if (stats.size < 1000) {
      console.error(
        `Audio file ${mp3File} is too small and may be corrupted. Skipping lip sync.`
      );
      return;
    }
  } catch (err) {
    console.error(
      `Audio file ${mp3File} does not exist or is inaccessible. Skipping lip sync.`
    );
    return;
  }

  // Detect language of the text
  const detectedLang = franc(text);
  console.log(`Detected language: ${detectedLang}`);

  // Process audio with FFmpeg
  await processAudioWithFFmpeg(mp3File, wavFile);

  // Use appropriate rhubarb command
  if (detectedLang === "ara") {
    await execCommand(
      `./bin/rhubarb -f json -o ${jsonFile} ${wavFile} -r phonetic --extended-dictionary "arabic-dictionary.txt"`
    );
  } else {
    await execCommand(`./bin/rhubarb -f json -o ${jsonFile} ${wavFile}`);
  }
};

// Define the message function schema for OpenAI Function Calling
const messageFunction = {
  name: "generate_messages",
  description:
    "Generate a list of messages with text, facial expression, and animation for each message. should not more or less than 7 seconds, more than 2 messages",
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
              enum: ["smile", "sad", "angry", "shocked", "thinking", "default"],
            },
            animation: {
              type: "string",
              description: "Animation for the message",
              enum: [
                "Talking_1",
                "Talking_2",
                "Talking_3",
                "Talking_4",
                "Standing_arguing",
                "Yelling",
                "Greeting",
                "Shaking_hands",
                "Quick_formal_bow",
                "Salute",
                "Sad_idle",
                "Salsa Dancing",
                "Hip_hop_dancing",
                "Angry_point",
                "Angry_crossed_armes",
                "Angry_gesture",
                "Pointing_forward",
                "Pointing_exited",
                "Kneeling_pointing_right",
                "Kneeling_pointing_left",
                "Whatever_gesture",
                "Goalkeeper_catch",
                "Telling_a_secret",
                "Clapping",
                "Exited",
                "Defeated",
                "Spin_in_place",
                "Pain_gesture",
              ],
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
      content: content
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
        const mp3File = `audios/message_${i}.mp3`;
        try {
          // Generate speech using the custom function
          const strText = message.text;
          console.log(`Generating speech for message ${i}:`, strText);
          const audioData = await generateSpeech(strText);
          await fs.writeFile(mp3File, audioData);
        } catch (error) {
          console.error("OpenAI TTS API Error:", error);
          return res
            .status(500)
            .send({ error: "OpenAI TTS API request failed." });
        }

        // Pass text to lipSyncMessage for language detection and processing
        await lipSyncMessage(i, message.text);
        message.audio = await audioFileToBase64(mp3File);
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
