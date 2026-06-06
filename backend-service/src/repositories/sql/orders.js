export const selectOrderById = `
  select
    id,
    listing_id,
    buyer_user_id,
    buyer_agent_id,
    merchant_profile_id,
    amount::text as amount,
    currency,
    status,
    idempotency_key,
    request_payload,
    created_at
  from orders
  where id = $1
  limit 1
`;

export const selectOrderByIdempotency = `
  select
    id,
    listing_id,
    buyer_user_id,
    buyer_agent_id,
    merchant_profile_id,
    amount::text as amount,
    currency,
    status,
    idempotency_key,
    request_payload,
    created_at
  from orders
  where buyer_user_id = $1
    and idempotency_key = $2
  limit 1
`;

export const insertOrder = `
  insert into orders (
    listing_id,
    buyer_user_id,
    buyer_agent_id,
    merchant_profile_id,
    amount,
    currency,
    status,
    idempotency_key,
    request_payload
  )
  values ($1, $2, $3, $4, $5::money_amount, $6, 'created', $7, $8::jsonb)
  returning
    id,
    listing_id,
    buyer_user_id,
    buyer_agent_id,
    merchant_profile_id,
    amount::text as amount,
    currency,
    status,
    idempotency_key,
    request_payload,
    created_at
`;

export const updateOrderStatus = `
  update orders
  set status = $2,
      delivered_at = case when $2 = 'delivered' then now() else delivered_at end,
      released_at = case when $2 = 'released' then now() else released_at end
  where id = $1
  returning
    id,
    listing_id,
    buyer_user_id,
    buyer_agent_id,
    merchant_profile_id,
    amount::text as amount,
    currency,
    status,
    idempotency_key,
    request_payload,
    created_at
`;
