// =============================================================================
// Resume Mutation Hooks
// TanStack Query mutation hooks for resume CRUD operations
// =============================================================================

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost, apiPut, apiDelete } from "./api-client";
import { resumeQueryKeys, type Resume, type ResumeData } from "./resume-hooks";

/**
 * Create a new resume
 */
export function useCreateResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title?: string;
      template?: string;
      data?: ResumeData;
      opportunityId?: string;
    }) => {
      return apiPost<Resume>("/user/resumes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeQueryKeys.all });
    },
  });
}

/**
 * Update an existing resume
 */
export function useUpdateResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      title?: string;
      template?: string;
      data?: ResumeData;
    }) => {
      return apiPut<Resume>(`/user/resumes/${id}`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: resumeQueryKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: resumeQueryKeys.list() });
    },
  });
}

/**
 * Delete a resume
 */
export function useDeleteResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiDelete<{ deleted: boolean }>(`/user/resumes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeQueryKeys.all });
    },
  });
}

/**
 * AI-generate resume content
 */
export function useAIGenerateResume() {
  return useMutation({
    mutationFn: async (data: { opportunityId?: string }) => {
      return apiPost<{
        success: boolean;
        data?: ResumeData;
        needsProfile?: boolean;
        message?: string;
      }>("/user/resumes/ai-generate", data);
    },
  });
}
