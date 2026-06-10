-- AgentPay visible marketplace seed
-- Target: PostgreSQL 15+
-- Purpose: seed the four visible console listings with strict decimal money values.

begin;

insert into users (id, email, display_name, password_hash, kyc_tier, status)
values (
  '00000000-0000-4000-8000-000000000001',
  'seed-merchant@agentpay.local',
  'AgentPay Seed Merchant',
  'seed-password-disabled',
  1,
  'active'
)
on conflict (email) do update
set display_name = excluded.display_name,
    kyc_tier = excluded.kyc_tier,
    status = excluded.status;

insert into merchant_profiles (id, user_id, business_name, bio, rating, completed_orders)
values (
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000001',
  'AgentPay Verified Services',
  'Seed merchant profile for visible digital-service marketplace cards.',
  4.90,
  24
)
on conflict (user_id) do update
set business_name = excluded.business_name,
    bio = excluded.bio,
    rating = excluded.rating,
    completed_orders = excluded.completed_orders;

insert into listings (
  id,
  merchant_profile_id,
  mongo_listing_id,
  public_slug,
  schema_id,
  price,
  currency,
  delivery_sla_hours,
  requirements_schema,
  status
)
values
(
  '00000000-0000-4000-8000-000000001001',
  '00000000-0000-4000-8000-000000000101',
  'mongo_lst_api_review',
  'api-integration-review',
  'agentpay.listing.api-integration-review.v1',
  '48.000000000000000000'::money_amount,
  'USDT',
  48,
  '{
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://zebepay.com/schemas/listings/api-integration-review.v1.json",
    "title": "API Integration Review Requirements",
    "type": "object",
    "additionalProperties": false,
    "required": ["repository_url", "api_base_url", "auth_type", "review_scope"],
    "properties": {
      "repository_url": { "type": "string", "format": "uri" },
      "api_base_url": { "type": "string", "format": "uri" },
      "auth_type": { "type": "string", "enum": ["bearer", "hmac", "oauth2", "api_key", "none"] },
      "review_scope": {
        "type": "array",
        "items": { "type": "string", "enum": ["endpoints", "webhooks", "errors", "security", "reconciliation"] },
        "minItems": 1,
        "uniqueItems": true
      },
      "notes": { "type": "string", "maxLength": 1000 }
    }
  }'::jsonb,
  'active'
),
(
  '00000000-0000-4000-8000-000000001002',
  '00000000-0000-4000-8000-000000000101',
  'mongo_lst_dataset_cleanup',
  'dataset-cleanup-task',
  'agentpay.listing.dataset-cleanup-task.v1',
  '32.000000000000000000'::money_amount,
  'USDT',
  24,
  '{
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://zebepay.com/schemas/listings/dataset-cleanup-task.v1.json",
    "title": "Dataset Cleanup Task Requirements",
    "type": "object",
    "additionalProperties": false,
    "required": ["file_url", "file_type", "cleanup_goals"],
    "properties": {
      "file_url": { "type": "string", "format": "uri" },
      "file_type": { "type": "string", "enum": ["csv", "xlsx", "json", "jsonl"] },
      "cleanup_goals": {
        "type": "array",
        "items": { "type": "string", "enum": ["dedupe", "normalize_fields", "repair_rows", "validate_types", "summary_report"] },
        "minItems": 1,
        "uniqueItems": true
      },
      "sensitive_data": { "type": "boolean", "default": false },
      "notes": { "type": "string", "maxLength": 1000 }
    }
  }'::jsonb,
  'active'
),
(
  '00000000-0000-4000-8000-000000001003',
  '00000000-0000-4000-8000-000000000101',
  'mongo_lst_copy_audit',
  'landing-page-copy-audit',
  'agentpay.listing.landing-page-copy-audit.v1',
  '25.000000000000000000'::money_amount,
  'USDT',
  24,
  '{
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://zebepay.com/schemas/listings/landing-page-copy-audit.v1.json",
    "title": "Landing Page Copy Audit Requirements",
    "type": "object",
    "additionalProperties": false,
    "required": ["page_url", "target_audience", "conversion_goal"],
    "properties": {
      "page_url": { "type": "string", "format": "uri" },
      "target_audience": { "type": "string", "minLength": 3, "maxLength": 160 },
      "conversion_goal": { "type": "string", "minLength": 3, "maxLength": 160 },
      "brand_notes": { "type": "string", "maxLength": 1000 }
    }
  }'::jsonb,
  'active'
),
(
  '00000000-0000-4000-8000-000000001004',
  '00000000-0000-4000-8000-000000000101',
  'mongo_lst_webhook_tester',
  'webhook-tester-run',
  'agentpay.listing.webhook-tester-run.v1',
  '64.000000000000000000'::money_amount,
  'USDT',
  24,
  '{
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://zebepay.com/schemas/listings/webhook-tester-run.v1.json",
    "title": "Webhook Tester Run Requirements",
    "type": "object",
    "additionalProperties": false,
    "required": ["callback_url", "signature_scheme", "event_types"],
    "properties": {
      "callback_url": { "type": "string", "format": "uri" },
      "signature_scheme": { "type": "string", "enum": ["hmac_sha256", "rsa_sha256", "none"] },
      "event_types": {
        "type": "array",
        "items": { "type": "string", "enum": ["payment.created", "payment.failed", "escrow.locked", "escrow.released"] },
        "minItems": 1,
        "uniqueItems": true
      },
      "expected_response_code": { "type": "integer", "minimum": 200, "maximum": 299, "default": 200 },
      "notes": { "type": "string", "maxLength": 1000 }
    }
  }'::jsonb,
  'active'
)
on conflict (public_slug) do update
set mongo_listing_id = excluded.mongo_listing_id,
    schema_id = excluded.schema_id,
    price = excluded.price,
    currency = excluded.currency,
    delivery_sla_hours = excluded.delivery_sla_hours,
    requirements_schema = excluded.requirements_schema,
    status = excluded.status,
    updated_at = now();

commit;
