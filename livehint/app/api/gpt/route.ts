import { NextResponse } from "next/server";

// Функция для генерации "умных" ответов на популярные темы
const getFakeResponse = (text: string) => {
  if (text.toLowerCase().includes("politics")) {
    return "Politics is a process by which groups of people make collective decisions.";
  }
  if (text.toLowerCase().includes("history")) {
    return "History is the study of past events, particularly in human affairs.";
  }
  if (text.toLowerCase().includes("technology")) {
    return "Technology refers to the application of scientific knowledge for practical purposes.";
  }
  if (text.toLowerCase().includes("science")) {
    return "Science is a systematic enterprise that builds and organizes knowledge.";
  }
  return "I'm not sure about that topic, but it sounds interesting!";
};

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    console.log("Received text:", text);

    // Получаем "умный" ответ на основе текста пользователя
    const fakeResponse = getFakeResponse(text);

    console.log("Fake OpenAI response:", fakeResponse);

    // Возвращаем ответ пользователю
    return NextResponse.json({ recommendation: fakeResponse });
  } catch (error: any) {
    console.error("Error fetching GPT response:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch GPT response", details: error.message },
      { status: 500 }
    );
  }
}
