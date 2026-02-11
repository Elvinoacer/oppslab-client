// =============================================================================
// User Mutation Hooks
// TanStack Query mutation hooks for user operations
// =============================================================================

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost, apiPut, apiDelete } from "./api-client";
import { userQueryKeys, type SavedOpportunity, type SavedSearch, type UserPreferences } from "./user-hooks";

// =============================================================================
// Save/Unsave Opportunity Mutations
// =============================================================================

/**
 * Save an opportunity (bookmark)
 */
export function useSaveOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { opportunityId: string; notes?: string }) => {
      return apiPost<SavedOpportunity>("/user/saved-opportunities", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.savedOpportunities.all });
    },
  });
}

/**
 * Unsave an opportunity (remove bookmark)
 */
export function useUnsaveOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (savedOpportunityId: string) => {
      return apiDelete<{ deleted: boolean }>(`/user/saved-opportunities/${savedOpportunityId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.savedOpportunities.all });
    },
  });
}

/**
 * Update saved opportunity status/notes
 */
export function useUpdateSavedOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; notes?: string; applicationStatus?: string }) => {
      return apiPut<SavedOpportunity>(`/user/saved-opportunities/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.savedOpportunities.all });
    },
  });
}

// =============================================================================
// Saved Search Mutations
// =============================================================================

/**
 * Save a search
 */
export function useSaveSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; query: string; filters: Record<string, unknown>; notifyOnNew?: boolean }) => {
      return apiPost<SavedSearch>("/user/saved-searches", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.savedSearches.all });
    },
  });
}

/**
 * Update saved search
 */
export function useUpdateSavedSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; notifyOnNew?: boolean }) => {
      return apiPut<SavedSearch>(`/user/saved-searches/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.savedSearches.all });
    },
  });
}

/**
 * Delete saved search
 */
export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiDelete<{ deleted: boolean }>(`/user/saved-searches/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.savedSearches.all });
    },
  });
}

// =============================================================================
// User Preferences Mutations
// =============================================================================

/**
 * Update user preferences
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<UserPreferences>) => {
      return apiPut<UserPreferences>("/user/preferences", data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(userQueryKeys.preferences.all, data);
    },
  });
}

/**
 * Update user profile (name, bio, location)
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name?: string; bio?: string; location?: string }) => {
      return apiPut<{ name: string; bio: string; location: string }>("/user/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile.all });
    },
  });
}

/**
 * Update user rich profile (education, experience, projects, etc.)
 */
export function useUpdateRichProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (richProfile: Record<string, unknown>) => {
      return apiPut<Record<string, unknown>>("/user/profile", { richProfile });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile.all });
    },
  });
}

