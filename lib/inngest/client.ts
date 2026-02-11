// =============================================================================
// Inngest Client Configuration
// =============================================================================

import { Inngest } from "inngest";

// Create the Inngest client
export const inngest = new Inngest({
  id: "opportunities-app",
  name: "Opportunities Aggregator",
});

// Event types for type-safety
export type Events = {
  // Opportunity lifecycle events
  "opportunity/created": {
    data: {
      opportunityId: string;
      slug: string;
      title: string;
    };
  };
  "opportunity/updated": {
    data: {
      opportunityId: string;
      slug: string;
      changes: string[];
    };
  };
  "opportunity/published": {
    data: {
      opportunityId: string;
      slug: string;
    };
  };
  // Manual triggers
  "jobs/sync-vectors": {
    data: {
      opportunityId?: string; // Optional - sync specific or all
    };
  };
  "jobs/process-expirations": {
    data: Record<string, never>;
  };
  "jobs/update-stats": {
    data: Record<string, never>;
  };
};
