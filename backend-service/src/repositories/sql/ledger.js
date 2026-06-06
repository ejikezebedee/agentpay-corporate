export const insertLedgerEntry = `
  insert into ledger_entries (
    wallet_id,
    order_id,
    entry_type,
    debit,
    credit,
    currency,
    reference
  )
  values ($1, $2, $3, $4::money_amount, $5::money_amount, $6, $7)
  returning
    id,
    wallet_id,
    order_id,
    entry_type,
    debit::text as debit,
    credit::text as credit,
    currency,
    reference,
    created_at
`;

export const insertAuditLog = `
  insert into audit_logs (
    actor_type,
    actor_id,
    action,
    subject_type,
    subject_id,
    ip_hash,
    metadata
  )
  values ($1, $2, $3, $4, $5, $6, $7::jsonb)
  returning id, created_at
`;
