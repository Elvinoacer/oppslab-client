import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Bell, Trash2 } from "lucide-react";

export default async function SavedSearchesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboard/searches");
  }

  const savedSearches = await prisma.savedSearch.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Saved Searches</h2>
          <p className="text-muted-foreground">
            Manage your search alerts and preferences.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {savedSearches.length === 0 ? (
           <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">
              No saved searches yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 mt-2">
              Save your searches to get notified when new opportunities match your criteria.
            </p>
            <Button asChild>
              <Link href="/search">Start Searching</Link>
            </Button>
          </div>
        ) : (
          savedSearches.map((search) => (
            <Card key={search.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">
                  {search.name || search.query}
                </CardTitle>
                <div className="flex items-center gap-2">
                    {search.isActive ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                    ) : ( 
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-100">Paused</Badge>
                    )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mt-2">
                    <div className="text-sm text-gray-500">
                        Frequency: {search.alertFrequency}
                    </div>
                    <div className="flex gap-2">
                         <Button size="sm" variant="ghost">
                            Edit
                         </Button>
                         <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
