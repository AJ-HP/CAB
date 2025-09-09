// netlify/functions/generate.js

// This line is still needed for the Gemini API library
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function handler(event, context) {
  // Allow only POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // Netlify automatically makes your environment variables available
  const apiKey = process.env.GEMINI_API;
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // Netlify Functions put the request body in `event.body`
    const body = JSON.parse(event.body);
    const prompt = body.prompt;

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt is required' }),
      };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ text }),
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate content from Gemini API." }),
    };
  }
}