
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function listModels() {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // There isn't a direct listModels on the instance in some SDK versions, 
    // but let's try to infer or use the model manager if available, 
    // or just try to embed with a few likely candidates to see which one works.
    
    // Actually, the error message says "Call ListModels". 
    // In the Node SDK, it might be separate.
    // Let's try to run a simple embedding with different model names to see which succeeds.
    
    const candidates = [
        "models/text-embedding-004",
        "models/embedding-001",
        "models/gemini-embedding-001",
        "text-embedding-004",
        "embedding-001"
    ];

    console.log("Testing embedding models...");

    for (const modelName of candidates) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            console.log(`Testing ${modelName}...`);
            await model.embedContent("Hello world");
            console.log(`✅ SUCCESS: ${modelName} works!`);
        } catch (e: any) {
            console.log(`❌ FAILED: ${modelName} - ${e.message.split('\n')[0]}`);
        }
    }

  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
