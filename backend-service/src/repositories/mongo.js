export class MongoListingRepositoryContract {
  async searchListings() {
    throw new Error("Connect MongoDB listing discovery repository before production use");
  }

  async getListingDiscoveryDocument() {
    throw new Error("Connect MongoDB listing discovery repository before production use");
  }
}
