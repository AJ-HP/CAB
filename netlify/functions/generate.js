import { GoogleGenerativeAI } from "@google/generative-ai";

// Define the CORS headers in a reusable object
const headers = {
  'Access-Control-Allow-Origin': '*', // This allows requests from any origin. For more security, you can replace '*' with your GitHub Pages URL (e.g., 'https://aj-hp.github.io')
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

export async function handler(event, context) {
  const requestTimestamp = new Date().toISOString();
  
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
    console.error('[Handler] Method not allowed', { 
      method: event.httpMethod,
      timestamp: requestTimestamp 
    });
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers
    };
  }

  // Validate API key is configured
  const apiKey = process.env.GEMINI_API;
  if (!apiKey) {
    console.error('[Handler] GEMINI_API environment variable not configured', {
      timestamp: requestTimestamp
    });
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error. Please contact support.' }),
      headers
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const startTime = Date.now();

  try {
    // Parse and validate request body
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (parseError) {
      console.error('[Handler] Invalid JSON in request body', {
        timestamp: requestTimestamp,
        error: parseError.message
      });
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
        headers
      };
    }

    const prompt = body.prompt;

    // Validate prompt exists and is not empty
    if (!prompt) {
      console.error('[Handler] Missing prompt in request', {
        timestamp: requestTimestamp,
        bodyKeys: Object.keys(body)
      });
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt is required' }),
        headers
      };
    }

    if (typeof prompt !== 'string') {
      console.error('[Handler] Invalid prompt type', {
        timestamp: requestTimestamp,
        promptType: typeof prompt
      });
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt must be a string' }),
        headers
      };
    }

    if (prompt.trim().length === 0) {
      console.error('[Handler] Empty prompt after trim', {
        timestamp: requestTimestamp
      });
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt cannot be empty' }),
        headers
      };
    }

    console.log('[Handler] Processing request', {
      timestamp: requestTimestamp,
      promptLength: prompt.length
    });

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    
    // Validate response
    if (!result) {
      console.error('[Handler] No result from Gemini API', {
        timestamp: requestTimestamp,
        duration: Date.now() - startTime
      });
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No response from AI service' }),
        headers
      };
    }

    const response = await result.response;
    
    if (!response) {
      console.error('[Handler] No response object from Gemini API', {
        timestamp: requestTimestamp,
        duration: Date.now() - startTime
      });
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Invalid response from AI service' }),
        headers
      };
    }

    const text = response.text();
    
    if (!text) {
      console.warn('[Handler] Empty text in response', {
        timestamp: requestTimestamp,
        duration: Date.now() - startTime
      });
    }

    const duration = Date.now() - startTime;
    console.log('[Handler] Success', {
      timestamp: requestTimestamp,
      duration: `${duration}ms`,
      promptLength: prompt.length,
      responseLength: text ? text.length : 0
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ text }),
      headers // Make sure to return the headers on success as well
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Categorize error for better logging and response
    let statusCode = 500;
    let errorMessage = 'Failed to generate content from Gemini API.';
    let errorCategory = 'unknown';
    
    if (error.message && error.message.includes('quota')) {
      statusCode = 429;
      errorMessage = 'API quota exceeded. Please try again later.';
      errorCategory = 'quota';
    } else if (error.message && error.message.includes('timeout')) {
      statusCode = 504;
      errorMessage = 'Request to AI service timed out.';
      errorCategory = 'timeout';
    } else if (error.message && error.message.includes('invalid')) {
      statusCode = 400;
      errorMessage = 'Invalid request to AI service.';
      errorCategory = 'invalid_request';
    }
    
    console.error('[Handler] Error processing request', {
      timestamp: requestTimestamp,
      duration: `${duration}ms`,
      errorCategory,
      errorMessage: error.message,
      errorStack: error.stack,
      statusCode
    });
    
    return {
      statusCode,
      body: JSON.stringify({ error: errorMessage }),
      headers
    };
  }
}