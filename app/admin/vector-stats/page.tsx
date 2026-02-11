"use client";

import { useVectorStats, useClearVectorStats } from "@/lib/query/hooks";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  RefreshCcw, 
  Hash, 
  Layers, 
  Activity,
  AlertCircle
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function VectorStatsPage() {
  const { data: stats, isLoading, error, refetch, isFetching } = useVectorStats();
  const clearStats = useClearVectorStats();

  const handleClearIndex = async () => {
    try {
      await clearStats.mutateAsync();
      toast.success("Vector index cleared successfully");
    } catch (error) {
      console.error("Error clearing index:", error);
      toast.error("Failed to clear vector index");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Vector Storage Statistics</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Real-time analysis of the Pinecone vector database
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="danger" 
                size="sm"
                disabled={isLoading || isFetching || stats?.totalVectors === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Database
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete all vector embeddings from the index. 
                  Semantic search will not work until you re-index your opportunities.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearIndex}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Clear All Vectors
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            disabled={isLoading || isFetching}
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh Stats
          </Button>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to fetch vector statistics. Please check your Pinecone configuration.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-white dark:bg-gray-800 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vectors</CardTitle>
              <Database className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalVectors?.toLocaleString() || 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Number of indexed opportunities
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dimensions</CardTitle>
              <Layers className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.dimension || 768}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Vector size (Gemini Embeddings)
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="flex items-center">
                  <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">Active</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Index is ready for semantic search
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {!isLoading && !error && (
        <Card className="bg-white dark:bg-gray-800 transition-colors">
          <CardHeader>
            <CardTitle>Technical Details</CardTitle>
            <CardDescription>
              Configuration of the opportunities vector index
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-4">
              <div className="space-y-1">
                <span className="text-xs text-gray-500 uppercase font-semibold">Cloud Provider</span>
                <p className="text-sm font-medium">AWS</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-500 uppercase font-semibold">Region</span>
                <p className="text-sm font-medium">us-east-1</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-500 uppercase font-semibold">Metric</span>
                <p className="text-sm font-medium">Cosine</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-500 uppercase font-semibold">Namespace</span>
                <p className="text-sm font-medium">opportunities</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
