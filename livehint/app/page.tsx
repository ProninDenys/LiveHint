"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [transcript, setTranscript] = useState<string>(""); // Final transcript
  const [interimTranscript, setInterimTranscript] = useState<string>(""); // Interim transcript
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<string>(""); // GPT recommendation
  const [language, setLanguage] = useState<string>("en-US"); // Language state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State for modal
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const handleCopy = () => {
    if (recommendation) {
      navigator.clipboard.writeText(recommendation);
      alert("Recommendation copied to clipboard!");
    }
  };

  const handleStartRecording = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Sorry, your browser does not support speech recognition.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }

      setTranscript((prev) => prev + finalTranscript);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);

      if (event.error === "aborted") {
        recognition.start();
        return;
      }

      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      fetchGPTResponse(transcript);
    };

    recognition.start();
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const fetchGPTResponse = async (text: string) => {
    if (!text.trim()) return;

    setRecommendation("Loading..."); // Temporary loading message

    try {
      const response = await fetch("/api/gpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch GPT response");
      }

      const data = await response.json();
      setRecommendation(data.recommendation); // Save GPT recommendation
    } catch (error) {
      console.error("Error fetching GPT response:", error);
      setRecommendation("An error occurred while fetching the recommendation.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <h1 className="text-2xl font-bold">Welcome to LiveHint!</h1>
      <p className="text-lg text-center">
        {isRecording ? "Recording in progress..." : "Click the button to start recording."}
      </p>

      <div className="mb-4">
        <label htmlFor="language" className="mr-2">Select Language:</label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border rounded p-2"
        >
          <option value="en-US">English</option>
          <option value="es-ES">Spanish</option>
          <option value="fr-FR">French</option>
          <option value="de-DE">German</option>
        </select>
      </div>

      <button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        className={`px-6 py-3 text-white rounded-lg transition ${
          isRecording ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      <div className="w-full max-w-2xl p-4 border rounded-lg mt-8">
        <h2 className="text-xl font-semibold mb-4">Recognized Text:</h2>
        <p className="text-gray-700">
          {transcript}
          {interimTranscript && <span className="text-gray-500"> {interimTranscript}</span>}
        </p>
      </div>

      {recommendation && (
        <div className="w-full max-w-2xl p-4 border rounded-lg mt-8 bg-gray-50 shadow-md">
          <h2 className="text-xl font-semibold mb-4">GPT Recommendation:</h2>
          <div className="p-4 bg-white border rounded-lg">
            <p className="text-gray-800">{recommendation}</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Show Full Recommendation
          </button>
          <button
            onClick={handleCopy}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Copy Recommendation
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-xl w-full">
            <h2 className="text-xl font-semibold mb-4">Full GPT Recommendation</h2>
            <p className="text-gray-800">{recommendation}</p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
