"use client";

import { use } from "react";
import { useResume } from "@/lib/query/resume-hooks";
import { ResumeEditor } from "@/components/resume/resume-editor";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ResumeEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: resume, isLoading, error } = useResume(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Resume not found</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/resumes">← Back to Resumes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link href="/dashboard/resumes">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h2 className="text-xl font-bold tracking-tight">Resume Editor</h2>
      </div>
      <ResumeEditor resume={resume} />
    </div>
  );
}
