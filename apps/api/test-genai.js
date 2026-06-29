import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hello, respond with {"status": "ok"} in JSON format',
    });
    console.log("Raw response.text type:", typeof response.text);
    if (typeof response.text === 'function') {
      console.log("Called:", response.text());
    } else {
      console.log("Value:", response.text);
    }
  } catch(e) {
    console.error("Error", e.message);
  }
}
main();
