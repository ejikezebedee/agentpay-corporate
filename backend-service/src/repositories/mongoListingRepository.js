export class MongoListingRepository {
  constructor({ database, collectionName = "listings" }) {
    this.collection = database.collection(collectionName);
  }

  async searchListings({ query, category, limit = 20 }) {
    const filter = { status: "active" };
    if (category) {
      filter.category = category;
    }
    if (query) {
      filter.$text = { $search: query };
    }

    return this.collection
      .find(filter, {
        projection: {
          _id: 0,
          mongo_listing_id: 1,
          public_slug: 1,
          title: 1,
          category: 1,
          description: 1,
          merchant_summary: 1,
          search_terms: 1
        }
      })
      .limit(limit)
      .toArray();
  }

  async getListingDiscoveryDocument(mongoListingId) {
    return this.collection.findOne(
      { mongo_listing_id: mongoListingId, status: "active" },
      { projection: { _id: 0 } }
    );
  }
}
