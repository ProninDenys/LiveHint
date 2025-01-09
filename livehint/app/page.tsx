"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [transcript, setTranscript] = useState<string>(""); // Final transcript
  const [interimTranscript, setInterimTranscript] = useState<string>(""); // Interim transcript
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<string>(""); // GPT recommendation
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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
    recognition.lang = "en-US";

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
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      fetchGPTResponse(transcript); // Отправляем текст в GPT после завершения записи
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

    try {
      const response = await fetch("/api/gpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      setRecommendation(data.recommendation); // Сохраняем рекомендацию от GPT
    } catch (error) {
      console.error("Error fetching GPT response:", error);
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
        </div>
      )}
    </div>
  );
}
