import "dotenv/config"; // Load env vars before anything else
import { resolve } from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";
import { generateQueryEmbedding } from "../lib/pinecone/embeddings";
import { getPineconeClient, PINECONE_CONFIG, getOpportunitiesIndex } from "../lib/pinecone/client";

// Load environment variables - This line is now handled by "dotenv/config" import
// config({ path: resolve(process.cwd(), ".env") });

async function verifySearch() {
  console.log("🔍 Verifying Search Configuration...\n");

  try {
    // 1. Check Environment Variables
    console.log("1. Checking Environment Variables...");
    const requiredVars = [
      "GOOGLE_AI_API_KEY", // or GEMINI_API_KEY
      "PINECONE_API_KEY",
      "PINECONE_INDEX_NAME",
    ];

    const missingVars = requiredVars.filter((v) => {
      if (v === "GOOGLE_AI_API_KEY") {
        return !process.env.GOOGLE_AI_API_KEY && !process.env.GEMINI_API_KEY;
      }
      return !process.env[v];
    });

    if (missingVars.length > 0) {
      console.error(`❌ Missing environment variables: ${missingVars.join(", ")}`);
      process.exit(1);
    }
    console.log("✅ Environment variables present.\n");

    // 2. Test Embedding Generation
    console.log("2. Testing Embedding Generation (Gemini)...");
    const testQuery = "software engineer remote";
    try {
      const embedding = await generateQueryEmbedding(testQuery);
      console.log(`✅ Generated embedding successfully.`);
      console.log(`   Dimension: ${embedding.length} (Expected: ${PINECONE_CONFIG.dimension})`);
      
      if (embedding.length !== PINECONE_CONFIG.dimension) {
        console.error(`❌ Dimension Mismatch! Expected ${PINECONE_CONFIG.dimension}, got ${embedding.length}.`);
        console.error(`   Ensure your Pinecone index is created with dimension ${PINECONE_CONFIG.dimension}.`);
      }
    } catch (error) {
      console.error("❌ Failed to generate embedding:", error);
      process.exit(1);
    }
    console.log("");

    // 3. Test Pinecone Connection
    console.log(`3. Testing Pinecone Connection (Index: ${PINECONE_CONFIG.indexName})...`);
    try {
      const client = getPineconeClient();
      const index = client.index(PINECONE_CONFIG.indexName);
      
      const stats = await index.describeIndexStats();
      console.log("✅ Connected to Pinecone successfully.");
      console.log("   Index Stats:", stats);
      
      if (stats.totalRecordCount === 0) {
        console.warn("⚠️  Index is empty. Re-index your opportunities to enable search.");
      }
    } catch (error) {
      console.error("❌ Failed to connect to Pinecone:", error);
      console.error("   Check your PINECONE_API_KEY and PINECONE_INDEX_NAME.");
      process.exit(1);
    }

    console.log("\n✨ Verification Complete! Core search components are working.");
    
  } catch (error) {
    console.error("\n❌ Verification Failed:", error);
    process.exit(1);
  }
}

verifySearch();
