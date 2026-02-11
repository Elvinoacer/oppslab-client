// =============================================================================
// Webhook Dispatch Service
// Handles webhook event dispatching with retry logic
// =============================================================================

import crypto from "crypto";
import {
  WebhookEventType,
  WebhookPayload,
  OpportunityEventData,
  WebhookEventTypes,
} from "./types";

// In-memory webhook store (use database in production)
type WebhookConfig = {
  id: string;
  url: string;
  secret: string;
  events: WebhookEventType[];
  isActive: boolean;
};

const webhookStore: WebhookConfig[] = [];

/**
 * Generate unique ID
 */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Create HMAC signature for webhook payload
 */
function createSignature(payload: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}

/**
 * Register a new webhook endpoint
 */
export function registerWebhook(
  url: string,
  secret: string,
  events: WebhookEventType[]
): WebhookConfig {
  const webhook: WebhookConfig = {
    id: generateId(),
    url,
    secret,
    events,
    isActive: true,
  };
  webhookStore.push(webhook);
  return webhook;
}

/**
 * Get all registered webhooks
 */
export function getWebhooks(): WebhookConfig[] {
  return [...webhookStore];
}

/**
 * Update webhook configuration
 */
export function updateWebhook(
  id: string,
  updates: Partial<Omit<WebhookConfig, "id">>
): WebhookConfig | null {
  const index = webhookStore.findIndex((w) => w.id === id);
  if (index === -1) return null;
  
  webhookStore[index] = { ...webhookStore[index], ...updates };
  return webhookStore[index];
}

/**
 * Delete a webhook
 */
export function deleteWebhook(id: string): boolean {
  const index = webhookStore.findIndex((w) => w.id === id);
  if (index === -1) return false;
  
  webhookStore.splice(index, 1);
  return true;
}

/**
 * Create webhook payload
 */
function createPayload<T>(
  event: WebhookEventType,
  data: T,
  userId?: string
): WebhookPayload<T> {
  return {
    id: generateId(),
    event,
    timestamp: new Date().toISOString(),
    data,
    metadata: {
      userId,
      source: "opportunities-api",
      version: "1.0",
    },
  };
}

/**
 * Dispatch webhook to a single endpoint
 */
async function dispatchToEndpoint(
  webhook: WebhookConfig,
  payload: WebhookPayload
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const payloadString = JSON.stringify(payload);
  const signature = createSignature(payloadString, webhook.secret);
  
  try {
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": `sha256=${signature}`,
        "X-Webhook-Event": payload.event,
        "X-Webhook-Id": payload.id,
        "X-Webhook-Timestamp": payload.timestamp,
      },
      body: payloadString,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    if (response.ok) {
      return { success: true, statusCode: response.status };
    } else {
      return {
        success: false,
        statusCode: response.status,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Dispatch webhook event to all registered endpoints
 */
export async function dispatchEvent<T>(
  event: WebhookEventType,
  data: T,
  userId?: string
): Promise<void> {
  const payload = createPayload(event, data, userId);
  
  // Find all webhooks that subscribe to this event
  const subscribers = webhookStore.filter(
    (w) => w.isActive && w.events.includes(event)
  );
  
  if (subscribers.length === 0) {
    return;
  }
  
  // Dispatch to all subscribers (fire and forget for now)
  const dispatches = subscribers.map((webhook) =>
    dispatchToEndpoint(webhook, payload)
      .then((result) => {
        if (!result.success) {
          console.error(
            `Webhook delivery failed for ${webhook.id}:`,
            result.error
          );
        }
      })
      .catch((err) => {
        console.error(`Webhook dispatch error for ${webhook.id}:`, err);
      })
  );
  
  // Don't await - fire and forget
  Promise.allSettled(dispatches);
}

// =============================================================================
// Convenience Functions for Common Events
// =============================================================================

/**
 * Dispatch opportunity.created event
 */
export function emitOpportunityCreated(
  opportunity: OpportunityEventData,
  userId?: string
): void {
  dispatchEvent(WebhookEventTypes.OPPORTUNITY_CREATED, opportunity, userId);
}

/**
 * Dispatch opportunity.updated event
 */
export function emitOpportunityUpdated(
  opportunity: OpportunityEventData,
  userId?: string
): void {
  dispatchEvent(WebhookEventTypes.OPPORTUNITY_UPDATED, opportunity, userId);
}

/**
 * Dispatch opportunity.published event
 */
export function emitOpportunityPublished(
  opportunity: OpportunityEventData,
  userId?: string
): void {
  dispatchEvent(WebhookEventTypes.OPPORTUNITY_PUBLISHED, opportunity, userId);
}

/**
 * Dispatch opportunity.expired event
 */
export function emitOpportunityExpired(
  opportunity: OpportunityEventData,
  userId?: string
): void {
  dispatchEvent(WebhookEventTypes.OPPORTUNITY_EXPIRED, opportunity, userId);
}

/**
 * Dispatch opportunity.deleted event
 */
export function emitOpportunityDeleted(
  opportunityId: string,
  userId?: string
): void {
  dispatchEvent(
    WebhookEventTypes.OPPORTUNITY_DELETED,
    { id: opportunityId },
    userId
  );
}
