// =============================================================================
// API Library Exports
// =============================================================================

// Response utilities
export {
  successResponse,
  errorResponse,
  createPagination,
  parsePagination,
  parseSort,
  jsonResponse,
  ErrorCodes,
  StatusCodes,
  type ApiResponse,
  type ApiMeta,
  type ApiError as ApiErrorType,
} from "./response";

// Authentication
export {
  verifyAdminAuth,
  withAdminAuth,
  type AuthenticatedUser,
} from "./auth";

// Rate limiting
export {
  checkRateLimit,
  withRateLimit,
  addRateLimitHeaders,
  RateLimitConfig,
  type RateLimitResult,
} from "./rate-limit";

// Validation
export {
  // Schemas
  PaginationSchema,
  SortSchema,
  CategoryEnum,
  IndustryEnum,
  ExperienceLevelEnum,
  WorkModeEnum,
  CompensationTypeEnum,
  StatusEnum,
  OpportunityFiltersSchema,
  CreateOpportunitySchema,
  UpdateOpportunitySchema,
  SearchRequestSchema,
  ParseRequestSchema,
  CreateCategorySchema,
  CreateTagSchema,
  // Helpers
  validateBody,
  validateQuery,
} from "./validation";

// Middleware
export {
  withErrorHandling,
  ApiError,
} from "./middleware";
