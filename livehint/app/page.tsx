"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [transcript, setTranscript] = useState<string>(""); // State for storing the transcript
  const [isRecording, setIsRecording] = useState<boolean>(false); // State for recording status
  const recognitionRef = useRef<SpeechRecognition | null>(null); // Ref to store recognition instance

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
    recognition.lang = "en-US"; // You can change this to another language

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          setTranscript((prev) => prev + result[0].transcript + " ");
        } else {
          interimTranscript += result[0].transcript;
        }
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      setIsRecording(false);
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <h1 className="text-2xl font-bold">Welcome to LiveHint!</h1>
      <p className="text-lg text-center">
        {isRecording ? "Recording in progress..." : "Click the button to start recording."}
      </p>

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
        <p className="text-gray-700">{transcript || "Your transcript will appear here."}</p>
      </div>
    </div>
  );
}
