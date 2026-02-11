
import { prisma } from "@/lib/db";
import { TrendChart } from "@/components/trends/trend-chart";
import { TrendingUp, Award, Briefcase } from "lucide-react";

async function getMarketTrends() {
  const today = new Date();
  
  const trend = await prisma.marketInsight.findFirst({
    where: {
      type: "TREND",
      validFrom: { lte: today },
      validTo: { gte: today },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!trend) return null;

  try {
    // Clean potential markdown code blocks if the LLM wrapped the JSON
    const content = trend.content.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(content);
  } catch (e) {
    console.error("Failed to parse trend data", e);
    return null;
  }
}

export default async function TrendsPage() {
  const trends = await getMarketTrends();

  if (!trends) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Market Trends</h1>
        <p className="text-gray-500">
          Our AI is currently analyzing this week's data. Check back later for the latest insights!
        </p>
      </div>
    );
  }

  // Transform topSkills (array of strings) into chart data
  // Assuming the LLM returns an array of strings like ["React", "Node.js", "Python"]
  // We'll give them mock values for visual weight if no counts are provided,
  // or if the LLM provided objects with counts, we usage that.
  // For robustness, let's map index to a "rank" value.
  
  let chartData = [];
  if (Array.isArray(trends.topSkills)) {
    chartData = trends.topSkills.map((skill: string | { name: string; count: number }, index: number) => {
        if (typeof skill === 'string') {
            return { name: skill, value: 5 - index }; // Top rank = higher value
        }
        return { name: skill.name, value: skill.count };
    });
  }

  return (
    <div className="container py-12 space-y-12">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Weekly Market Pulse</h1>
        <p className="text-xl text-gray-500 max-w-2xl">
          AI-driven analysis of the latest opportunities added to OppsLab. 
          Discover what's in demand right now.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Skills Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
              <Award className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">Top In-Demand Skills</h2>
          </div>
          <TrendChart data={chartData} />
        </div>

        {/* Growth Areas */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">Growth Areas</h2>
          </div>
          <div className="prose dark:prose-invert">
             <p className="text-lg leading-relaxed">
               {trends.growthAreas}
             </p>
          </div>
        </div>
      </div>

      {/* Strategic Advice */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 md:p-12 text-white shadow-xl">
        <div className="flex items-start gap-6">
          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl hidden md:block">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Strategic Advice for Applicants</h2>
            <p className="text-lg md:text-xl text-indigo-100 leading-relaxed font-light">
              "{trends.advice}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
