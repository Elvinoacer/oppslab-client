"use client";

import { useAdminCategories } from "@/lib/query/hooks";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { CategoryRow } from "@/components/admin/category-row";

export default function AdminCategoriesPage() {
  const { data: categories, isLoading, error, refetch } = useAdminCategories();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600">Failed to load categories</h2>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Category Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Organize and manage opportunity categories and their hierarchy</p>
        </div>
        <Link href="/admin/categories/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-transparent">
              <TableHead className="w-[40%]">Category Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Opportunities</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No categories found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              categories?.map((category) => (
                <CategoryRow 
                  key={category.id} 
                  category={category} 
                  onRefresh={refetch}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
