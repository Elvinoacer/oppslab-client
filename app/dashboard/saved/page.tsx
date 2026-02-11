import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2 } from "lucide-react";

export default async function SavedOpportunitiesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboard/saved");
  }

  const savedOpportunities = await prisma.savedOpportunity.findMany({
    where: { userId: session.user.id },
    include: {
      opportunity: {
        select: {
          id: true,
          slug: true,
          title: true,
          company: true,
          locationCity: true,
          locationCountry: true,
          primaryCategory: true,
          deadline: true,
          status: true,
        },
      },
    },
    orderBy: { savedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Saved Opportunities</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {savedOpportunities.length} saved items
          </p>
        </div>
      </div>

      {savedOpportunities.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">
            No saved opportunities yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 mt-2">
            Browse opportunities and click the save icon to bookmark them for later.
          </p>
          <Button asChild>
            <Link href="/opportunities">Browse Opportunities</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          {savedOpportunities.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {item.opportunity.primaryCategory}
                      </Badge>
                      {item.status !== "SAVED" && (
                         <Badge variant="secondary" className="text-xs">
                            {item.status.replace("_", " ")}
                         </Badge>
                      )}
                    </div>
                    <Link 
                        href={`/opportunities/${item.opportunity.slug}`}
                        className="block font-semibold text-lg text-blue-600 hover:underline line-clamp-1"
                    >
                      {item.opportunity.title}
                    </Link>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.opportunity.company}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                        {item.opportunity.locationCity}, {item.opportunity.locationCountry}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                        Saved {new Date(item.savedAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                            <Link href={`/opportunities/${item.opportunity.slug}`}>
                                View Details
                            </Link>
                        </Button>
                        {/* <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                        </Button> */}
                    </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
