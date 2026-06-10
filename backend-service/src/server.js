import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { loadListingRequirementSchema, loadVisibleCatalog } from "./catalog.js";
import { createOrder, getOrder, saveOrder } from "./store.js";
import { transitionOrder } from "./escrow.js";
import { appendAuditEvent, listAuditEvents } from "./audit.js";
import { createAdminToken, createUserSessionToken, requireRole, verifyAdminCredentials, verifyAdminToken, verifyAgentAuthorization, verifyPasswordHash, verifyUserSessionToken } from "./auth.js";
import { verifyBinancePayWebhook } from "./binancePay.js";
import { loadConfig } from "./config.js";
import { buildSandboxClientEnvironment } from "./sandbox.js";
import { MemoryAgentPayRepository } from "./domain/memoryRepository.js";
import { DISCOUNT_TYPES, DISPUTE_STATUS, RELATED_ENTITY_TYPES, ROLES } from "./domain/models.js";

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

function send(response, statusCode, payload, headers = {}) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Headers": "Authorization, Content-Type, Idempotency-Key",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Origin": config.appOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Content-Type": "application/json",
    ...headers
  });
  response.end(JSON.stringify(payload, null, 2));
}

function sendError(response, statusCode, message) {
  send(response, statusCode, { error: message });
}

const config = loadConfig();
const catalog = await loadVisibleCatalog();
export const appRepository = new MemoryAgentPayRepository();
const ADMIN_COOKIE_NAME = "agentpay_admin_session";

function parseCookies(request) {
  return Object.fromEntries(String(request.headers.cookie || "").split(";").map((part) => {
    const [name, ...rest] = part.trim().split("=");
    return [name, decodeURIComponent(rest.join("=") || "")];
  }).filter(([name]) => name));
}

function adminSessionCookie(token, maxAgeSeconds = 8 * 60 * 60) {
  return `${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}`;
}

