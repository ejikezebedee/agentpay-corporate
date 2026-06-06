export const selectWalletForUpdate = `
  select
    id,
    user_id,
    currency,
    available_balance::text as available_balance,
    escrow_balance::text as escrow_balance,
    fee_reserved_balance::text as fee_reserved_balance
  from wallets
  where user_id = $1
    and currency = $2
  for update
`;

export const lockEscrowBalances = `
  update wallets
  set available_balance = available_balance - $3::money_amount,
      escrow_balance = escrow_balance + $3::money_amount
  where user_id = $1
    and currency = $2
    and available_balance >= $3::money_amount
  returning
    id,
    available_balance::text as available_balance,
    escrow_balance::text as escrow_balance
`;

export const releaseEscrowBalances = `
  update wallets
  set escrow_balance = escrow_balance - $3::money_amount
  where user_id = $1
    and currency = $2
    and escrow_balance >= $3::money_amount
  returning
    id,
    available_balance::text as available_balance,
    escrow_balance::text as escrow_balance
`;

export const refundEscrowBalances = `
  update wallets
  set available_balance = available_balance + $3::money_amount,
      escrow_balance = escrow_balance - $3::money_amount
  where user_id = $1
    and currency = $2
    and escrow_balance >= $3::money_amount
  returning
    id,
    available_balance::text as available_balance,
    escrow_balance::text as escrow_balance
`;
