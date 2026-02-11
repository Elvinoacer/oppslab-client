
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";

config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function listModels() {
  console.log("Listing available models...");
  try {
    // The listModels method isn't directly exposed on the client instance in some versions,
    // but let's try to use the model manager if available or just try a standard request if not.
    // Actually, newer SDKs might not have listModels easily accessible without a specific import.
    // Let's try to just use valid known models or print the error details more fully.
    
    // In v1beta, generally:
    // gemini-1.0-pro
    // gemini-1.5-flash
    // gemini-1.5-pro
    
    // Let's try to ping them one by one.
    const candidates = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-1.0-pro",
        "gemini-pro",
    ];

    for (const modelName of candidates) {
        console.log(`Testing ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log(`✅ ${modelName} is WORKING.`);
            console.log(result.response.text());
            return; // Found one!
        } catch (e: any) {
            console.log(`❌ ${modelName} failed: ${e.message.split('\n')[0]}`);
        }
    }

  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
