// =============================================================================
// Public Query Hooks
// TanStack Query hooks for public API endpoints
// =============================================================================

"use client";

import { useQuery, useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete, buildQueryString } from "./api-client";
import type {
  OpportunityListItem,
  OpportunityDetail,
  OpportunityFilters,
  Category,
  Tag,
  TagFilters,
  PlatformStats,
  SearchRequest,
  SearchResponse,
  PaginatedResponse,
  SavedApplication,
} from "./types";

// =============================================================================
// Query Keys
// =============================================================================

export const queryKeys = {
  // Opportunities
  opportunities: {
    all: ["opportunities"] as const,
    list: (filters: OpportunityFilters) => [...queryKeys.opportunities.all, "list", filters] as const,
    detail: (slug: string) => [...queryKeys.opportunities.all, "detail", slug] as const,
    related: (id: string) => [...queryKeys.opportunities.all, "related", id] as const,
    similar: (id: string) => [...queryKeys.opportunities.all, "similar", id] as const,
  },
  // Categories
  categories: {
    all: ["categories"] as const,
    tree: () => [...queryKeys.categories.all, "tree"] as const,
    opportunities: (slug: string, includeChildren?: boolean) =>
      [...queryKeys.categories.all, slug, "opportunities", { includeChildren }] as const,
  },
  // Tags
  tags: {
    all: ["tags"] as const,
    list: (filters: TagFilters) => [...queryKeys.tags.all, "list", filters] as const,
  },
  // Search
  search: {
    all: ["search"] as const,
    results: (request: SearchRequest) => [...queryKeys.search.all, request] as const,
  },
  // Stats
  stats: {
    all: ["stats"] as const,
    platform: () => [...queryKeys.stats.all, "platform"] as const,
  },
};

// =============================================================================
// Stale Times (in milliseconds)
// =============================================================================

const STALE_TIMES = {
  opportunities: 5 * 60 * 1000, // 5 minutes
  opportunityDetail: 24 * 60 * 60 * 1000, // 24 hours
  categories: 10 * 60 * 1000, // 10 minutes
  tags: 10 * 60 * 1000, // 10 minutes
  stats: 60 * 1000, // 1 minute
  search: 0, // Always fresh for search
};

// =============================================================================
// Opportunity Hooks
// =============================================================================

/**
 * List opportunities with filters and pagination
 */
export function useOpportunities(filters: OpportunityFilters = {}) {
  return useQuery({
    queryKey: queryKeys.opportunities.list(filters),
    queryFn: async ({ signal }) => {
      const queryString = buildQueryString(filters as Record<string, string | number | boolean | undefined>);
      return apiGet<PaginatedResponse<OpportunityListItem>>(`/opportunities${queryString}`, signal);
    },
    staleTime: STALE_TIMES.opportunities,
    placeholderData: keepPreviousData,
  });
}

/**
 * Infinite scroll opportunities
 */
export function useInfiniteOpportunities(filters: Omit<OpportunityFilters, "page"> = {}) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.opportunities.all, "infinite", filters],
    queryFn: async ({ pageParam = 1, signal }) => {
      const queryString = buildQueryString({
        ...filters,
        page: pageParam,
      } as Record<string, string | number | boolean | undefined>);
      return apiGet<PaginatedResponse<OpportunityListItem>>(`/opportunities${queryString}`, signal);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined,
    staleTime: STALE_TIMES.opportunities,
  });
}

/**
 * Get single opportunity by slug
 */
export function useOpportunity(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.opportunities.detail(slug),
    queryFn: async ({ signal }) => {
      return apiGet<OpportunityDetail>(`/opportunities/${slug}`, signal);
    },
    staleTime: STALE_TIMES.opportunityDetail,
    enabled: options?.enabled ?? !!slug,
  });
}

// =============================================================================
// Category Hooks
// =============================================================================

/**
 * Get hierarchical categories tree
 */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.tree(),
    queryFn: async ({ signal }) => {
      return apiGet<Category[]>("/categories", signal);
    },
    staleTime: STALE_TIMES.categories,
  });
}

/**
 * Get opportunities by category
 */
export function useCategoryOpportunities(
  slug: string,
  options?: { includeChildren?: boolean; page?: number; pageSize?: number }
) {
  const { includeChildren = false, page = 1, pageSize = 20 } = options || {};

  return useQuery({
    queryKey: queryKeys.categories.opportunities(slug, includeChildren),
    queryFn: async ({ signal }) => {
      const queryString = buildQueryString({ includeChildren, page, pageSize });
      return apiGet<PaginatedResponse<OpportunityListItem>>(
        `/categories/${slug}/opportunities${queryString}`,
        signal
      );
    },
    staleTime: STALE_TIMES.opportunities,
    enabled: !!slug,
  });
}

