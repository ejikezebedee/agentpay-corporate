export const selectActiveListingBySlug = `
  select
    l.id,
    l.merchant_profile_id,
    l.mongo_listing_id,
    l.public_slug,
    l.schema_id,
    l.price::text as price,
    l.currency,
    l.requirements_schema,
    l.status
  from listings l
  where l.public_slug = $1
    and l.status = 'active'
  limit 1
`;

export const selectActiveListings = `
  select
    l.id,
    l.mongo_listing_id,
    l.public_slug,
    l.schema_id,
    l.price::text as price,
    l.currency,
    l.requirements_schema,
    l.status
  from listings l
  where l.status = 'active'
  order by l.created_at desc
`;
