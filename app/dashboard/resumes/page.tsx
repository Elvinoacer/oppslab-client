"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useResumes } from "@/lib/query/resume-hooks";
import { useCreateResume, useDeleteResume } from "@/lib/query/resume-mutations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Plus,
  FileText,
  Trash2,
  Loader2,
  Sparkles,
  Calendar,
  Briefcase,
  Download,
  Pencil,
} from "lucide-react";
import { TEMPLATE_INFO } from "@/components/resume/resume-templates";

export default function ResumesPage() {
  const { data: resumes, isLoading } = useResumes();
  const createResume = useCreateResume();
  const deleteResume = useDeleteResume();
  const router = useRouter();

  const handleCreate = async () => {
    try {
      const result = await createResume.mutateAsync({ title: "New Resume" });
      router.push(`/dashboard/resumes/${result.id}`);
    } catch {
      toast.error("Failed to create resume");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this resume?")) return;
    try {
      await deleteResume.mutateAsync(id);
      toast.success("Resume deleted");
    } catch {
      toast.error("Failed to delete resume");
    }
  };

  const getTemplateInfo = (templateId: string) => {
    return TEMPLATE_INFO.find(t => t.id === templateId) || TEMPLATE_INFO[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Resumes</h2>
          <p className="text-muted-foreground">
            Create, customize, and download professional resumes.
          </p>
        </div>
        <Button onClick={handleCreate} disabled={createResume.isPending} className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          {createResume.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          New Resume
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : !resumes || resumes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No resumes yet</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              Create your first professional resume. Choose from stunning templates and use AI to help fill in the details.
            </p>
            <div className="flex gap-3">
              <Button onClick={handleCreate} disabled={createResume.isPending} className="gap-2">
                <Plus className="w-4 h-4" /> Create Resume
              </Button>
              <Button variant="outline" className="gap-2" asChild>
                <Link href="/dashboard/profile">
                  <Sparkles className="w-4 h-4" /> Fill Profile First
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => {
            const tmpl = getTemplateInfo(resume.template);
            return (
              <Link key={resume.id} href={`/dashboard/resumes/${resume.id}`} className="group">
                <Card className="h-full hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-700 overflow-hidden">
                  {/* Template color bar */}
                  <div className={`h-2 bg-gradient-to-r ${tmpl.color}`} />
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                          {resume.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">{tmpl.name} Template</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={(e) => handleDelete(resume.id, e)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Opportunity badge */}
                    {resume.opportunity && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300 px-2 py-1 rounded-md">
                        <Briefcase className="w-3 h-3" />
                        <span className="truncate">{resume.opportunity.title} at {resume.opportunity.company}</span>
                      </div>
                    )}

                    {/* Preview snippet */}
                    <div className="text-xs text-gray-500 space-y-1">
                      {(resume.data as { personalInfo?: { fullName?: string } })?.personalInfo?.fullName && (
                        <p className="truncate">👤 {(resume.data as { personalInfo: { fullName: string } }).personalInfo.fullName}</p>
                      )}
                      {(resume.data as { summary?: string })?.summary && (
                        <p className="line-clamp-2">{(resume.data as { summary: string }).summary.substring(0, 100)}...</p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(resume.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
