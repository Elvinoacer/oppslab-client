
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/db";
import { config } from "dotenv";

// Load environment variables
config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const candidates = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-001",
  "gemini-1.5-flash-002",
  "gemini-1.5-pro",
  "gemini-pro",
  "gemini-1.0-pro",
  "models/gemini-1.5-flash",
  "models/gemini-flash-latest",
];

async function verifyInsights() {
  console.log("🔍 Verifying Market Insights Logic...\n");
  
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing!");
    process.exit(1);
  }

  let validModelName = null;
  let model = null;

  // Find a working model first
  console.log("Finding a working model...");
  for (const name of candidates) {
    try {
        console.log(`Testing ${name}...`);
        const m = genAI.getGenerativeModel({ model: name });
        await m.generateContent("Hello");
        console.log(`✅ ${name} is WORKING.`);
        validModelName = name;
        model = m;
        break;
    } catch (e: any) {
        console.log(`❌ ${name} failed: ${e.message.split('\n')[0]}`);
    }
  }

  if (!model) {
      console.error("❌ Could not find ANY working model.");
      return;
  }

  // 1. Verify Daily Fact Generation
  console.log("\n1. Testing Daily Fact Generation using", validModelName, "...");
  try {
    const prompt = `
      Generate a surprising, useful, or inspiring "Career Fact of the Day" for students and freelancers.
      Format: A single concise paragraph.
    `;
    const result = await model.generateContent(prompt);
    const fact = result.response.text();
    console.log("✅ AI Fact Generated:", fact.substring(0, 50) + "...");

    // Simulate DB Save
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const savedFact = await prisma.marketInsight.create({
      data: {
        type: "FACT",
        content: fact, // Use the real AI content
        source: "Verification Script",
        validFrom: now,
        validTo: tomorrow,
      }
    });
    console.log("✅ Fact saved to DB ID:", savedFact.id);
  } catch (error) {
    console.error("❌ Fact Generation Failed:", error);
  }

  // 2. Verify Market Trends Analysis
  console.log("\n2. Testing Market Trends Analysis...");
  try {
    const mockOpportunities = [
      { title: "React Developer", skillsRequired: ["React", "TypeScript"], primaryCategory: "Jobs" },
      { title: "Frontend Intern", skillsRequired: ["React", "CSS"], primaryCategory: "Internships" },
      { title: "Backend Engineer", skillsRequired: ["Node.js", "SQL"], primaryCategory: "Jobs" },
    ];
    
    // Using a simpler prompt for verification speed
    const prompt = `
      Analyze these job postings: ${JSON.stringify(mockOpportunities)}
      Identify top skills.
      Output ONLY valid JSON: { "topSkills": ["Skill1", "Skill2"], "growthAreas": "Summary", "advice": "Advice" }
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    // Clean markdown if present
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    console.log("✅ AI Trends Generated (Raw):", text.substring(0, 50) + "...");
    
    const json = JSON.parse(text);
    if (Array.isArray(json.topSkills)) {
        console.log("✅ JSON Structure Valid. Top Skills:", json.topSkills);
    } else {
        console.error("❌ JSON Structure Invalid:", json);
    }

    // Simulate DB Save
    const savedTrend = await prisma.marketInsight.create({
      data: {
        type: "TREND",
        content: text,
        source: "Verification Script",
        validFrom: new Date(),
        validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    });
     console.log("✅ Trend saved to DB ID:", savedTrend.id);

  } catch (error) {
    console.error("❌ Trends Analysis Failed:", error);
  }

  console.log("\n✨ Verification Complete!");
}

verifyInsights();
