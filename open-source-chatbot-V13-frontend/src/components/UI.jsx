import { useState, useEffect, useRef } from "react";
import { useChat } from "../hooks/useChat";
import "@fortawesome/fontawesome-free/css/all.min.css"; // Ensure FontAwesome is imported

export const UI = ({ hidden, ...props }) => {
  const { chat, loading, message } = useChat();
  const [recognitionActive, setRecognitionActive] = useState(false);
  const [recognizedText, setRecognizedText] = useState(""); // Stores recognized text
  const [errorMessage, setErrorMessage] = useState(""); // Error message
  const [language, setLanguage] = useState("en-US"); // Default language

  const recognitionRef = useRef(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event) => {
        const text =
          event.results[event.results.length - 1][0].transcript;
        setRecognizedText(text);
        setTimeout
        // sendMessage(text);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event);
        setErrorMessage(
          "Error during speech recognition: " + event.error
        );
        setTimeout(() => setErrorMessage(""), 3000);
      };

      recognitionRef.current.onend = () => {
        setRecognitionActive(false);
      };
    } else {
      setErrorMessage(
        "Speech Recognition is not supported by this browser."
      );
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [language]);

  const toggleVoiceRecognition = () => {
    if (recognitionRef.current) {
      if (recognitionActive) {
        recognitionRef.current.stop();
        setRecognitionActive(false);
      } else {
        recognitionRef.current.lang = language; // Update language
        recognitionRef.current.start();
        setRecognitionActive(true);
      }
    } else {
      setErrorMessage(
        "Speech Recognition is not supported by this browser."
      );
    }
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
    if (recognitionActive && recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current.lang = event.target.value;
      recognitionRef.current.start();
    }
  };

  if (hidden) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-10 flex flex-col justify-between p-4 pointer-events-none">
      {/* Title at the top left */}
      <div className="fixed top-4 left-4 backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg">
        <h1 className="font-black text-xl">My Virtual Friend</h1>
      </div>

      <div className="w-full flex flex-col items-end justify-center gap-4">
        {/* Language selector */}
        <div className="fixed bottom-4 left-4 flex items-center">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="pointer-events-auto bg-white p-2 rounded-md"
          >
            <option value="en-US">English</option>
            <option value="fr-FR">Français</option>
            <option value="ar-SA">العربية</option>
          </select>
        </div>

        {/* Speak button as a microphone icon at the bottom right */}
        <div className="fixed bottom-4 right-4 flex justify-center">
          <button
            onClick={toggleVoiceRecognition}
            className={`pointer-events-auto p-4 rounded-full w-16 h-16 text-white transition-all duration-300 ease-in-out flex items-center justify-center ${
              recognitionActive
                ? "bg-green-500 hover:bg-green-600 scale-105"
                : "bg-pink-500 hover:bg-pink-600 scale-100"
            }`}
            style={{
              boxShadow: recognitionActive
                ? "0px 4px 15px rgba(0, 128, 0, 0.6)"
                : "0px 4px 15px rgba(255, 105, 180, 0.6)",
            }}
            aria-label="Toggle Voice Recognition"
          >
            <i className="fas fa-microphone text-2xl"></i>
          </button>
        </div>
      </div>

      {/* Display recognized text */}
      {recognizedText && (
        <div className="fixed bottom-20 left-0 right-0 w-full flex justify-center">
          <div className="bg-blue-500 text-white p-3 rounded-md">
            {recognizedText}
          </div>
        </div>
      )}

      {/* Display error message */}
      {errorMessage && (
        <div className="fixed bottom-32 left-0 right-0 w-full flex justify-center">
          <div className="bg-red-500 text-white p-3 rounded-md">
            {errorMessage}
          </div>
        </div>
      )}
    </div>
  );
};
