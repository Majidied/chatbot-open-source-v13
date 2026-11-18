
# Open Source Chatbot V13 Frontend

## Author

- **Name**: Mohammed Majidi
- **Email**: mohammmedmajidi321@gmail.com

## Overview

This repository contains the frontend component of the Open Source Chatbot V13. It is built using React and provides a user interface for interacting with the chatbot. The frontend communicates with the backend to process user messages, generate responses, and handle text-to-speech functionalities.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Components](#components)
- [Contributing](#contributing)
- [License](#license)

## Project Structure

```
open-source-chatbot-V13-frontend/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── components/
│   │   ├── Avatar.jsx
│   │   ├── ChatBox.jsx
│   │   ├── UI.jsx
│   │   └── ...
│   ├── App.js
│   ├── index.js
│   └── ...
├── package.json
└── 

README.md


```

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. **Clone the repository**:

    ```sh
    git clone https://github.com/your-repo/open-source-chatbot-V13-frontend.git
    cd open-source-chatbot-V13-frontend
    ```

2. **Install dependencies**:

    ```sh
    npm install
    ```

## Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```env
REACT_APP_BACKEND_URL=http://localhost:3000
```

## Running the Application

To start the frontend development server, run:

```sh
npm start
```

The application will start on `http://localhost:3000`.

## Components

### Avatar.jsx

Handles the 3D avatar animations and interactions.

### ChatBox.jsx

Manages the chat interface where users can send and receive messages.

### UI.jsx

Contains the user interface elements such as buttons, selectors, and status messages.

### Example Usage

```jsx
import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone } from "react-icons/fa";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: input }),
    });
    const data = await response.json();
    setMessages([...messages, { text: input, response: data.response }]);
    setInput("");
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <p>{msg.text}</p>
            <p>{msg.response}</p>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatBox;
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

 file provides a comprehensive overview of the frontend part of your project, including setup instructions, environment variables, running the application, and descriptions of key components. It also includes sections for contributing and licensing.

Similar code found with 1 license type