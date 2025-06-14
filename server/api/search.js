import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default defineEventHandler(async (event) => {
    const { query } = await readBody(event);

    const prompt = `
        Extract the following from the query:
        - Programming Language
        - Category/Use Case
        - Priority Attributes (e.g., performance, size, popularity, documentation quality)
        - If a JavaScript framework (such as React, Vue, Angular, Svelte, Next.js, Nuxt, etc.) is mentioned in the query, automatically set the language to "javascript" and include the framework name in the category or as a separate field if possible.
        Query: "${query}".
        Respond in JSON:
        {
            "language": "",
            "category": "",
            "framework": "", // If a framework is detected, otherwise empty string
            "priorities": []
        }
        `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: {
                systemInstruction: "You are a software assistant helping developers search for libraries.",
            },
        });
        console.log("AI Response:", response.text);
        const cleansedResponse = response.text.replace(/```(?:json)?/g, "").replace(/^\s*```/gm, "").trim();
        console.log("Cleaned AI Response:", cleansedResponse);
        const filters = JSON.parse(cleansedResponse);
        console.log("Response from AI:", filters);

        const rawPackages = await fetchNpmPackages(filters.category)
        const enrichedPackages = await enrichNpmPackages(rawPackages)

        const filteredPackages = enrichedPackages.filter(pkg => {
            const priorities = filters.priorities || []
            return priorities.every(p => {
                if (p === "performance") return pkg.weeklyDownloads > 5000
                if (p === "size") return pkg.size < 100 * 1024 // 100 KB
                if (p === "maintenance") return new Date(pkg.lastPublish) > new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
                return true
            })
        })


        return { results: filteredPackages.slice(0, 10) }
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: { error: "Failed to fetch documentation." },
        };
    }
});