# Chatbot - Open Source V13

## Overview

Open Source Chatbot V13 is a chatbot application with both backend and frontend components. The backend is built using Node.js and Express, while the frontend is built using React and Vite. The chatbot uses the Blenderbot model for generating responses and integrates text-to-speech and lip sync functionalities.

## Project Structure

```
open-source-chatbot-V13-backend/
 .env
 .env.example
 .gitignore
 audios/
  api_0.json
  api_1.json
  intro_0.json
  intro_1.json
 index.js
 local_model.py
 package.json
 README.md
open-source-chatbot-V13-frontend/
 .gitignore
 index.html
 package.json
 postcss.config.js
 public/
  animations/
   Angry.fbx
   Crying.fbx
   ...
  models/
   ...
 README.md
 src/
  App.jsx
  assets/
  components/
  hooks/
  index.css
  main.jsx
 tailwind.config.js
 vite.config.js
README.md
```

## Backend

### Description

The backend handles the following functionalities:

- **Chat Endpoint**: Processes user messages, generates responses, and sends them back to the frontend.
- **Text-to-Speech**: Converts text messages to audio files using the ElevenLabs API.
- **Lip Sync**: Generates lip sync data for the audio files.
- **File Handling**: Reads audio files and JSON transcripts, converting them to base64 format for transmission.

### Key Files

- [`index.js`](command:_github.copilot.openSymbolInFile?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2FC%3A%2FUsers%2Fdell%2FDesktop%2FOpen%20Source%20Project%2Fopen-source-chatbot-V13%2Fopen-source-chatbot-V13-backend%2Findex.js%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22index.js%22%2C%2272bbba21-a7d6-40e9-9ecd-613ead0dbaf8%22%5D "c:\Users\dell\Desktop\Open Source Project\open-source-chatbot-V13\open-source-chatbot-V13-backend\index.js"): Main server file that sets up the Express app and defines the chat endpoint.
- [`local_model.py`](command:_github.copilot.openSymbolInFile?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2FC%3A%2FUsers%2Fdell%2FDesktop%2FOpen%20Source%20Project%2Fopen-source-chatbot-V13%2Fopen-source-chatbot-V13-backend%2Flocal_model.py%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22local_model.py%22%2C%2272bbba21-a7d6-40e9-9ecd-613ead0dbaf8%22%5D "c:\Users\dell\Desktop\Open Source Project\open-source-chatbot-V13\open-source-chatbot-V13-backend\local_model.py"): Contains the Blenderbot model and tokenizer setup and response generation logic.
- `audios/`: Directory containing audio files and JSON transcripts for lip sync.
- [`.env.example`](command:_github.copilot.openSymbolInFile?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2FC%3A%2FUsers%2Fdell%2FDesktop%2FOpen%20Source%20Project%2Fopen-source-chatbot-V13%2Fopen-source-chatbot-V13-backend%2F.env.example%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22.env.example%22%2C%2272bbba21-a7d6-40e9-9ecd-613ead0dbaf8%22%5D "c:\Users\dell\Desktop\Open Source Project\open-source-chatbot-V13\open-source-chatbot-V13-backend\.env.example"): Example environment file for API keys.
- [`package.json`](command:_github.copilot.openSymbolInFile?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2FC%3A%2FUsers%2Fdell%2FDesktop%2FOpen%20Source%20Project%2Fopen-source-chatbot-V13%2Fopen-source-chatbot-V13-backend%2Fpackage.json%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22package.json%22%2C%2272bbba21-a7d6-40e9-9ecd-613ead0dbaf8%22%5D "c:\Users\dell\Desktop\Open Source Project\open-source-chatbot-V13\open-source-chatbot-V13-backend\package.json"): Lists dependencies like `express`, `dotenv`, `elevenlabs-node`, and `openai`.

### Setup

1. **Clone the repository**:

    ```sh
    git clone https://github.com/Majidied/chatbot-open-source-v13.git
    cd open-source-chatbot-V13/open-source-chatbot-V13-backend
    ```

2. **Install dependencies**:

    ```sh
    npm install
    ```

3. **Set up environment variables**:
    - Copy `.env.example` to `.env` and fill in the required API keys.

4. **Run the server**:

    ```sh
    node index.js
    ```

## Frontend

### Description

The frontend provides the user interface for interacting with the chatbot. It is built using React and Vite.

### Key Files

- [`App.jsx`](command:_github.copilot.openSymbolInFile?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2FC%3A%2FUsers%2Fdell%2FDesktop%2FOpen%20Source%20Project%2Fopen-source-chatbot-V13%2Fopen-source-chatbot-V13-frontend%2Fsrc%2FApp.jsx%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22App.jsx%22%2C%2272bbba21-a7d6-40e9-9ecd-613ead0dbaf8%22%5D "c:\Users\dell\Desktop\Open Source Project\open-source-chatbot-V13\open-source-chatbot-V13-frontend\src\App.jsx"): Main application component that sets up the UI and integrates other components.
- [`UI.jsx`](command:_github.copilot.openSymbolInFile?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2FC%3A%2FUsers%2Fdell%2FDesktop%2FOpen%20Source%20Project%2Fopen-source-chatbot-V13%2Fopen-source-chatbot-V13-frontend%2Fsrc%2Fcomponents%2FUI.jsx%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22UI.jsx%22%2C%2272bbba21-a7d6-40e9-9ecd-613ead0dbaf8%22%5D "c:\Users\dell\Desktop\Open Source Project\open-source-chatbot-V13\open-source-chatbot-V13-frontend\src\components\UI.jsx"): Component for the chat interface, including input fields and send buttons.
- [`useChat.jsx`](command:_github.copilot.openSymbolInFile?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2FC%3A%2FUsers%2Fdell%2FDesktop%2FOpen%20Source%20Project%2Fopen-source-chatbot-V13%2Fopen-source-chatbot-V13-frontend%2Fsrc%2Fhooks%2FuseChat.jsx%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22useChat.jsx%22%2C%2272bbba21-a7d6-40e9-9ecd-613ead0dbaf8%22%5D "c:\Users\dell\Desktop\Open Source Project\open-source-chatbot-V13\open-source-chatbot-V13-frontend\src\hooks\useChat.jsx"): Custom hook for managing chat state and communicating with the backend.
- [`index.html`](command:_github.copilot.openSymbolInFile?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2FC%3A%2FUsers%2Fdell%2FDesktop%2FOpen%20Source%20Project%2Fopen-source-chatbot-V13%2Fopen-source-chatbot-V13-frontend%2Findex.html%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22index.html%22%2C%2272bbba21-a7d6-40e9-9ecd-613ead0dbaf8%22%5D "c:\Users\dell\Desktop\Open Source Project\open-source-chatbot-V13\open-source-chatbot-V13-frontend\index.html"): Entry point for the frontend application.
- `public/animations/`: Directory containing animation files.
- `public/models/`: Directory containing 3D models.

### Setup

1. **Navigate to the frontend directory**:

    ```sh
    cd open-source-chatbot-V13/open-source-chatbot-V13-frontend
    ```

2. **Install dependencies**:

    ```sh
    npm install
    ```

3. **Run the development server**:

    ```sh
    npm run dev
    ```

## How It Works

1. **User Interaction**: Users interact with the chatbot through the frontend UI.
2. **Message Handling**: The frontend sends user messages to the backend via the `/chat` endpoint.
3. **Response Generation**: The backend processes the message, generates a response, converts it to audio, and creates lip sync data.
4. **Response Display**: The frontend receives the response and displays it, including playing the audio and showing the lip sync animation.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.
