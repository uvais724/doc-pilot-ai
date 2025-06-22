import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default defineEventHandler(async (event) => {
  const { compare } = await readBody(event);
  if (!compare || compare.length !== 2) {
    return { error: 'Two libraries required for comparison.' }
  }
  const [libA, libB] = compare;
  const prompt = `Compare the following two libraries for Functionality, Performance, Community, Usability, and Security. For each metric, give a score (1-5), a short reason, and which library is better for that metric. At the end, provide a summary and declare the overall winner.\n\nLibrary A: ${libA.name}\n${JSON.stringify(libA, null, 2)}\n\nLibrary B: ${libB.name}\n${JSON.stringify(libB, null, 2)}\n\nRespond with JSON in this format:\n{\n  \'${libA.name}\': { Functionality: { score, reason }, ... },\n  \'${libB.name}\': { Functionality: { score, reason }, ... },\n  summary: "...",
  winner: "Library Name"
}`;

  try {
    if (compare && compare.length === 2 && compare[0].publisher && compare[0].link && compare[0].link.includes('pypi.org')) {
      // PyPI comparison
      const pypiA = await fetch(`https://pypi.org/pypi/${compare[0].name}/json`).then(r => r.json())
      const pypiB = await fetch(`https://pypi.org/pypi/${compare[1].name}/json`).then(r => r.json())
      compare[0].metadata = {
        pypi: {
          name: pypiA.info.name,
          version: pypiA.info.version,
          description: pypiA.info.summary,
          author: pypiA.info.author,
          home_page: pypiA.info.home_page,
          license: pypiA.info.license,
          last_release: pypiA.releases ? Object.keys(pypiA.releases).pop() : '',
        }
      }
      compare[1].metadata = {
        pypi: {
          name: pypiB.info.name,
          version: pypiB.info.version,
          description: pypiB.info.summary,
          author: pypiB.info.author,
          home_page: pypiB.info.home_page,
          license: pypiB.info.license,
          last_release: pypiB.releases ? Object.keys(pypiB.releases).pop() : '',
        }
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert developer comparing open source libraries.",
      },
    });
    const cleansedResponse = response.text.replace(/```(?:json)?/g, "").replace(/^\s*```/gm, "").trim();
    const jsonMatch = cleansedResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in AI response.");
    }
    const report = JSON.parse(jsonMatch[0]);
    return { report };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: { error: "Failed to generate comparison report." },
    };
  }
});
