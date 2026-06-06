import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { normalizeMoneyString } from "./money.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadVisibleCatalog() {
  const catalogPath = join(__dirname, "..", "..", "backend", "listing-catalog.json");
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));

  return catalog.listings.map((listing) => ({
    id: listing.public_slug,
    mongo_listing_id: listing.mongo_listing_id,
    schema_id: listing.schema_id,
    title: listing.mongo_discovery.title,
    category: listing.mongo_discovery.category,
    description: listing.mongo_discovery.description,
    public_slug: listing.public_slug,
    price: normalizeMoneyString(listing.postgres_price_amount, "postgres_price_amount"),
    currency: listing.currency,
    requirements_schema_url: `/api/v1/listings/${listing.public_slug}/schema`,
    requirements_schema_file: `/backend/${listing.schema_file.replace("./", "")}`,
    delivery_artifact: listing.delivery_artifact || null
  }));
}

export async function loadListingRequirementSchema(schemaFile) {
  const schemaPath = join(__dirname, "..", "..", "backend", schemaFile.replace("./", ""));
  return JSON.parse(await readFile(schemaPath, "utf8"));
}
