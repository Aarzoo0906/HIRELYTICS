import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log("Testing Gemini API Integration");
console.log("==============================");
console.log("API Key present:", !!GEMINI_API_KEY);

const listAvailableModels = async () => {
  try {
    console.log("\n1. Fetching available models...\n");
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error("❌ Error fetching models:", data);
      return;
    }

    console.log("Available Models:");
    data.models?.forEach(model => {
      console.log(`  - ${model.name}`);
    });

    return data.models;
  } catch (error) {
    console.error("❌ Failed to list models:", error.message);
  }
};

const testGeminiAPI = async (modelName) => {
  try {
    console.log(`\n2. Testing with model: ${modelName}...\n`);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Generate 2 simple test interview questions"
            }]
          }],
          generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.7,
          }
        }),
      }
    );

    const rawText = await response.text();
    console.log("Response Status:", response.status);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      console.error("Failed to parse JSON");
      return;
    }

    if (!response.ok) {
      console.error("❌ API Error:", data?.error?.message || data?.error);
      return;
    }

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.log("✅ Success! Generated content:");
      console.log(data.candidates[0].content.parts[0].text);
    } else {
      console.log("⚠️ Unexpected response structure:");
      console.log(JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
};

(async () => {
  const models = await listAvailableModels();
  if (models && models.length > 0) {
    const modelName = models[0].name;
    await testGeminiAPI(modelName);
  }
})();
