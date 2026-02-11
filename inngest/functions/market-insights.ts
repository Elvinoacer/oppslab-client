
import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "models/gemini-flash-latest" });

export const generateDailyFact = inngest.createFunction(
  { id: "generate-daily-fact" },
  { cron: "0 9 * * *" }, // Run every day at 9am
  async ({ step }) => {
    const fact = await step.run("generate-fact-with-ai", async () => {
      const prompt = `
        Generate a surprising, useful, or inspiring "Career Fact of the Day" for students and freelancers.
        Topics: Remote work, AI in jobs, scholarship statistics, side hustles, or future of work.
        Format: A single concise paragraph (max 2 sentences).
        Tone: Professional but engaging.
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    });

    await step.run("save-fact-to-db", async () => {
      // Expire completely old facts or just keep adding new ones.
      // We set validFrom to now, validTo to 24 hours from now.
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      await prisma.marketInsight.create({
        data: {
          type: "FACT",
          content: fact,
          source: "OppsHub AI Analysis",
          validFrom: now,
          validTo: tomorrow,
        },
      });
    });

    return { success: true, fact };
  }
);

export const analyzeMarketTrends = inngest.createFunction(
  { id: "analyze-market-trends" },
  { cron: "0 0 * * *" }, // Run daily at midnight
  async ({ step }) => {
    const trends = await step.run("analyze-trends-with-ai", async () => {
      // 1. Fetch recent opportunities (last 7 days)
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const opportunities = await prisma.opportunity.findMany({
        where: { createdAt: { gte: lastWeek } },
        select: { title: true, skillsRequired: true, primaryCategory: true },
        take: 50,
      });

      if (opportunities.length === 0) return "Not enough data to analyze trends this week.";

      // 2. Prompt AI to analyze
      const dataSummary = JSON.stringify(opportunities);
      const prompt = `
        Analyze these recent job/opportunity postings:
        ${dataSummary}

        Identify:
        1. Top 3 in-demand skills.
        2. Expected growth areas.
        3. A brief advice for applicants based on this data.

        Output Format: JSON with keys "topSkills" (array), "growthAreas" (string), "advice" (string).
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    });

    await step.run("save-trends-to-db", async () => {
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);

      await prisma.marketInsight.create({
        data: {
          type: "TREND",
          content: trends,
          source: "OppsHub Weekly Analysis",
          validFrom: now,
          validTo: nextWeek,
        },
      });
    });
    
    return { success: true };
  }
);
