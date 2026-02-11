import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { generateDailyFact, analyzeMarketTrends } from "@/inngest/functions/market-insights";

// Create the serve handler with all functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generateDailyFact,
    analyzeMarketTrends,
  ],
});
