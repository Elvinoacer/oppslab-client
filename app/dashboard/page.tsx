import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bookmark, Search, User } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard | OppsLab",
  description: "Manage your saved opportunities and searches.",
};

async function getDashboardStats(userId: string) {
  const [savedCount, searchCount, user] = await Promise.all([
    prisma.savedOpportunity.count({ where: { userId } }),
    prisma.savedSearch.count({ where: { userId } }),
    prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true }
    })
  ]);

  return { savedCount, searchCount, user };
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const { savedCount, searchCount, user } = await getDashboardStats(session.user.id);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Welcome back, {user?.name?.split(" ")[0] || "User"}!
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Here&apos;s an overview of your opportunities and activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/saved">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-blue-100 dark:border-blue-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Saved Opportunities
              </CardTitle>
              <Bookmark className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{savedCount}</div>
              <p className="text-xs text-muted-foreground">
                Opportunities you have bookmarked
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/searches">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-purple-100 dark:border-purple-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Saved Searches
              </CardTitle>
              <Search className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{searchCount}</div>
              <p className="text-xs text-muted-foreground">
                Search alerts you have configured
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/settings">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Profile Settings
                </CardTitle>
                <User className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">Settings</div>
                <p className="text-xs text-muted-foreground">
                    Manage your account preferences
                </p>
                </CardContent>
            </Card>
        </Link>
      </div>

      {/* Placeholder for Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="text-center py-8 text-gray-500 text-sm">
          No recent activity to show.
        </div>
      </div>
    </div>
  );
}
