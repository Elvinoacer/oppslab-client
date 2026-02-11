
import { prisma } from "@/lib/db";
import { Lightbulb, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

async function getDailyFact() {
  const today = new Date();
  
  // Find a fact that is valid for today
  const fact = await prisma.marketInsight.findFirst({
    where: {
      type: "FACT",
      validFrom: { lte: today },
      validTo: { gte: today },
    },
    orderBy: { createdAt: "desc" },
  });

  return fact;
}

export async function HeroFact() {
  const fact = await getDailyFact();

  if (!fact) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-900/20 border border-indigo-100 dark:border-indigo-800 p-6 md:p-8">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-200 to-blue-200 dark:from-indigo-800 dark:to-blue-800 opacity-20 blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg transform rotate-3">
              <Lightbulb className="h-6 w-6" />
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-100 dark:bg-indigo-900/50 px-2 py-1 rounded-full">
                Daily Insight
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-yellow-500" />
                AI Generated
              </span>
            </div>
            
            <p className="text-lg md:text-xl font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
              "{fact.content}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
