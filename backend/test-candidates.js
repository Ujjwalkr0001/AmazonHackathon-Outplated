require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function testModel(modelName) {
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  try {
    const res = await ai.models.generateContent({
      model: modelName,
      contents: 'Respond with JSON: {"status": "ok", "model": "' + modelName + '"}',
      config: { responseMimeType: 'application/json' }
    });
    console.log(`[SUCCESS] ${modelName}:`, res.text.trim());
    return true;
  } catch (err) {
    console.log(`[FAILED] ${modelName}:`, err.message);
    return false;
  }
}

async function run() {
  const candidates = [
    'gemini-2.5-flash',
    'gemini-3.5-flash',
    'gemini-3.7-flash',
    'gemini-flash-latest',
    'gemini-2.5-pro',
    'gemini-pro-latest'
  ];
  for (const c of candidates) {
    const ok = await testModel(c);
    if (ok) break;
  }
}

run();
