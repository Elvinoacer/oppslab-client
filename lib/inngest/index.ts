// =============================================================================
// Inngest Functions Export
// All scheduled jobs and event handlers
// =============================================================================

import { expirationManagement, scheduledPublishing } from "./jobs/expiration";
import { vectorEmbeddingSync, syncOpportunityVector } from "./jobs/vectors";
import { analyticsProcessing, hourlyStatsRefresh } from "./jobs/analytics";

// Export all Inngest functions for the serve handler
export const inngestFunctions = [
  // Expiration & Publishing
  expirationManagement,
  scheduledPublishing,
  
  // Vector Sync
  vectorEmbeddingSync,
  syncOpportunityVector,
  
  // Analytics
  analyticsProcessing,
  hourlyStatsRefresh,
];

// Re-export client and types
export { inngest, type Events } from "./client";

// Re-export individual functions
export {
  expirationManagement,
  scheduledPublishing,
  vectorEmbeddingSync,
  syncOpportunityVector,
  analyticsProcessing,
  hourlyStatsRefresh,
};
