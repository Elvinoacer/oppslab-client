// =============================================================================
// Webhook Types and Events
// =============================================================================

/**
 * Webhook event types
 */
export const WebhookEventTypes = {
  OPPORTUNITY_CREATED: "opportunity.created",
  OPPORTUNITY_UPDATED: "opportunity.updated",
  OPPORTUNITY_PUBLISHED: "opportunity.published",
  OPPORTUNITY_EXPIRED: "opportunity.expired",
  OPPORTUNITY_DELETED: "opportunity.deleted",
  CATEGORY_CREATED: "category.created",
  TAG_CREATED: "tag.created",
} as const;

export type WebhookEventType = (typeof WebhookEventTypes)[keyof typeof WebhookEventTypes];

/**
 * Webhook payload structure
 */
export type WebhookPayload<T = unknown> = {
  id: string;
  event: WebhookEventType;
  timestamp: string;
  data: T;
  metadata?: {
    userId?: string;
    source?: string;
    version: string;
  };
};

/**
 * Opportunity event data
 */
export type OpportunityEventData = {
  id: string;
  slug: string;
  title: string;
  company: string;
  primaryCategory: string;
  status: string;
  deadline?: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
};

/**
 * Webhook endpoint configuration
 */
export type WebhookEndpoint = {
  id: string;
  url: string;
  secret: string;
  events: WebhookEventType[];
  isActive: boolean;
  createdAt: Date;
  lastTriggeredAt?: Date;
  failureCount: number;
};

/**
 * Webhook delivery attempt
 */
export type WebhookDelivery = {
  id: string;
  webhookId: string;
  event: WebhookEventType;
  payload: WebhookPayload;
  status: "pending" | "success" | "failed";
  statusCode?: number;
  response?: string;
  attempts: number;
  nextAttemptAt?: Date;
  createdAt: Date;
  completedAt?: Date;
};
