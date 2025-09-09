import { GoogleGenerativeAI } from "@google/generative-ai";

// Define the CORS headers in a reusable object
const headers = {
  'Access-Control-Allow-Origin': '*', // This allows requests from any origin. For more security, you can replace '*' with your GitHub Pages URL (e.g., 'https://aj-hp.github.io')
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

export async function handler(event, context) {
  // Handle the OPTIONS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '' // An empty body is sufficient for the preflight request
    };
  }

  // Handle the POST request
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers
    };
  }

  // Netlify automatically makes your environment variables available
  const apiKey = process.env.GEMINI_API;
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const body = JSON.parse(event.body);
    const prompt = body.prompt;

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt is required' }),
        headers
      };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ text }),
      headers // Make sure to return the headers on success as well
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate content from Gemini API." }),
      headers
    };
  }
}