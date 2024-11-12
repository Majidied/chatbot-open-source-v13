import { useState, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import "@fortawesome/fontawesome-free/css/all.min.css"; // Assure-toi que FontAwesome est importé

export const UI = ({ hidden, ...props }) => {
  const { chat, loading, message } = useChat();
  const [recognitionActive, setRecognitionActive] = useState(false);
  const [recognizedText, setRecognizedText] = useState(""); // Stocke le texte reconnu
  const [statusMessage, setStatusMessage] = useState(""); // Message de statut
  const [errorMessage, setErrorMessage] = useState("");   // Message d'erreur
  const [language, setLanguage] = useState("en-US"); // Langue par défaut

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    if (recognition) {
      recognition.continuous = true; // Mode continu activé
      recognition.interimResults = false;
      recognition.lang = language; // Utilisation de la langue sélectionnée

      recognition.onresult = (event) => {
        const text = event.results[event.results.length - 1][0].transcript;
        setRecognizedText(text); // Mettre à jour le texte reconnu
        sendMessage(text); // Envoie du texte reconnu
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event);
        setErrorMessage("Erreur lors de la reconnaissance vocale : " + event.error); // Affichage de l'erreur
        setTimeout(() => setErrorMessage(""), 3000); // Effacer le message après 3 secondes
      };
    } else {
      setErrorMessage("Speech Recognition non supportée par ce navigateur.");
    }
  }, [recognition, language]); // Mettre à jour la reconnaissance si la langue change

  const sendMessage = (text) => {
    if (!loading && !message) {
      chat(text);  // Envoie du texte
      setStatusMessage("Message envoyé avec succès !");
      setTimeout(() => setStatusMessage(""), 3000); // Effacer le message après 3 secondes
    }
  };

  const toggleVoiceRecognition = () => {
    if (recognition) {
      if (recognitionActive) {
        recognition.stop();
      } else {
        recognition.start();
      }
      setRecognitionActive(!recognitionActive);
    } else {
      setErrorMessage("Speech Recognition non supportée par ce navigateur."); // Avertir si non supporté
    }
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value); // Met à jour la langue choisie
  };

  if (hidden) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex flex-col justify-between p-4 pointer-events-none">
      {/* Titre placé en haut à gauche */}
      <div className="fixed top-4 left-4 backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg">
        <h1 className="font-black text-xl">My Virtual Friend</h1>
      </div>

      <div className="w-full flex flex-col items-end justify-center gap-4">
        {/* Sélecteur de langue */}
        <div className="fixed bottom-4 left-4 flex items-center transition-all duration-3000 ease-in-out rounded-md shadow-md bg-white pointer-events-auto">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="pointer-events-auto hover:bg-gray-200 hover:text-black p-1 m-0.5 bg-red-500 rounded text-white shadow-md focus:outline-none hover:shadow-lg font-bold transition duration-300 ease-in-out cursor-pointer w-26 h-12 border border-red-500 focus:border-red-700"
          >
            <option value="en-US">English</option>
            <option value="fr-FR">Français</option>
            <option value="ar-SA">العربية</option>
          </select>
        </div>

        {/* Bouton Speak sous forme de microphone en bas à droite */}
        <div className="fixed bottom-4 right-4 flex justify-center">
          <button
            onClick={toggleVoiceRecognition}
            className={`pointer-events-auto p-4 rounded-full w-16 h-16 text-white transition-all duration-300 ease-in-out flex items-center justify-center ${recognitionActive
                ? "bg-green-500 hover:bg-green-600 scale-105" // État actif
                : "bg-pink-500 hover:bg-pink-600 scale-100"  // État normal
              }`}
            style={{
              boxShadow: recognitionActive
                ? "0px 4px 15px rgba(0, 128, 0, 0.6)" // Ombre verte si actif
                : "0px 4px 15px rgba(255, 105, 180, 0.6)" // Ombre rose si inactif
            }}
          >
            <i className="fas fa-microphone text-2xl"></i> {/* Icône de microphone */}
          </button>
        </div>
      </div>

      {/* Affichage du texte reconnu */}
      {recognizedText && (
        <div className="fixed bottom-20 left-0 right-0 w-full flex justify-center">
          <div className="bg-blue-500 text-white p-3 rounded-md">
            {recognizedText}
          </div>
        </div>
      )}

      {/* Affichage du message de succès */}
      {statusMessage && (
        <div className="fixed bottom-24 left-0 right-0 w-full flex justify-center">
          <div className="bg-green-500 text-white p-3 rounded-md">
            {statusMessage}
          </div>
        </div>
      )}

      {/* Affichage du message d'erreur */}
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
