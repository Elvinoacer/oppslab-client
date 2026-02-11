"use client";

import { use } from "react";
import { useAdminCategory } from "@/lib/query/hooks";
import { CategoryForm } from "@/components/admin/category-form";
import { Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CategoryEditPageProps {
  params: Promise<{ id: string }>;
}

export default function CategoryEditPage({ params }: CategoryEditPageProps) {
  const { id } = use(params);
  const { data: category, isLoading, error } = useAdminCategory(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Category not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">The category you are looking for does not exist or has been deleted.</p>
        <Link href="/admin/categories" className="mt-4 inline-block">
          <Button variant="outline">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/categories">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Edit Category</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Update category details and settings</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <CategoryForm initialData={category} />
      </div>
    </div>
  );
}
