// =============================================================================
// Admin Webhooks API
// GET - List all registered webhooks
// POST - Register new webhook
// =============================================================================

import { NextRequest } from "next/server";
import { verifyAdminAuth } from "@/lib/api/auth";
import {
  successResponse,
  errorResponse,
  jsonResponse,
  StatusCodes,
} from "@/lib/api";
import {
  registerWebhook,
  getWebhooks,
  WebhookEventTypes,
  type WebhookEventType,
} from "@/lib/webhooks";

// GET - List all webhooks
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdminAuth(request);
    if (!user) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Admin authentication required"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const webhooks = getWebhooks().map((w) => ({
      ...w,
      secret: "***" + w.secret.slice(-4), // Mask secret
    }));

    return jsonResponse(
      successResponse({
        webhooks,
        availableEvents: Object.values(WebhookEventTypes),
      })
    );
  } catch (error) {
    console.error("Error listing webhooks:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to list webhooks"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// POST - Register new webhook
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAdminAuth(request);
    if (!user) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Admin authentication required"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const body = await request.json();
    const { url, secret, events } = body;

    // Validate required fields
    if (!url || !secret || !events) {
      return jsonResponse(
        errorResponse("VALIDATION_ERROR", "url, secret, and events are required"),
        StatusCodes.BAD_REQUEST
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return jsonResponse(
        errorResponse("VALIDATION_ERROR", "Invalid URL format"),
        StatusCodes.BAD_REQUEST
      );
    }

    // Validate secret length
    if (secret.length < 16) {
      return jsonResponse(
        errorResponse("VALIDATION_ERROR", "Secret must be at least 16 characters"),
        StatusCodes.BAD_REQUEST
      );
    }

    // Validate events
    const validEvents = Object.values(WebhookEventTypes);
    const invalidEvents = events.filter((e: string) => !validEvents.includes(e as WebhookEventType));
    if (invalidEvents.length > 0) {
      return jsonResponse(
        errorResponse("VALIDATION_ERROR", `Invalid events: ${invalidEvents.join(", ")}`),
        StatusCodes.BAD_REQUEST
      );
    }

    const webhook = registerWebhook(url, secret, events);

    return jsonResponse(
      successResponse({
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        isActive: webhook.isActive,
        message: "Webhook registered successfully",
      }),
      StatusCodes.CREATED
    );
  } catch (error) {
    console.error("Error registering webhook:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to register webhook"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
