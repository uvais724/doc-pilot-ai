import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default defineEventHandler(async (event) => {
  const { name, metadata } = await readBody(event);
  const prompt = `Given the following library metadata, evaluate it on Functionality, Performance, Community, Usability, and Security:\n\n${JSON.stringify(metadata, null, 2)}\n\nRespond with JSON having scores from 1–5, reason, and suggestion per category.\n`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert developer evaluating software libraries.",
      },
    });
    console.log("AI Response:", response.text);
    const cleansedResponse = response.text.replace(/```(?:json)?/g, "").replace(/^\s*```/gm, "").trim();
    // Extract JSON object from the response text
    console.log("Cleaned AI Response:", cleansedResponse);
    const jsonMatch = cleansedResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in AI response.");
    }
    const report = JSON.parse(jsonMatch[0]);
    console.log("Parsed Evaluation Report:", report);
    return { metadata, report };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: { error: "Failed to generate evaluation report." },
    };
  }
});