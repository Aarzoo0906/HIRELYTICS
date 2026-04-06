import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "models/gemini-2.0-flash";

const testRawResponse = async () => {
  try {
    console.log("Testing raw Gemini API response for question generation...\n");

    const prompt = `Generate 5 medium level technical interview questions about JavaScript. 
Return ONLY numbered questions from 1 to 5, one per line. No explanations.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.9,
          }
        }),
      }
    );

    const data = await response.json();

    console.log("Raw Response:");
    console.log(JSON.stringify(data, null, 2));

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("\n\nExtracted Text:");
    console.log(rawText);

    console.log("\n\nSplit by newlines:");
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    lines.forEach((line, i) => {
      console.log(`${i}: "${line}"`);
    });

  } catch (error) {
    console.error("Error:", error.message);
  }
};

testRawResponse();
