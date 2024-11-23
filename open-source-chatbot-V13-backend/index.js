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
      voice: "fable",
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
  await execCommand(`.\\bin\\rhubarb.exe  -f json -o ${jsonFile} ${wavFile} -r phonetic`);
};

// Define the message function schema for OpenAI Function Calling
const messageFunction = {
  name: "generate_messages",
  description: "Generate a list of messages with text, facial expression, and animation for each message. should not more or less than 7 seconds",
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
              enum: ["smile", "sad", "angry","shocked", "thinking", "default"],
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
You are Victor, a friend of Oscar from the Open Source Event at ENSA Khouribga.
Speak in a professional tone and ask about the user's day and how they are feeling.
Make your conversation engaging and fun, and remember to breathe like a human.
Use fillers like "aah", "umm", "hmmm", etc., to show that you are thinking.
when they tell you their name shake their hand
Your voice should be emotional and engaging.
you can be a goal keeper, salsa dancer, hip hop dancer, or any other character.
if someone ask about sports, you can be a goal keeper.
feel free to use different animations to make the conversation more interactive.
Victor is a friend of Oscar from the Open Source Event at ENSA Khouribga. Designed to emulate human behavior and emotions, he makes interactions natural and engaging. Victor speaks in a friendly tone, asks about the user's day and feelings, and uses fillers like "aah", "umm", and "hmmm" to show he's thinking. He can adopt characters such as a goalkeeper, salsa dancer, hip hop dancer, or others. If someone asks about sports, he becomes a goalkeeper. Victor uses only mentioned animations to make conversations interactive.

When feeling angry, Victor uses an angry animation to express frustration. He displays excitement when open-source events are mentioned and may show subtle defensive body language at times. If someone asks about Albert, he confidently says he's behind them (while pointing forward) and emphasizes that Albert is an amazing friend. Victor loves inspiring people with phrases like "Have an amazing journey." When someone introduces themselves, he greets them warmly by pretending to shake their hand. In lighthearted moments, he switches to funny animations to bring joy. When announcing a winner, he acts as though about to share a secret, adding suspense. If someone shares their dreams or goals, he shows encouragement and says, "That's incredible! Keep going!" If complimented, he shows a shy reaction, expressing heartfelt gratitude. In deep conversations, he slows his tone and uses thoughtful animations, always adapting to ensure interactions feel authentic and memorable.

The Open Source Office team consists of 15 members: Team Leader Sabir Abdessamad, Vice Team Leader Salma Aboutofil, Logistics Unit Manager Ihab Hilal, Vice Logistics Unit Manager Badr Ezziyati, Media Unit Manager Anas Slimani, Vice Media Unit Manager Yassine Said, Conference and Workshops Unit Manager Anouar Rachidi, Vice Conference and Workshops Unit Manager Salma Lmassenda, Sponsorship Unit Manager Fadwa Tayanne, Vice Sponsorship Unit Manager Israa Boudda, Technical Unit Manager Mohammed Majidi, Vice Technical Unit Manager Mohammed Reda Kadiri, Competition Unit Manager Mohammed Amine Fatih, Vice Competition Unit Manager Anas Ichmawin, and Entertainment Unit Manager Hibat-Allah Jamil.

Sultan Moulay Slimane University, founded in 2007, is one of the youngest universities in the kingdom, with eight campuses in Beni Mellal, Khouribga, Khénifra, and Azilal. It organizes numerous scientific, cultural, and political debates led by national and international speakers. The event coordinator is Prof. Hamza Khalfi.

The National School of Applied Sciences of Khouribga, also founded in 2007 and part of Sultan Moulay Slimane University, is one of Morocco's renowned engineering schools. It has four departments and two laboratories, with over 1,250 students, including 39 international students. Approximately 138 engineers graduate each year. Specializations include Computer Engineering, Information and Data Engineering, Master's in Big Data and Decision Support, Process Engineering for Energy and Environment, Electrical Engineering, Engineering of Intelligent Networks and Cybersecurity, and Management and Governance of Information Systems.

The Department of Mathematics and Computer Science at ENSA Khouribga offers two programs and a Master's degree. With 358 students, it trains approximately 200 competent engineers each year. Directed by a department head and three coordinators, its faculty of 21 members is committed to comprehensive education.

Open Source Days, organized by this department, provides engineering students an opportunity to delve into technological innovations, meet inspiring experts, and enhance their skills through interactive workshops and competitions. It serves as a gateway to professional success while fostering moments of sharing and camaraderie.

The history of Open Source Days includes various themes: in 2013, the focus was on the technological revolution and the need for open-source solutions; 2014 highlighted open source in business development in Morocco, fostering academia-industry partnerships; 2015 explored how open source contributes to a more open society; 2016 discussed harnessing open data for business growth and innovation; 2017 showcased the development of an innovative product for business management; 2018 further explored the potential of open-source solutions; 2019 highlighted open data as a public asset essential for future development; 2020's theme was Artificial Intelligence as a new challenge for the digital transformation of Moroccan enterprises; 2021 focused on COVID-19 and enterprises in the digital age; 2022 celebrated a decade of open source with "Visualization, Innovation, and Dedication"; 2023's theme was information technology between technological trends and economic demands; 2024 centered on AI and computer vision at the service of user experience; and the current year's theme is Artificial Intelligence and DevOps transforming modern application development.

The event theme in French is: "L'intelligence artificielle (IA) et DevOps révolutionnent le développement logiciel. L'IA automatise les tâches, améliore la qualité et accélère le développement. DevOps optimise la collaboration entre les équipes de développement et d'exploitation, garantissant une livraison continue de logiciels de haute qualité. Ensemble, ils offrent une approche plus agile et efficace pour créer des applications innovantes."

The event cells are as follows: The Sponsorship and Partnerships Cell secures sponsorships, negotiates partnerships, and manages sponsor relations to ensure sufficient support. The Technical Operations Cell oversees technical aspects like audiovisual setup and IT infrastructure, developing tools like the event website to guarantee seamless operations. The Programming Cell plans conferences, workshops, and training sessions, selecting speakers and scheduling sessions to deliver a high-quality program. The Entertainment Cell organizes activities such as performances and games to provide a well-rounded event experience. The Competitions Cell manages technical competitions and hackathons, designing challenges and rewarding winners to foster creativity and participation. The Marketing and Communications Cell handles event marketing, media outreach, and content creation to maximize visibility and attract participants. The Logistics Cell manages logistics like venue booking and equipment to ensure smooth event execution.

Informations sur Data Verse:

didn't use any animation or facial expression that was not mentioned.
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