// =============================================================================
// Tag Hooks
// =============================================================================

/**
 * Get tags with usage counts
 */
export function useTags(filters: TagFilters = {}) {
  return useQuery({
    queryKey: queryKeys.tags.list(filters),
    queryFn: async ({ signal }) => {
      const queryString = buildQueryString(filters as Record<string, string | number | boolean | undefined>);
      return apiGet<Tag[] | Record<string, Tag[]>>(`/tags${queryString}`, signal);
    },
    staleTime: STALE_TIMES.tags,
  });
}

// =============================================================================
// Search Hooks
// =============================================================================

/**
 * Hybrid search with filters
 */
export function useSearch(request: SearchRequest, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.search.results(request),
    queryFn: async ({ signal }) => {
      return apiPost<SearchResponse>("/search", request, signal);
    },
    staleTime: STALE_TIMES.search,
    enabled: options?.enabled ?? (request.query?.length > 0),
  });
}

// =============================================================================
// Stats Hooks
// =============================================================================

/**
 * Get platform statistics
 */
export function useStats() {
  return useQuery({
    queryKey: queryKeys.stats.platform(),
    queryFn: async ({ signal }) => {
      return apiGet<PlatformStats>("/stats", signal);
    },
    staleTime: STALE_TIMES.stats,
  });
}
// =============================================================================
// Admin Mutation Hooks
// =============================================================================

import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Create new opportunity
 */
export function useCreateOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiPost("/admin/opportunities", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
  });
}

/**
 * Parse markdown with AI
 */
export function useParseMarkdown() {
  return useMutation({
    mutationFn: (data: { markdown: string; sourcePlatform?: string; sourceUrl?: string }) => 
      apiPost<any>("/admin/parse", data),
  });
}

/**
 * Parse batch markdown with AI
 */
export function useParseBatch() {
  return useMutation({
    mutationFn: (data: { markdown: string }) => 
      apiPost<any>("/admin/parse-batch", data),
  });
}

/**
 * Update existing opportunity
 */
export function useUpdateOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & any) => 
      apiPut(`/admin/opportunities/${id}`, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.detail(variables.slug || "") });
    },
  });
}

/**
 * Delete opportunity
 */
export function useDeleteOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/opportunities/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
  });
}

/**
 * Admin: Get all categories
 */
export function useAdminCategories() {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async ({ signal }) => {
      return apiGet<any[]>("/admin/categories", signal);
    },
  });
}

/**
 * Admin: Get single category
 */
export function useAdminCategory(id: string) {
  return useQuery({
    queryKey: ["admin", "categories", id],
    queryFn: async ({ signal }) => {
      return apiGet<any>(`/admin/categories/${id}`, signal);
    },
    enabled: !!id,
  });
}

/**
 * Admin: Create category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiPost("/admin/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

/**
 * Admin: Update category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & any) => 
      apiPut(`/admin/categories/${id}`, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "categories", variables.id] });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

/**
 * Admin: Delete category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

/**
 * Admin: Get Pinecone vector statistics
 */
export function useVectorStats() {
  return useQuery({
    queryKey: ["admin", "vector-stats"],
    queryFn: async ({ signal }) => {
      const response = await apiGet<any>("/admin/vector-stats", signal);
      return response;
    },
  });
}

/**
 * Admin: Clear Pinecone vector index
 */
export function useClearVectorStats() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiDelete("/admin/vector-stats"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vector-stats"] });
    },
  });
}


// =============================================================================
// Application Tracking Hooks (Phase 1)
// =============================================================================

/**
 * Mark opportunity as applied
 */
export function useMarkApplied() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, feedback }: { id: string; status?: string; feedback?: string }) => 
      apiPost(`/opportunities/${id}/apply`, { status, feedback }),
    onSuccess: () => {
      // Invalidate main list to refresh "excludeApplied" filter
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all });
      // Invalidate user's applications list
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    },
  });
}

/**
 * Get user's applications
 */
export function useMyApplications(filters?: any) {
  return useQuery({
    queryKey: ["my-applications", filters],
    queryFn: async ({ signal }) => {
      const queryString = buildQueryString(filters || {});
      return apiGet<PaginatedResponse<SavedApplication>>(`/opportunities/applied${queryString}`, signal);
    },
  });
}
