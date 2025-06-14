import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { lib, ver, func } = query;

  if (!lib || !ver) {
    return {
      statusCode: 400,
      body: { error: "Library and version are required." },
    };
  }

  const prompt = `
    Generate developer-friendly, easy to understand, well formatted documentation for the ${lib} library in version ${ver}.
    ${func ? `Focus on the function "${func}".` : ""}
    Include:
    - Short explanation
    - Parameters and return value
    - Usage example
    - Common pitfalls or version-specific changes
    Make sure the output is parsed in html format while maintaining the formatting and all the include sections should be seperated out.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert technical writer.",
      },
    });

    return {
      statusCode: 200,
      body: response.text,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: { error: "Failed to fetch documentation." },
    };
  }
});