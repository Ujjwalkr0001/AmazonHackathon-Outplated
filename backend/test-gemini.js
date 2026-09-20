require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  
  // Test gemini-3.6-flash
  console.log('Testing gemini-3.6-flash...');
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Respond in JSON with a greeting and status: {"status": "ok", "engine": "AI Codebase Doctor"}',
      config: {
        responseMimeType: 'application/json',
      }
    });
    console.log('SUCCESS with gemini-3.6-flash! Response:');
    console.log(response.text);
    return;
  } catch (err) {
    console.error('Error with gemini-3.6-flash:', err.message);
  }

  // Let's also list available models
  try {
    console.log('Listing models...');
    const list = await ai.models.list();
    console.log('Available models:');
    for await (const m of list) {
      if (m.name.includes('gemini')) {
        console.log(' - ' + m.name);
      }
    }
  } catch (err) {
    console.error('Failed to list models:', err.message);
  }
}

testGemini();
