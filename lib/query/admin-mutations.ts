// =============================================================================
// Admin Mutation Hooks
// TanStack Query mutation hooks for admin operations
// =============================================================================

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost, apiPut, apiDelete } from "./api-client";
import { queryKeys } from "./hooks";
import type { OpportunityDetail } from "./types";

// =============================================================================
// Types
// =============================================================================

export type ParseMarkdownRequest = {
  markdown: string;
  sourcePlatform?: string;
  sourceUrl?: string;
};

export type ParseMarkdownResponse = {
  extractedData: Record<string, unknown>;
  suggestions: string[];
  quality: {
    score: number;
    completeness: number;
    issues: string[];
  };
};

export type CreateOpportunityRequest = {
  title: string;
  company: string;
  description: string;
  shortDescription?: string;
  primaryCategory: string;
  experienceLevel: string;
  [key: string]: unknown;
};

export type UpdateOpportunityRequest = Partial<CreateOpportunityRequest> & {
  id: string;
};

// =============================================================================
// Admin Query Keys
// =============================================================================

export const adminQueryKeys = {
  opportunities: {
    all: ["admin", "opportunities"] as const,
    drafts: () => [...adminQueryKeys.opportunities.all, "drafts"] as const,
  },
  categories: {
    all: ["admin", "categories"] as const,
  },
  tags: {
    all: ["admin", "tags"] as const,
  },
  webhooks: {
    all: ["admin", "webhooks"] as const,
  },
};

// =============================================================================
// Admin Mutation Hooks
// =============================================================================

// Types for batch parsing
export type BatchParseRequest = {
  markdown: string;
};

export type BatchParseResponse = {
  opportunities: any[]; // Using any[] for now, ideally match OpportunityDetail structure
  quality: {
    count: number;
    issues: string[];
  };
};

/**
 * Parse markdown with AI
 */
export function useParseMarkdown() {
  return useMutation({
    mutationFn: async (request: ParseMarkdownRequest) => {
      return apiPost<ParseMarkdownResponse>("/admin/parse", request);
    },
    // No invalidation - preview only
  });
}

/**
 * Parse batch markdown with AI
 */
export function useParseBatch() {
  return useMutation({
    mutationFn: async (request: BatchParseRequest) => {
      return apiPost<BatchParseResponse>("/admin/parse-batch", request);
    },
  });
}

/**
 * Create new opportunity
 */
export function useCreateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateOpportunityRequest) => {
      return apiPost<OpportunityDetail>("/admin/opportunities", request);
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.opportunities.all });
    },
  });
}

/**
 * Update opportunity
 */
export function useUpdateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateOpportunityRequest) => {
      return apiPut<OpportunityDetail>(`/admin/opportunities/${id}`, data);
    },
    onSuccess: (data) => {
      // Update specific opportunity in cache
      queryClient.setQueryData(queryKeys.opportunities.detail(data.slug), data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.opportunities.all });
    },
  });
}

/**
 * Delete opportunity (soft delete)
 */
export function useDeleteOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiDelete<{ deleted: boolean }>(`/admin/opportunities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.opportunities.all });
    },
  });
}

/**
 * Publish draft opportunity
 */
export function usePublishOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiPost<{ id: string; status: string; publishedAt: string }>(
        `/admin/opportunities/${id}/publish`,
        {}
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.opportunities.drafts() });
    },
  });
}

/**
 * Publish all draft opportunities
 */
export function useBatchPublish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return apiPost<{ count: number; message: string }>("/admin/opportunities/batch-publish", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.opportunities.all });
    },
  });
}

/**
 * Create category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; slug?: string; description?: string; parentId?: string }) => {
      return apiPost<{ id: string; name: string; slug: string }>("/admin/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories.all });
    },
  });
}

/**
 * Create tag
 */
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; slug?: string; category: string; description?: string }) => {
      return apiPost<{ id: string; name: string; slug: string }>("/admin/tags", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.tags.all });
    },
  });
}
