"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  ChevronRight, 
  Edit2, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Loader2,
  FolderOpen
} from "lucide-react";
import Link from "next/link";
import { useUpdateCategory, useDeleteCategory } from "@/lib/query/hooks";
import { toast } from "sonner";
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
} from "@/components/ui";

interface CategoryRowProps {
  category: any;
  onRefresh: () => void;
}

export function CategoryRow({ category, onRefresh }: CategoryRowProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const handleToggleStatus = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      await updateCategory.mutateAsync({
        id: category.id,
        isActive: checked,
      });
      toast.success(`Category ${checked ? "activated" : "deactivated"}`);
      onRefresh();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategory.mutateAsync(category.id);
      toast.success("Category deleted");
      onRefresh();
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to delete category";
      toast.error(message);
    }
  };

  const handleMove = async (direction: "up" | "down") => {
    setIsUpdating(true);
    try {
      const newOrder = direction === "up" ? category.sortOrder - 1 : category.sortOrder + 1;
      await updateCategory.mutateAsync({
        id: category.id,
        sortOrder: Math.max(0, newOrder),
      });
      onRefresh();
    } catch (error) {
      toast.error("Failed to move category");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-2" style={{ paddingLeft: `${category.level * 1.5}rem` }}>
          {category.level > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: category.color || "#3b82f6" }}
          />
          <span className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            {category.name}
            {category._count?.children > 0 && (
              <Badge variant="outline" className="text-[10px] px-1 h-4">
                {category._count.children} sub
              </Badge>
            )}
          </span>
        </div>
      </td>
      <td className="py-4 px-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
        {category.slug}
      </td>
      <td className="py-4 px-4">
        <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800">
          {category._count?.opportunities || 0}
        </Badge>
      </td>
      <td className="py-4 px-4">
        <Switch 
          checked={category.isActive} 
          onCheckedChange={handleToggleStatus}
          disabled={isUpdating}
        />
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => handleMove("up")}
            disabled={isUpdating}
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => handleMove("down")}
            disabled={isUpdating}
          >
            <ArrowDown className="w-4 h-4" />
          </Button>
        </div>
      </td>
      <td className="py-4 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link href={`/admin/categories/${category.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              <Edit2 className="w-4 h-4" />
            </Button>
          </Link>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={category._count?.children > 0 || category._count?.opportunities > 0}
                title={category._count?.children > 0 || category._count?.opportunities > 0 ? "Cannot delete category with children or opportunities" : "Delete category"}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the category <strong>{category.name}</strong>.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </td>
    </tr>
  );
}
