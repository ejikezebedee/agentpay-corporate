export class PostgresRepositoryContract {
  async createUser() {
    throw new Error("Connect PostgreSQL users repository before production use");
  }

  async getWalletByUserAndCurrency() {
    throw new Error("Connect PostgreSQL wallet repository before production use");
  }

  async createOrderWithEscrowLock() {
    throw new Error("Connect PostgreSQL transaction-safe escrow repository before production use");
  }

  async appendLedgerEntry() {
    throw new Error("Connect PostgreSQL ledger repository before production use");
  }

  async appendAuditLog() {
    throw new Error("Connect PostgreSQL audit repository before production use");
  }
}
