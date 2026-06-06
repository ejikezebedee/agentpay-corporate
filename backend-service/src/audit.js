import { randomUUID } from "node:crypto";

const events = [];

export function appendAuditEvent({ actorType, actorId, action, subjectType, subjectId, metadata = {} }) {
  const event = {
    id: cryptoRandomId(),
    actor_type: actorType,
    actor_id: actorId || null,
    action,
    subject_type: subjectType,
    subject_id: subjectId || null,
    metadata,
    created_at: new Date().toISOString()
  };

  events.push(event);
  return event;
}

export function listAuditEvents() {
  return [...events];
}

function cryptoRandomId() {
  return randomUUID();
}
