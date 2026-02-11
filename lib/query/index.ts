// =============================================================================
// TanStack Query Library Exports
// =============================================================================

// Provider
export { QueryProvider } from "./provider";

// API Client
export {
  apiFetch,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  buildQueryString,
  ApiClientError,
} from "./api-client";

// Public Query Hooks
export {
  // Keys
  queryKeys,
  // Opportunities
  useOpportunities,
  useInfiniteOpportunities,
  useOpportunity,
  // Categories
  useCategories,
  useCategoryOpportunities,
  // Tags
  useTags,
  // Search
  useSearch,
  // Stats
  useStats,
} from "./hooks";

// User Query Hooks
export {
  userQueryKeys,
  useSavedOpportunities,
  useSavedSearches,
  useUserPreferences,
  type SavedOpportunity,
  type SavedSearch,
  type UserPreferences,
} from "./user-hooks";

// Admin Mutation Hooks
export {
  adminQueryKeys,
  useParseMarkdown,
  useCreateOpportunity,
  useUpdateOpportunity,
  useDeleteOpportunity,
  usePublishOpportunity,
  useCreateCategory,
  useCreateTag,
  type ParseMarkdownRequest,
  type ParseMarkdownResponse,
  type CreateOpportunityRequest,
  type UpdateOpportunityRequest,
} from "./admin-mutations";

// User Mutation Hooks
export {
  useSaveOpportunity,
  useUnsaveOpportunity,
  useUpdateSavedOpportunity,
  useSaveSearch,
  useUpdateSavedSearch,
  useDeleteSavedSearch,
  useUpdatePreferences,
} from "./user-mutations";

// Types
export type {
  // Response types
  PaginationMeta,
  PaginatedResponse,
  // Opportunity types
  OpportunityCategory,
  Industry,
  ExperienceLevel,
  WorkMode,
  OpportunityStatus,
  OpportunityListItem,
  OpportunityDetail,
  // Filter types
  OpportunityFilters,
  SearchFilters,
  SearchRequest,
  // Category & Tag types
  Category,
  Tag,
  TagFilters,
  // Stats types
  PlatformStats,
  // Search types
  SearchResultItem,
  SearchResponse,
} from "./types";
