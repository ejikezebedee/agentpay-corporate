import { createServer } from "node:http";
import { loadListingRequirementSchema, loadVisibleCatalog } from "./catalog.js";
import { createOrder, getOrder, saveOrder } from "./store.js";
import { transitionOrder } from "./escrow.js";
import { appendAuditEvent, listAuditEvents } from "./audit.js";
import { verifyAgentAuthorization } from "./auth.js";
import { verifyBinancePayWebhook } from "./binancePay.js";
import { loadConfig } from "./config.js";
import { buildSandboxClientEnvironment } from "./sandbox.js";

async function readRawBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}

function parseJson(raw) {
  return raw ? JSON.parse(raw) : {};
}

function send(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload, null, 2));
}

function sendError(response, statusCode, message) {
  send(response, statusCode, { error: message });
}

const config = loadConfig();
const catalog = await loadVisibleCatalog();

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");

    if (request.method === "GET" && url.pathname === "/health") {
      return send(response, 200, { ok: true, service: "agentpay-backend-service" });
    }

    if (request.method === "GET" && url.pathname === "/api/v1/listings") {
      return send(response, 200, { items: catalog });
    }

    if (request.method === "GET" && url.pathname === "/api/v1/sandbox/client-environment") {
      return send(response, 200, buildSandboxClientEnvironment({ catalog }));
    }

    const schemaMatch = url.pathname.match(/^\/api\/v1\/listings\/([a-z0-9-]+)\/schema$/);
    if (request.method === "GET" && schemaMatch) {
      const listing = catalog.find((item) => item.public_slug === schemaMatch[1]);
      if (!listing) {
        return sendError(response, 404, "Listing not found");
      }

      const schema = await loadListingRequirementSchema(listing.requirements_schema_file.replace("/backend/", ""));
      return send(response, 200, {
        listing_id: listing.id,
        public_slug: listing.public_slug,
        schema_id: listing.schema_id,
        price: listing.price,
        currency: listing.currency,
        requirements_schema: schema,
        delivery_artifact: listing.delivery_artifact,
        production_boundary: "This starter route exposes machine-readable intake for buyer agents. Live payment settlement and production archive delivery require deployment approval and completed launch-control gates."
      });
    }

    if (request.method === "GET" && url.pathname === "/api/v1/admin/audit-events") {
      const authorization = verifyAgentAuthorization({
        authorization: request.headers.authorization,
        method: request.method,
        pathname: url.pathname,
        body: "",
        expectedKeyId: config.apiKeyId,
        secret: config.apiKeySecret
      });

      if (!authorization.ok) {
        return sendError(response, 401, authorization.reason);
      }

      return send(response, 200, { items: listAuditEvents() });
    }

    if (request.method === "POST" && url.pathname === "/api/v1/webhooks/binance-pay") {
      const rawBody = await readRawBody(request);
      const verification = verifyBinancePayWebhook({
        timestamp: request.headers["binancepay-timestamp"],
        nonce: request.headers["binancepay-nonce"],
        body: rawBody,
        signature: request.headers["binancepay-signature"],
        publicKeyPem: config.binancePayWebhookPublicKeyPem
      });

      appendAuditEvent({
        actorType: "provider",
        actorId: "binance_pay",
        action: verification.ok ? "webhook.accepted" : "webhook.rejected",
        subjectType: "payment_deposit",
        metadata: { provider: "binance_pay", reason: verification.reason || null }
      });

      return verification.ok ? send(response, 202, { accepted: true }) : sendError(response, 401, verification.reason);
    }

    if (request.method === "POST" && url.pathname === "/api/v1/orders") {
      const rawBody = await readRawBody(request);
      const authorization = verifyAgentAuthorization({
        authorization: request.headers.authorization,
        method: request.method,
        pathname: url.pathname,
        body: rawBody,
        expectedKeyId: config.apiKeyId,
        secret: config.apiKeySecret
      });

      if (!authorization.ok) {
        appendAuditEvent({
          actorType: "agent",
          action: "order.authorization_failed",
          subjectType: "order",
          metadata: { reason: authorization.reason }
        });
        return sendError(response, 401, authorization.reason);
      }

      const body = parseJson(rawBody);
      const listing = catalog.find((item) => item.id === body.listing_id || item.public_slug === body.public_slug);
      if (!listing) {
        return sendError(response, 404, "Listing not found");
      }

      const result = createOrder({
        listing,
        buyerUserId: body.buyer_user_id || "demo-buyer",
        buyerAgentId: body.buyer_agent_id,
        idempotencyKey: request.headers["idempotency-key"],
        requestPayload: body.request_payload || {}
      });

      appendAuditEvent({
        actorType: "agent",
        actorId: authorization.keyId || body.buyer_agent_id || null,
        action: result.reused ? "order.idempotency_reused" : "order.created",
        subjectType: "order",
        subjectId: result.order.id,
        metadata: { listing_id: result.order.listing_id, currency: result.order.currency, amount: result.order.amount }
      });

      return send(response, result.reused ? 200 : 201, result.order);
    }

    const actionMatch = url.pathname.match(/^\/api\/v1\/orders\/([^/]+)\/(approve|lock_escrow|start_delivery|deliver|release|refund|dispute|cancel)$/);
    if (request.method === "POST" && actionMatch) {
      const [, orderId, action] = actionMatch;
      const order = getOrder(orderId);
      if (!order) {
        return sendError(response, 404, "Order not found");
      }

      const transitioned = transitionOrder(order, action);
      const updated = saveOrder(
        action === "lock_escrow" && transitioned.delivery_artifact
          ? {
              ...transitioned,
              delivery_proof: {
                status: "archive_delivery_ready",
                artifact: transitioned.delivery_artifact,
                release_trigger: "escrow_locked",
                proof_note: "Verified archive delivery is ready for authenticated buyer-agent transport after escrow lock. Production delivery requires durable storage and deployment approval."
              }
            }
          : transitioned
      );
      appendAuditEvent({
        actorType: "system",
        action: `order.${action}`,
        subjectType: "order",
        subjectId: updated.id,
        metadata: { status: updated.status, ledger_effects: updated.ledgerEffects || [] }
      });
      return send(response, 200, updated);
    }

    return sendError(response, 404, "Route not found");
  } catch (error) {
    return sendError(response, 400, error.message);
  }
});

const port = config.port;
server.listen(port, () => {
  process.stdout.write(`AgentPay backend service listening on ${port}\n`);
});
