"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Sparkles,
  DollarSign,
  GraduationCap,
  Briefcase,
  Rocket,
  Send,
  Loader2,
  ArrowRight,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PERSONAS = [
  {
    key: "quick-money",
    label: "Make Money Fast",
    icon: DollarSign,
    description: "Tasks, gigs & side hustles",
    gradient: "from-emerald-500 to-green-600",
    hoverBg: "hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
    borderHover: "hover:border-emerald-300 dark:hover:border-emerald-700",
  },
  {
    key: "student",
    label: "Student Opportunities",
    icon: GraduationCap,
    description: "Scholarships & internships",
    gradient: "from-blue-500 to-indigo-600",
    hoverBg: "hover:bg-blue-50 dark:hover:bg-blue-900/20",
    borderHover: "hover:border-blue-300 dark:hover:border-blue-700",
  },
  {
    key: "professional",
    label: "Find a Job",
    icon: Briefcase,
    description: "Full-time, remote & contract",
    gradient: "from-violet-500 to-purple-600",
    hoverBg: "hover:bg-violet-50 dark:hover:bg-violet-900/20",
    borderHover: "hover:border-violet-300 dark:hover:border-violet-700",
  },
  {
    key: "entrepreneur",
    label: "Start a Business",
    icon: Rocket,
    description: "Funding, grants & programs",
    gradient: "from-amber-500 to-orange-600",
    hoverBg: "hover:bg-amber-50 dark:hover:bg-amber-900/20",
    borderHover: "hover:border-amber-300 dark:hover:border-amber-700",
  },
] as const;

const GOAL_STORAGE_KEY = "oppslab_user_goal";

interface GoalResult {
  segment: string;
  categories: string[];
  searchQuery: string;
  summary: string;
}

export function GoalBanner() {
  const router = useRouter();
  const { data: session } = useSession();
  const [freeText, setFreeText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [hasGoal, setHasGoal] = useState(false);
  const [goalResult, setGoalResult] = useState<GoalResult | null>(null);

  // Check if user already has a goal set
  useEffect(() => {
    const stored = localStorage.getItem(GOAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as GoalResult;
        setGoalResult(parsed);
        setHasGoal(true);
      } catch { /* ignore */ }
    }
  }, []);

  const submitGoal = async (persona?: string, text?: string) => {
    setIsLoading(true);
    setLoadingKey(persona || "freetext");

    try {
      const res = await fetch("/api/v1/goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(persona ? { persona } : { goal: text }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      const result = data.data as GoalResult;

      // Save locally
      localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(result));
      setGoalResult(result);
      setHasGoal(true);

      // Navigate to filtered opportunities
      const params = new URLSearchParams({
        goal: result.segment,
        categories: result.categories.join(","),
      });
      router.push(`/opportunities?${params.toString()}`);
    } catch (error) {
      console.error("Goal submission error:", error);
    } finally {
      setIsLoading(false);
      setLoadingKey(null);
    }
  };

  const resetGoal = () => {
    localStorage.removeItem(GOAL_STORAGE_KEY);
    setHasGoal(false);
    setGoalResult(null);
  };

  // Determine if we should show the active goal indicator
  const showActiveGoal = hasGoal && goalResult;


  return (
    <section className="relative z-10 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            {showActiveGoal && (
              <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 animate-in fade-in slide-in-from-top-2">
                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Current goal: {goalResult.summary}
                </span>
                <button 
                  onClick={resetGoal}
                  className="ml-2 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 underline"
                >
                  Reset
                </button>
              </div>
            )}
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 text-xs font-semibold mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
              What are you looking for?
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We&apos;ll personalize your experience instantly
            </p>
          </div>

          {/* Persona Quick-Picks */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {PERSONAS.map(({ key, label, icon: Icon, description, gradient, hoverBg, borderHover }) => (
              <button
                key={key}
                onClick={() => submitGoal(key)}
                disabled={isLoading}
                className={cn(
                  "group relative flex flex-col items-center text-center gap-2 p-4 rounded-xl",
                  "bg-white dark:bg-gray-800/80 backdrop-blur-sm",
                  "border border-gray-200/80 dark:border-gray-700/60",
                  hoverBg, borderHover,
                  "transition-all duration-200 cursor-pointer",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform group-hover:scale-110 duration-200",
                  gradient
                )}>
                  {loadingKey === key ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Free-text input */}
          <div className="relative">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (freeText.trim()) submitGoal(undefined, freeText.trim());
              }}
              className="flex gap-2"
            >
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder="Or tell us in your own words... e.g. 'I'm a CS student looking for remote internships'"
                  disabled={isLoading}
                  className={cn(
                    "w-full h-11 pl-4 pr-4 rounded-xl text-sm",
                    "bg-white dark:bg-gray-800/80 backdrop-blur-sm",
                    "border border-gray-200/80 dark:border-gray-700/60",
                    "text-gray-900 dark:text-gray-100",
                    "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400",
                    "disabled:opacity-50 transition-all"
                  )}
                />
              </div>
              <button
                type="submit"
                disabled={!freeText.trim() || isLoading}
                className={cn(
                  "flex items-center justify-center h-11 w-11 rounded-xl shrink-0",
                  "bg-gradient-to-br from-blue-500 to-indigo-600 text-white",
                  "shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30",
                  "disabled:opacity-40 disabled:shadow-none",
                  "transition-all duration-200"
                )}
              >
                {loadingKey === "freetext" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
