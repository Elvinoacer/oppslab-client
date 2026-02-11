// =============================================================================
// Admin Webhook by ID API
// PUT - Update webhook
// DELETE - Remove webhook
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
  updateWebhook,
  deleteWebhook,
  getWebhooks,
  WebhookEventTypes,
  type WebhookEventType,
} from "@/lib/webhooks";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET - Get single webhook
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyAdminAuth(request);
    if (!user) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Admin authentication required"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const { id } = await params;
    const webhooks = getWebhooks();
    const webhook = webhooks.find((w) => w.id === id);

    if (!webhook) {
      return jsonResponse(
        errorResponse("NOT_FOUND", "Webhook not found"),
        StatusCodes.NOT_FOUND
      );
    }

    return jsonResponse(
      successResponse({
        ...webhook,
        secret: "***" + webhook.secret.slice(-4), // Mask secret
      })
    );
  } catch (error) {
    console.error("Error fetching webhook:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to fetch webhook"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// PUT - Update webhook
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyAdminAuth(request);
    if (!user) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Admin authentication required"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate URL if provided
    if (body.url) {
      try {
        new URL(body.url);
      } catch {
        return jsonResponse(
          errorResponse("VALIDATION_ERROR", "Invalid URL format"),
          StatusCodes.BAD_REQUEST
        );
      }
    }

    // Validate events if provided
    if (body.events) {
      const validEvents = Object.values(WebhookEventTypes);
      const invalidEvents = body.events.filter(
        (e: string) => !validEvents.includes(e as WebhookEventType)
      );
      if (invalidEvents.length > 0) {
        return jsonResponse(
          errorResponse("VALIDATION_ERROR", `Invalid events: ${invalidEvents.join(", ")}`),
          StatusCodes.BAD_REQUEST
        );
      }
    }

    const updated = updateWebhook(id, body);

    if (!updated) {
      return jsonResponse(
        errorResponse("NOT_FOUND", "Webhook not found"),
        StatusCodes.NOT_FOUND
      );
    }

    return jsonResponse(
      successResponse({
        ...updated,
        secret: "***" + updated.secret.slice(-4),
      })
    );
  } catch (error) {
    console.error("Error updating webhook:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to update webhook"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// DELETE - Remove webhook
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyAdminAuth(request);
    if (!user) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Admin authentication required"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const { id } = await params;
    const deleted = deleteWebhook(id);

    if (!deleted) {
      return jsonResponse(
        errorResponse("NOT_FOUND", "Webhook not found"),
        StatusCodes.NOT_FOUND
      );
    }

    return jsonResponse(successResponse({ deleted: true }));
  } catch (error) {
    console.error("Error deleting webhook:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to delete webhook"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
