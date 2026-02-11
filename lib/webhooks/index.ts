// =============================================================================
// Webhook Library Exports
// =============================================================================

export {
  WebhookEventTypes,
  type WebhookEventType,
  type WebhookPayload,
  type OpportunityEventData,
  type WebhookEndpoint,
  type WebhookDelivery,
} from "./types";

export {
  registerWebhook,
  getWebhooks,
  updateWebhook,
  deleteWebhook,
  dispatchEvent,
  emitOpportunityCreated,
  emitOpportunityUpdated,
  emitOpportunityPublished,
  emitOpportunityExpired,
  emitOpportunityDeleted,
} from "./dispatch";
