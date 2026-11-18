# Open Source Chatbot V13 Backend

## Author

- **Name**: Mohammed Majidi
- **Email**: mohammmedmajidi321@gmail.com

## Overview

This repository contains the backend component of the Open Source Chatbot V13. It is built using Node.js and Express and handles various functionalities such as processing user messages, generating responses, converting text to speech, and generating lip sync data.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Utilities](#utilities)
- [Contributing](#contributing)
- [License](#license)

## Project Structure

```
open-source-chatbot-V13-backend/
├── audios/
│   ├── api_0.json
│   ├── api_1.json
│   └── ...
├── bin/
│   └── ...
├── content.js
├── index.js
├── local_model.py
├── package.json
├── 

README.md


├── Transcribe.py
└── user_history.json
```

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. **Clone the repository**:

    ```sh
    git clone https://github.com/your-repo/open-source-chatbot-V13-backend.git
    cd open-source-chatbot-V13-backend
    ```

2. **Install dependencies**:

    ```sh
    npm install
    ```

## Environment Variables

Create a `.env` file in the root directory and add the following environment

 variables

:

```env
OPENAI_API_KEY=your_openai_api_key
PORT=3000
SESSION_SECRET=your_session_secret
```

## Running the Application

To start the backend server, run:

```sh
npm start
```

The server will start on the port specified in the `.env` file (default is 3000).

## API Endpoints

### POST /chat

Processes user messages and generates responses.

- **Request**:
  - Body: `{ "message": "Hello" }`
- **Response**:
  - Body: `{ "response": "Hi there!" }`

### POST /tts

Converts text to speech and returns the audio file.

- **Request**:
  - Body: `{ "text": "Hello" }`
- **Response**:
  - Body: `{ "audio": "base64_encoded_audio" }`

### POST /lip-sync

Generates lip sync data for the audio file.

- **Request**:
  - Body: `{ "audio": "base64_encoded_audio" }`
- **Response**:
  - Body: `{ "lipSyncData": "json_data" }`

## Utilities

### execCommand

A utility function to execute shell commands.

```javascript
const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};
```

### reshapeArabicText

A utility function to reshape Arabic text for proper display.

```javascript
const reshapeArabicText = (text) => {
  return ArabicReshaper.reshape(text);
};
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## License

This project is licensed under the MIT License.
```

This 

README.md

 file provides a comprehensive overview of the backend part of your project, including setup instructions, environment variables, API endpoints, and utility functions. It also includes sections for contributing and licensing.

Similar code found with 1 license type