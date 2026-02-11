// =============================================================================
// Query Types - Shared types for TanStack Query hooks
// =============================================================================

// =============================================================================
// API Response Types
// =============================================================================

export type PaginationMeta = {
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

// =============================================================================
// Opportunity Types
// =============================================================================

export type OpportunityCategory =
  | "FREELANCE"
  | "CONTRACT"
  | "INTERNSHIP"
  | "FULL_TIME"
  | "PART_TIME"
  | "TASK"
  | "TUTORING"
  | "CONSULTING"
  | "VIRTUAL_ASSISTANT"
  | "TRANSCRIPTION"
  | "TRANSLATION"
  | "COACHING"
  | "DROPSHIPPING"
  | "PRINT_ON_DEMAND"
  | "DIGITAL_PRODUCT"
  | "RESELLING"
  | "HANDMADE"
  | "CONTENT_MONETIZATION"
  | "SPONSORSHIP"
  | "NEWSLETTER"
  | "COURSE"
  | "PODCASTING"
  | "MEMBERSHIP"
  | "WEBSITE_FLIPPING"
  | "DOMAIN_FLIPPING"
  | "REAL_ESTATE_DIGITAL"
  | "TRADING_CRYPTO"
  | "TRADING_STOCK"
  | "INVESTMENT"
  | "USER_TESTING"
  | "DATA_LABELING"
  | "BUG_BOUNTY"
  | "AI_TRAINING"
  | "MYSTERY_SHOPPING"
  | "SCHOLARSHIP"
  | "GRANT"
  | "FELLOWSHIP"
  | "RESEARCH"
  | "VOLUNTEER"
  | "COMPETITION"
  | "PROGRAM"
  | "APPRENTICESHIP"
  | "GIG"
  | "SIDE_HUSTLE"
  | "SURVEY"
  | "AFFILIATE"
  | "AMBASSADOR"
  | "OTHER";

export type Industry =
  | "TECHNOLOGY"
  | "HEALTHCARE"
  | "FINANCE"
  | "EDUCATION"
  | "GOVERNMENT"
  | "NONPROFIT"
  | "MEDIA"
  | "RETAIL"
  | "MANUFACTURING"
  | "ENERGY"
  | "AGRICULTURE"
  | "TRANSPORTATION"
  | "REAL_ESTATE"
  | "HOSPITALITY"
  | "PROFESSIONAL_SERVICES"
  | "OTHER";

export type ExperienceLevel =
  | "ENTRY"
  | "JUNIOR"
  | "MID"
  | "SENIOR"
  | "EXECUTIVE"
  | "STUDENT"
  | "ANY";

export type WorkMode = "REMOTE" | "HYBRID" | "ONSITE";

export type OpportunityStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "ACTIVE"
  | "EXPIRING_SOON"
  | "EXPIRED"
  | "ARCHIVED"
  | "DELETED";

export type OpportunityListItem = {
  id: string;
  slug: string;
  title: string;
  company: string;
  shortDescription: string;
  coverImage?: string;
  primaryCategory: OpportunityCategory;
  industry?: Industry;
  experienceLevel: ExperienceLevel;
  workMode?: WorkMode;
  isRemote: boolean;
  locationCity?: string;
  locationCountry?: string;
  deadline?: string;
  compensationType?: string;
  compensationMin?: number;
  compensationMax?: number;
  compensationCurrency?: string;
  skillsRequired: string[];
  tags: Array<{ tag: { id: string; name: string; slug: string } }>;
  createdAt: string;
  matchScore?: number;
};

export type OpportunityDetail = OpportunityListItem & {
  description: string;
  roleType?: string;
  startDate?: string;
  endDate?: string;
  compensationPeriod?: string;
  educationRequirements: string[];
  experienceRequired?: string;
  languageRequirements: string[];
  applicationUrl?: string;
  applicationEmail?: string;
  applicationInstructions?: string;
  sourcePlatform?: string;
  sourceUrl?: string;
  status: OpportunityStatus;
  viewCount: number;
  clickCount: number;
  publishedAt?: string;
  categories: Array<{ category: { id: string; name: string; slug: string } }>;
  eligibilityCriteria: Array<{ id: string; type: string; description: string; required: boolean }>;
  benefits: Array<{ id: string; type: string; description: string; value?: string }>;
  requiredMaterials: Array<{ id: string; type: string; description: string; required: boolean }>;
  timelineEvents: Array<{ id: string; eventType: string; title: string; eventDate?: string; description?: string }>;
  contacts: Array<{ id: string; type: string; name?: string; email?: string; phone?: string }>;
  relatedOpportunities?: OpportunityListItem[];
  updatedAt: string;
  // User specific
  applicationStatus?: string | null;
  userFeedback?: string | null;
  isSaved?: boolean;
};

// =============================================================================
// Application Types
// =============================================================================

export type SavedApplication = {
  id: string;
  userId: string;
  opportunityId: string;
  savedAt: string;
  notes?: string;
  folderName?: string;
  status: string; // ApplicationStatus enum
  statusUpdatedAt?: string;
  reminderDate?: string;
  feedback?: string;
  lastFollowUpAt?: string;
  opportunity: OpportunityListItem;
};

export type OpportunityFilters = {
  category?: OpportunityCategory;
  industry?: Industry;
  roleType?: string;
  experienceLevel?: ExperienceLevel;
  workMode?: WorkMode;
  isRemote?: boolean;
  locationCity?: string;
  locationCountry?: string;
  tags?: string;
  skills?: string;
  deadlineAfter?: string;
  deadlineBefore?: string;
  q?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  excludeApplied?: boolean;
  personalized?: boolean;
};

export type SearchFilters = {
  category?: OpportunityCategory | OpportunityCategory[];
  industry?: Industry | Industry[];
  roleType?: string | string[];
  experienceLevel?: ExperienceLevel | ExperienceLevel[];
  workMode?: WorkMode | WorkMode[];
  isRemote?: boolean;
  locationCountry?: string | string[];
  locationCity?: string;
  deadlineAfter?: string;
  deadlineBefore?: string;
  tags?: string[];
  skills?: string[];
};

export type SearchRequest = {
  query: string;
  filters?: SearchFilters;
  searchMode?: "text" | "semantic" | "hybrid";
  page?: number;
  pageSize?: number;
};

// =============================================================================
// Category & Tag Types
// =============================================================================

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  level: number;
  opportunityCount: number;
  children?: Category[];
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  color?: string;
  icon?: string;
  usageCount: number;
};

export type TagFilters = {
  category?: string;
  minUsage?: number;
  sortBy?: string;
  groupBy?: "category";
};

// =============================================================================
// Stats Types
// =============================================================================

export type PlatformStats = {
  totalActive: number;
  expiringSoon: number;
  recentlyAdded: number;
  totalCategories: number;
  topCategories: Array<{ name: string; slug: string; count: number }>;
  topIndustries: Array<{ industry: string; count: number }>;
  topLocations: Array<{ country: string; count: number }>;
  topCompanies: Array<{ company: string; count: number }>;
};

// =============================================================================
// Search Result Types
// =============================================================================

export type SearchResultItem = OpportunityListItem & {
  relevanceScore: number;
  highlights?: {
    title?: string;
    description?: string;
    company?: string;
  };
  matchType: "text" | "semantic" | "both";
};

export type SearchResponse = {
  results: SearchResultItem[];
  meta: PaginationMeta & {
    searchMode: string;
    processingTimeMs: number;
  };
};