function clearAdminSessionCookie() {
  return `${ADMIN_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

function parseRequestBody(raw, request) {
  const contentType = request.headers["content-type"] || "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(raw));
  }
  return parseJson(raw);
}

function getIpAddress(request) {
  return request.headers["x-forwarded-for"]?.split(",")[0]?.trim() || request.socket.remoteAddress || null;
}

function getSession(request) {
  const cookies = parseCookies(request);
  const authorization = request.headers.authorization;
  const candidateTokens = [
    authorization,
    authorization,
    cookies[ADMIN_COOKIE_NAME]
  ];
  const candidateSecrets = [
    config.sessionTokenSecret,
    config.adminSessionSecret,
    config.adminSessionSecret
  ];
  let session = { ok: false, reason: "Authentication required" };
  for (let index = 0; index < candidateTokens.length; index += 1) {
    if (!candidateTokens[index]) continue;
    session = verifyUserSessionToken({
      authorization: candidateTokens[index],
      secret: candidateSecrets[index]
    });
    if (session.ok) break;
  }

  if (!session.ok) return session;
  const user = appRepository.getUser(session.userId);
  if (!user) return { ok: false, reason: "Session user not found" };
  return { ...session, user };
}

function rejectUnauthorized(request, response, reason, statusCode = 401) {
  const action = request.url.includes("/admin") || request.url.includes("/api/listings") || request.url.includes("/api/disputes")
    ? "unauthorized_admin_access_rejected"
    : "unauthorized_access_rejected";
  const event = {
    action,
    entityType: "request",
    entityId: request.url,
    ipAddress: getIpAddress(request),
    metadata: { reason, method: request.method }
  };
  appRepository.appendAuditEvent(event);
  if (action !== "unauthorized_access_rejected") {
    appRepository.appendAuditEvent({ ...event, action: "unauthorized_access_rejected" });
  }
  return sendError(response, statusCode, reason);
}

function requireRequestRole(request, response, roles) {
  const session = getSession(request);
  const authorization = requireRole(session, roles);
  if (!authorization.ok) {
    rejectUnauthorized(request, response, authorization.reason, authorization.statusCode);
    return null;
  }
  return authorization.session;
}

function recordAuditEvent({ request, session, action, entityType, entityId = null, metadata = {} }) {
  appRepository.appendAuditEvent({
    actorUserId: session?.userId || null,
    actorRole: session?.role || null,
    action,
    entityType,
    entityId,
    ipAddress: getIpAddress(request),
    metadata
  });
}

export function createAgentPayServer() {
  appRepository.reset();
  return createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");

    if (request.method === "OPTIONS") {
      return send(response, 204, {});
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return send(response, 200, { ok: true, service: "agentpay-backend-service" });
    }

    if (request.method === "GET" && url.pathname === "/api/v1/listings") {
      return send(response, 200, { items: catalog });
    }

    if (request.method === "GET" && url.pathname === "/api/v1/sandbox/client-environment") {
      return send(response, 200, buildSandboxClientEnvironment({ catalog }));
    }

    if (request.method === "GET" && url.pathname === "/api/listings") {
      const session = requireRequestRole(request, response, [ROLES.SELLER, ROLES.ADMIN]);
      if (!session) return;

      const items = appRepository.listListings({
        includeArchived: url.searchParams.get("include_archived") === "true",
        sellerUserId: session.role === ROLES.SELLER ? session.userId : null
      });
      return send(response, 200, { items });
    }

    const listingDetailMatch = url.pathname.match(/^\/api\/listings\/([^/]+)(?:\/(status|discount))?$/);
    if (listingDetailMatch && request.method === "GET" && !listingDetailMatch[2]) {
      const session = requireRequestRole(request, response, [ROLES.SELLER, ROLES.ADMIN]);
      if (!session) return;
      const listing = appRepository.getListing(listingDetailMatch[1]);
      if (!listing) return sendError(response, 404, "Listing not found");
      if (session.role === ROLES.SELLER && listing.seller_user_id !== session.userId) {
        return rejectUnauthorized(request, response, "Cannot view another seller listing", 403);
      }
      return send(response, 200, listing);
    }

    if (request.method === "POST" && url.pathname === "/api/listings") {
      const session = requireRequestRole(request, response, [ROLES.SELLER, ROLES.ADMIN]);
      if (!session) return;

      const body = parseJson(await readRawBody(request));
      const listing = appRepository.createListing({
        ...body,
        sellerUserId: body.seller_user_id || session.userId,
        status: body.status === "submit_for_review" ? "pending_review" : body.status
      });
      appRepository.appendAuditEvent({
        actorUserId: session.userId,
        actorRole: session.role,
        action: "listing_created",
        entityType: "listing",
        entityId: listing.id,
        ipAddress: getIpAddress(request),
        metadata: { title: listing.title, status: listing.status, final_price: listing.final_price }
      });
      return send(response, 201, listing);
    }

    const listingMatch = listingDetailMatch?.[2] ? null : url.pathname.match(/^\/api\/listings\/([^/]+)$/);
    if (listingMatch && request.method === "PATCH") {
      const session = requireRequestRole(request, response, [ROLES.SELLER, ROLES.ADMIN]);
      if (!session) return;

      const listingId = listingMatch[1];
      const existing = appRepository.getListing(listingId);
      if (!existing) return sendError(response, 404, "Listing not found");
      if (session.role === ROLES.SELLER && existing.seller_user_id !== session.userId) {
        return rejectUnauthorized(request, response, "Cannot edit another seller listing", 403);
      }

      const body = parseJson(await readRawBody(request));
      const updated = appRepository.updateListing({ listingId, updates: body });
      const actions = ["listing_updated"];
      if (existing.status !== updated.status) actions.push("listing_status_changed");
      if (existing.discount_type !== updated.discount_type || existing.discount_value !== updated.discount_value) {
        if (updated.discount_type === DISCOUNT_TYPES.NONE) actions.push("listing_discount_removed");
        else actions.push("listing_discount_added");
      }
      actions.forEach((action) => appRepository.appendAuditEvent({
        actorUserId: session.userId,
        actorRole: session.role,
        action,
        entityType: "listing",
        entityId: updated.id,
        ipAddress: getIpAddress(request),
        metadata: { previous_status: existing.status, status: updated.status, final_price: updated.final_price }
      }));
      return send(response, 200, updated);
    }

    if (listingDetailMatch && request.method === "PATCH" && listingDetailMatch[2] === "status") {
      const session = requireRequestRole(request, response, [ROLES.SELLER, ROLES.ADMIN]);
      if (!session) return;
      const listingId = listingDetailMatch[1];
      const existing = appRepository.getListing(listingId);
      if (!existing) return sendError(response, 404, "Listing not found");
      if (session.role === ROLES.SELLER && existing.seller_user_id !== session.userId) {
        return rejectUnauthorized(request, response, "Cannot update another seller listing", 403);
      }
      const body = parseJson(await readRawBody(request));
      const updated = appRepository.updateListingStatus({ listingId, status: body.status });
      appRepository.appendAuditEvent({
        actorUserId: session.userId,
        actorRole: session.role,
        action: "listing_status_changed",
        entityType: "listing",
        entityId: updated.id,
        ipAddress: getIpAddress(request),
        metadata: { previous_status: existing.status, status: updated.status }
      });
      return send(response, 200, updated);
    }

    if (listingDetailMatch && request.method === "PATCH" && listingDetailMatch[2] === "discount") {
      const session = requireRequestRole(request, response, [ROLES.SELLER, ROLES.ADMIN]);
      if (!session) return;
      const listingId = listingDetailMatch[1];
      const existing = appRepository.getListing(listingId);
      if (!existing) return sendError(response, 404, "Listing not found");
      if (session.role === ROLES.SELLER && existing.seller_user_id !== session.userId) {
        return rejectUnauthorized(request, response, "Cannot discount another seller listing", 403);
      }
      const body = parseJson(await readRawBody(request));
      const updated = appRepository.updateListingDiscount({
        listingId,
        discountType: body.discountType || body.discount_type,
        discountValue: body.discountValue || body.discount_value || "0"
      });
      appRepository.appendAuditEvent({
        actorUserId: session.userId,
        actorRole: session.role,
        action: updated.discount_type === DISCOUNT_TYPES.NONE ? "listing_discount_removed" : "listing_discount_added",
        entityType: "listing",
        entityId: updated.id,
        ipAddress: getIpAddress(request),
        metadata: { discount_type: updated.discount_type, discount_value: updated.discount_value, final_price: updated.final_price }
      });
      return send(response, 200, updated);
    }

    if (listingMatch && request.method === "DELETE") {
      const session = requireRequestRole(request, response, [ROLES.SELLER, ROLES.ADMIN]);
      if (!session) return;

      const listingId = listingMatch[1];
      const existing = appRepository.getListing(listingId);
      if (!existing) return sendError(response, 404, "Listing not found");
      if (session.role === ROLES.SELLER && existing.seller_user_id !== session.userId) {
        return rejectUnauthorized(request, response, "Cannot archive another seller listing", 403);
      }

      const archived = appRepository.archiveListing(listingId);
      appRepository.appendAuditEvent({
        actorUserId: session.userId,
        actorRole: session.role,
        action: "listing_archived",
        entityType: "listing",
        entityId: archived.id,
        ipAddress: getIpAddress(request),
        metadata: { previous_status: existing.status, status: archived.status }
      });
      return send(response, 200, archived);
    }

    if (request.method === "GET" && url.pathname === "/api/users") {
      const session = requireRequestRole(request, response, [ROLES.ADMIN, ROLES.SUPPORT]);
      if (!session) return;
      return send(response, 200, { items: appRepository.listUsers().map(({ id, email, display_name, role, status }) => ({ id, email, display_name, role, status })) });
    }

    if (request.method === "GET" && url.pathname === "/api/messages") {
      const session = requireRequestRole(request, response, [ROLES.BUYER, ROLES.SELLER, ROLES.ADMIN, ROLES.SUPPORT]);
      if (!session) return;
      return send(response, 200, { items: appRepository.listMessagesForUser({ userId: session.userId, role: session.role, status: url.searchParams.get("status") || null }) });
    }

    const threadMatch = url.pathname.match(/^\/api\/messages\/([^/]+)$/);
    if (threadMatch && request.method === "GET") {
      const session = requireRequestRole(request, response, [ROLES.BUYER, ROLES.SELLER, ROLES.ADMIN, ROLES.SUPPORT]);
      if (!session) return;
      try {
        return send(response, 200, { items: appRepository.listThreadMessages({ threadId: threadMatch[1], userId: session.userId, role: session.role }) });
      } catch (error) {
        appRepository.appendAuditEvent({
          actorUserId: session.userId,
          actorRole: session.role,
          action: "unauthorized_message_access_rejected",
          entityType: "message_thread",
          entityId: threadMatch[1],
          ipAddress: getIpAddress(request),
          metadata: { reason: error.message }
        });
        return sendError(response, 403, error.message);
      }
    }

    if (request.method === "POST" && url.pathname === "/api/messages") {
      const session = requireRequestRole(request, response, [ROLES.ADMIN, ROLES.SUPPORT]);
      if (!session) return;
      const body = parseJson(await readRawBody(request));
      const message = appRepository.createMessage({ ...body, senderUserId: session.userId });
      appRepository.appendAuditEvent({
        actorUserId: session.userId,
        actorRole: session.role,
        action: "message_sent",
        entityType: "message",
        entityId: message.id,
        ipAddress: getIpAddress(request),
        metadata: { recipient_user_id: message.recipient_user_id, subject: message.subject }
      });
      return send(response, 201, message);
    }

    const messageActionMatch = url.pathname.match(/^\/api\/messages\/([^/]+)\/(read|archive)$/);
    if (messageActionMatch && request.method === "PATCH") {
      const session = requireRequestRole(request, response, [ROLES.BUYER, ROLES.SELLER, ROLES.ADMIN, ROLES.SUPPORT]);
      if (!session) return;
      const message = appRepository.getMessage(messageActionMatch[1]);
      if (!message) return sendError(response, 404, "Message not found");
      if (![ROLES.ADMIN, ROLES.SUPPORT].includes(session.role) && message.recipient_user_id !== session.userId && message.sender_user_id !== session.userId) {
        appRepository.appendAuditEvent({
          actorUserId: session.userId,
          actorRole: session.role,
          action: "unauthorized_message_access_rejected",
          entityType: "message",
          entityId: message.id,
          ipAddress: getIpAddress(request)
        });
        return sendError(response, 403, "Cannot access another user's message");
      }
      const updated = messageActionMatch[2] === "read" ? appRepository.markMessageRead(message.id) : appRepository.archiveMessage(message.id);
      appRepository.appendAuditEvent({
        actorUserId: session.userId,
        actorRole: session.role,
        action: messageActionMatch[2] === "read" ? "message_read" : "message_archived",
        entityType: "message",
        entityId: message.id,
        ipAddress: getIpAddress(request)
      });
      return send(response, 200, updated);
    }

    if (request.method === "POST" && url.pathname === "/api/messages/announcement") {
      const session = requireRequestRole(request, response, [ROLES.ADMIN, ROLES.SUPPORT]);
      if (!session) return;
      const body = parseJson(await readRawBody(request));
      const messages = appRepository.createAnnouncement({
        senderUserId: session.userId,
        subject: body.subject,
        body: body.body,
        relatedEntityType: body.relatedEntityType || body.related_entity_type || "general",
        relatedEntityId: body.relatedEntityId || body.related_entity_id || ""
      });
      appRepository.appendAuditEvent({
        actorUserId: session.userId,
        actorRole: session.role,
        action: "announcement_sent",
        entityType: "message",
        ipAddress: getIpAddress(request),
        metadata: { count: messages.length, subject: body.subject }
      });
      return send(response, 201, { items: messages });
    }

    if (request.method === "GET" && url.pathname === "/api/disputes") {
      const session = requireRequestRole(request, response, [ROLES.ADMIN, ROLES.SUPPORT]);
      if (!session) return;
      recordAuditEvent({ request, session, action: "dispute_viewed", entityType: "dispute", entityId: "list" });
      return send(response, 200, { items: appRepository.listDisputes({ userId: session.userId, role: session.role }) });
    }

    if (request.method === "POST" && url.pathname === "/api/disputes") {
      const session = requireRequestRole(request, response, [ROLES.ADMIN, ROLES.SUPPORT]);
      if (!session) return;
      const body = parseJson(await readRawBody(request));
      const dispute = appRepository.createDispute({
        ...body,
        actorUserId: session.userId,
        actorRole: session.role
      });
      recordAuditEvent({ request, session, action: "dispute_opened", entityType: "dispute", entityId: dispute.id });
      return send(response, 201, dispute);
    }

    const disputeActionMatch = url.pathname.match(/^\/api\/disputes\/([^/]+)(?:\/([^/]+))?$/);
    if (disputeActionMatch && request.method === "GET" && !disputeActionMatch[2]) {
      const session = requireRequestRole(request, response, [ROLES.ADMIN, ROLES.SUPPORT, ROLES.BUYER, ROLES.SELLER]);
      if (!session) return;
      try {
        const dispute = appRepository.getDispute(disputeActionMatch[1], { userId: session.userId, role: session.role });
        if (!dispute) return sendError(response, 404, "Dispute not found");
        recordAuditEvent({ request, session, action: "dispute_viewed", entityType: "dispute", entityId: dispute.id });
        return send(response, 200, dispute);
      } catch (error) {
        recordAuditEvent({ request, session, action: "unauthorized_dispute_access_rejected", entityType: "dispute", entityId: disputeActionMatch[1], metadata: { reason: error.message } });
        return sendError(response, 403, error.message);
      }
    }

    if (disputeActionMatch && request.method === "PATCH" && disputeActionMatch[2] === "status") {
      const session = requireRequestRole(request, response, [ROLES.ADMIN, ROLES.SUPPORT]);
      if (!session) return;
      const body = parseJson(await readRawBody(request));
      const dispute = appRepository.updateDisputeStatus({
        disputeId: disputeActionMatch[1],
        status: body.status,
        actorUserId: session.userId,
        actorRole: session.role,
        message: body.message || ""
      });
      recordAuditEvent({ request, session, action: "dispute_status_changed", entityType: "dispute", entityId: dispute.id, metadata: { status: dispute.status } });
      return send(response, 200, dispute);
    }

    if (disputeActionMatch && request.method === "POST" && disputeActionMatch[2]) {
      const session = requireRequestRole(request, response, [ROLES.ADMIN, ROLES.SUPPORT]);
      if (!session) return;
      const disputeId = disputeActionMatch[1];
      const action = disputeActionMatch[2];
      const body = parseJson(await readRawBody(request));

      if (action === "evidence") {
        const evidence = appRepository.addDisputeEvidence({
          disputeId,
          uploadedByUserId: session.userId,
          uploadedByRole: session.role,
          evidenceType: body.evidenceType || body.evidence_type || "other",
          title: body.title,
          description: body.description,
          fileUrlOrPlaceholder: body.fileUrlOrPlaceholder || body.file_url_or_placeholder || ""
        });
        recordAuditEvent({ request, session, action: "dispute_evidence_added", entityType: "dispute", entityId: disputeId, metadata: { evidence_id: evidence.id } });
        return send(response, 201, evidence);
      }

      if (action === "message") {
        const dispute = appRepository.getDispute(disputeId, { userId: session.userId, role: session.role });
        if (!dispute) return sendError(response, 404, "Dispute not found");
        const recipientUserId = body.recipientUserId || body.recipient_user_id || (body.recipientRole === "seller" ? dispute.seller_user_id : dispute.buyer_user_id);
        const message = appRepository.createMessage({
          senderUserId: session.userId,
          recipientUserId,
          subject: body.subject || "Dispute update",
          body: body.body,
          relatedEntityType: RELATED_ENTITY_TYPES.DISPUTE,
          relatedEntityId: dispute.id
        });
        appRepository.addDisputeTimeline({ disputeId, actorUserId: session.userId, actorRole: session.role, action: "dispute_message_sent", message: message.subject });
        recordAuditEvent({ request, session, action: "dispute_message_sent", entityType: "dispute", entityId: dispute.id, metadata: { message_id: message.id } });
        return send(response, 201, message);
      }

      if (action === "request-evidence") {
        const dispute = appRepository.requestDisputeEvidence({
          disputeId,
          actorUserId: session.userId,
          actorRole: session.role,
          requiredFrom: body.requiredFrom || body.required_from
        });
        recordAuditEvent({ request, session, action: "dispute_evidence_requested", entityType: "dispute", entityId: dispute.id, metadata: { required_from: dispute.evidence_required_from } });
        return send(response, 200, dispute);
      }

      if (action === "admin-note") {
        const dispute = appRepository.addDisputeAdminNote({
          disputeId,
          actorUserId: session.userId,
          actorRole: session.role,
          note: body.note
        });
        recordAuditEvent({ request, session, action: "dispute_admin_note_added", entityType: "dispute", entityId: dispute.id });
        return send(response, 200, dispute);
      }

      if (action === "escalate") {
        const dispute = appRepository.updateDisputeStatus({
          disputeId,
          status: DISPUTE_STATUS.ESCALATED,
          actorUserId: session.userId,
          actorRole: session.role,
          message: body.message || "Dispute escalated"
        });
        recordAuditEvent({ request, session, action: "dispute_escalated", entityType: "dispute", entityId: dispute.id });
        return send(response, 200, dispute);
      }

      if (action === "close") {
        const dispute = appRepository.updateDisputeStatus({
          disputeId,
          status: DISPUTE_STATUS.CLOSED,
          actorUserId: session.userId,
          actorRole: session.role,
          message: body.message || "Dispute closed"
        });
        recordAuditEvent({ request, session, action: "dispute_closed", entityType: "dispute", entityId: dispute.id });
        return send(response, 200, dispute);
      }

      if (["refund", "release", "partial-refund"].includes(action)) {
        const resolutionType = action === "partial-refund" ? "partial_refund" : action;
        const result = appRepository.resolveDispute({
          disputeId,
          resolutionType,
          actorUserId: session.userId,
          actorRole: session.role,
          idempotencyKey: request.headers["idempotency-key"],
          amount: body.amount
        });
        const auditAction = result.reused
          ? "duplicate_dispute_resolution_rejected"
          : resolutionType === "refund"
            ? "dispute_refund_issued"
            : resolutionType === "release"
              ? "dispute_escrow_released"
              : "dispute_partial_refund_issued";
        recordAuditEvent({ request, session, action: auditAction, entityType: "dispute", entityId: result.dispute.id, metadata: { reused: result.reused, resolution_type: result.dispute.resolution_type } });
        return send(response, 200, result.dispute);
      }
    }

    if (request.method === "GET" && url.pathname === "/api/my/disputes") {
      const session = requireRequestRole(request, response, [ROLES.BUYER, ROLES.SELLER]);
      if (!session) return;
      return send(response, 200, { items: appRepository.listDisputes({ userId: session.userId, role: session.role }) });
    }

    if (request.method === "POST" && url.pathname === "/api/auth/login") {
      const rawBody = await readRawBody(request);
      const body = parseRequestBody(rawBody, request);
      const usernameMatches = body.username === config.adminUsername || body.email === config.adminUsername;
      const passwordMatches = verifyPasswordHash({ password: body.password, passwordHash: config.adminPasswordHash });
      const verified = usernameMatches && passwordMatches;

      appRepository.appendAuditEvent({
        actorUserId: verified ? "usr_admin" : null,
        actorRole: verified ? ROLES.ADMIN : null,
        action: verified ? "admin_login_succeeded" : "admin_login_failed",
        entityType: "admin_session",
        entityId: config.adminUsername,
        ipAddress: getIpAddress(request)
      });

      appendAuditEvent({
        actorType: "admin",
        actorId: body.username || body.email || null,
        action: verified ? "admin_login_succeeded" : "admin_login_failed",
        subjectType: "admin_session"
      });

      if (!verified) {
        return sendError(response, 401, "Invalid admin username or password");
      }

      const adminUser = appRepository.findUserByEmail(config.adminUsername) || appRepository.findUserByEmail(config.adminEmail);
      if (!adminUser || adminUser.role !== ROLES.ADMIN) {
        return sendError(response, 500, "Configured admin user is missing from the repository");
      }

      const sessionToken = createUserSessionToken({
        userId: adminUser.id,
        role: adminUser.role,
        email: adminUser.email,
        secret: config.adminSessionSecret
      });

      if ((request.headers["content-type"] || "").includes("application/x-www-form-urlencoded")) {
        response.writeHead(303, {
          "Location": `${config.appOrigin}/app`,
          "Set-Cookie": adminSessionCookie(sessionToken),
          "Access-Control-Allow-Origin": config.appOrigin,
          "Access-Control-Allow-Credentials": "true"
        });
        response.end();
        return;
      }

      return send(response, 200, {
        token: sessionToken,
        admin: { id: adminUser.id, email: adminUser.email, role: "Platform Admin" },
        expires_in_seconds: 28800
      }, { "Set-Cookie": adminSessionCookie(sessionToken) });
    }

    if (request.method === "POST" && url.pathname === "/api/auth/logout") {
      const session = getSession(request);
      appRepository.appendAuditEvent({
        actorUserId: session.ok ? session.userId : null,
        actorRole: session.ok ? session.role : null,
        action: "admin_logout",
        entityType: "admin_session",
        entityId: session.ok ? session.userId : null,
        ipAddress: getIpAddress(request)
      });
      return send(response, 200, { ok: true }, { "Set-Cookie": clearAdminSessionCookie() });
    }

    if (request.method === "GET" && url.pathname === "/api/auth/session") {
      const session = requireRequestRole(request, response, [ROLES.ADMIN]);
      if (!session) return;
      appRepository.appendAuditEvent({
        actorUserId: session.userId,
        actorRole: session.role,
        action: "admin.route_accessed",
        entityType: "admin_session",
        entityId: session.userId,
        ipAddress: getIpAddress(request)
      });
      return send(response, 200, {
        admin: { id: session.userId, email: session.email, role: "Platform Admin" },
        expires_at: new Date(session.expiresAt).toISOString()
      });
    }

    if (request.method === "POST" && url.pathname === "/api/v1/admin/login") {
      const body = parseJson(await readRawBody(request));
      const verified = verifyAdminCredentials({
        email: body.email,
        password: body.password,
        expectedEmail: config.adminEmail,
        expectedPassword: config.adminPassword
      });

      appendAuditEvent({
        actorType: "admin",
        actorId: body.email || null,
        action: verified ? "admin.login_succeeded" : "admin.login_failed",
        subjectType: "admin_session"
      });

      if (!verified) {
        return sendError(response, 401, "Invalid admin email or password");
      }

      const adminUser = appRepository.findUserByEmail(config.adminEmail);
      if (!adminUser || adminUser.role !== ROLES.ADMIN) {
        return sendError(response, 500, "Configured admin user is missing from the repository");
      }

      const sessionToken = createUserSessionToken({
        userId: adminUser.id,
        role: adminUser.role,
        email: adminUser.email,
        secret: config.sessionTokenSecret
      });
      const token = createAdminToken({ email: config.adminEmail, secret: config.adminTokenSecret });
      return send(response, 200, {
        token: sessionToken,
        legacy_admin_token: token,
        admin: { id: adminUser.id, email: config.adminEmail, role: "Platform Admin" },
        expires_in_seconds: 28800
      });
    }

    if (request.method === "GET" && url.pathname === "/api/v1/admin/session") {
      const session = requireRequestRole(request, response, [ROLES.ADMIN]);
      if (!session) return;

      appRepository.appendAuditEvent({
        actorUserId: session.userId,
        actorRole: session.role,
        action: "admin.route_accessed",
        entityType: "admin_session",
        entityId: session.userId,
        ipAddress: getIpAddress(request)
      });
      return send(response, 200, {
        admin: { email: session.email, role: "Platform Admin" },
        expires_at: new Date(session.expiresAt).toISOString()
      });
    }

    if (request.method === "GET" && url.pathname === "/api/v1/session") {
      const session = requireRequestRole(request, response, [ROLES.BUYER, ROLES.SELLER, ROLES.ADMIN, ROLES.SUPPORT]);
      if (!session) return;

      appRepository.appendAuditEvent({
        actorUserId: session.userId,
        actorRole: session.role,
        action: "session.accessed",
        entityType: "user",
        entityId: session.userId,
        ipAddress: getIpAddress(request)
      });

      return send(response, 200, {
        user: {
          id: session.user.id,
          email: session.user.email,
          display_name: session.user.display_name,
          role: session.user.role,
          status: session.user.status
        }
      });
    }

    if (request.method === "GET" && url.pathname === "/api/v1/wallet/summary") {
      const session = requireRequestRole(request, response, [ROLES.BUYER, ROLES.SELLER, ROLES.ADMIN, ROLES.SUPPORT]);
      if (!session) return;

      return send(response, 200, appRepository.getWalletSummary(session.userId, url.searchParams.get("currency") || "USDT"));
    }

    if (request.method === "GET" && url.pathname === "/api/v1/wallet/ledger") {
      const session = requireRequestRole(request, response, [ROLES.BUYER, ROLES.SELLER, ROLES.ADMIN, ROLES.SUPPORT]);
      if (!session) return;

      return send(response, 200, { items: appRepository.listLedgerEntries(session.userId, url.searchParams.get("currency") || "USDT") });
    }

    if (request.method === "POST" && url.pathname === "/api/v1/sandbox/deposits") {
      const session = requireRequestRole(request, response, [ROLES.BUYER, ROLES.SELLER]);
      if (!session) return;

      const body = parseJson(await readRawBody(request));
      const result = appRepository.createDeposit({
        userId: session.userId,
        amount: body.amount,
        currency: body.currency || "USDT",
        idempotencyKey: request.headers["idempotency-key"]
      });
      appRepository.appendAuditEvent({
        actorUserId: session.userId,
        actorRole: session.role,
        action: result.reused ? "deposit.idempotency_reused" : "deposit.created",
        entityType: "deposit",
        entityId: result.deposit.id,
        ipAddress: getIpAddress(request),
        metadata: { amount: result.deposit.amount, currency: result.deposit.currency, status: result.deposit.status }
      });
      return send(response, result.reused ? 200 : 201, result.deposit);
    }

    if (request.method === "POST" && url.pathname === "/api/v1/sandbox/deposits/confirm") {
      const session = requireRequestRole(request, response, [ROLES.ADMIN, ROLES.SUPPORT]);
      if (!session) return;

      const body = parseJson(await readRawBody(request));
      const result = appRepository.confirmDeposit({
        depositId: body.deposit_id,
        webhookIdempotencyKey: request.headers["idempotency-key"]
      });
      appRepository.appendAuditEvent({
        actorUserId: session.userId,
        actorRole: session.role,
        action: result.reused ? "deposit.confirmation_reused" : "deposit.confirmed",
        entityType: "deposit",
        entityId: result.deposit.id,
        ipAddress: getIpAddress(request),
        metadata: { status: result.deposit.status }
      });
      if (!result.reused) {
        appRepository.appendAuditEvent({
          actorUserId: session.userId,
          actorRole: session.role,
          action: "wallet.credited",
          entityType: "wallet",
          entityId: result.deposit.user_id,
          ipAddress: getIpAddress(request),
          metadata: { deposit_id: result.deposit.id, amount: result.deposit.amount, currency: result.deposit.currency }
        });
      }
      return send(response, 200, result.deposit);
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
      const session = requireRequestRole(request, response, [ROLES.ADMIN]);
      if (!session) return;

      appRepository.appendAuditEvent({
        actorUserId: session.userId,
        actorRole: session.role,
        action: "admin.route_accessed",
        entityType: "audit_events",
        ipAddress: getIpAddress(request)
      });
      return send(response, 200, { items: [...listAuditEvents(), ...appRepository.listAuditEvents()] });
    }

    if (request.method === "GET" && url.pathname === "/api/v1/admin/review-queue") {
      const session = requireRequestRole(request, response, [ROLES.ADMIN]);
      if (!session) return;

      appRepository.appendAuditEvent({
        actorUserId: session.userId,
        actorRole: session.role,
        action: "admin.route_accessed",
        entityType: "admin_reviews",
        ipAddress: getIpAddress(request)
      });
      return send(response, 200, { items: appRepository.listAdminReviews() });
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
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const port = config.port;
  const server = createAgentPayServer();
  server.listen(port, () => {
    process.stdout.write(`AgentPay backend service listening on ${port}\n`);
  });
}
