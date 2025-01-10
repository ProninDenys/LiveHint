import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, 
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    const response = await openai.completions.create({
      model: "text-davinci-003",
      prompt: `Provide helpful suggestions or improvements for the following statement:\n\n"${text}"`,
      max_tokens: 100,
    });

    return NextResponse.json({ recommendation: response.choices[0].text });
  } catch (error: any) {
    console.error("Error fetching GPT response:", error); 
    return NextResponse.json({ error: error.message || "Failed to fetch GPT response" }, { status: 500 });
  }
}

