const pages = document.querySelectorAll("[data-page]");
const navButtons = document.querySelectorAll("[data-view]");
const modal = document.querySelector("[data-modal]");

const agents = [
  { name: "ProcureBot Alpha", role: "Buyer", status: "Active", spend: "$128.40", limit: "$500/day", risk: "Low" },
  { name: "DataSmith Merchant", role: "Merchant", status: "Active", spend: "$0.00", limit: "$250/day", risk: "Low" },
  { name: "CopyAudit Agent", role: "Buyer/Merchant", status: "Paused", spend: "$258.00", limit: "$300/day", risk: "Review" }
];

const activities = [
  ["Escrow locked", "AP-ORD-1048", "$48.00 USDT"],
  ["Listing submitted", "API integration review", "Pending"],
  ["Deposit reconciled", "Funding session BP-9021", "+$500.00"],
  ["Agent paused", "CopyAudit Agent daily threshold", "Admin"]
];

const ledger = [
  ["Deposit credit", "Verified funding webhook", "+500.00 USDT"],
  ["Escrow debit", "Order AP-ORD-1048 locked", "-48.00 USDT"],
  ["Merchant settlement", "Order AP-ORD-1039 released", "-120.00 USDT"],
  ["Fee reserve", "Platform fee for AP-ORD-1039", "-4.80 USDT"]
];

const listings = [
  {
    id: "lst_agentpay_corporate",
    mongoId: "mongo_lst_agentpay_corporate",
    schemaId: "agentpay.listing.agentpay-corporate-deployment.v1",
    category: "Enterprise Deployment",
    title: "AgentPay Enterprise Node Deployment Package",
    description: "Verified AgentPay Corporate archive with buyer-agent intake schema and launch-control delivery proof.",
    priceAmount: "5000.000000000000000000",
    currency: "USDT",
    schemaUrl: "/api/v1/listings/agentpay-corporate/schema"
  },
  {
    id: "lst_api_review",
    mongoId: "mongo_lst_api_review",
    schemaId: "agentpay.listing.api-integration-review.v1",
    category: "Development",
    title: "API integration review",
    description: "Endpoint contract, webhook, auth, and error-state review.",
    priceAmount: "48.000000000000000000",
    currency: "USDT"
  },
  {
    id: "lst_dataset_cleanup",
    mongoId: "mongo_lst_dataset_cleanup",
    schemaId: "agentpay.listing.dataset-cleanup-task.v1",
    category: "Data",
    title: "Dataset cleanup task",
    description: "CSV repair, dedupe, field normalization, and proof report.",
    priceAmount: "32.000000000000000000",
    currency: "USDT"
  },
  {
    id: "lst_copy_audit",
    mongoId: "mongo_lst_copy_audit",
    schemaId: "agentpay.listing.landing-page-copy-audit.v1",
    category: "Creative",
    title: "Landing page copy audit",
    description: "Conversion critique and rewritten sales sections.",
    priceAmount: "25.000000000000000000",
    currency: "USDT"
  },
  {
    id: "lst_webhook_tester",
    mongoId: "mongo_lst_webhook_tester",
    schemaId: "agentpay.listing.webhook-tester-run.v1",
    category: "Development",
    title: "Webhook tester run",
    description: "Signed callback simulation and reconciliation report.",
    priceAmount: "64.000000000000000000",
    currency: "USDT"
  }
];

const sellerOrders = [
  ["AP-ORD-1048", "Delivery review", "$48.00"],
  ["AP-ORD-1041", "In progress", "$32.00"],
  ["AP-ORD-1039", "Released", "$120.00"]
];

const reviews = [
  ["KYC tier upgrade", "User requests higher daily limit", "High"],
  ["Listing approval", "API integration review", "Normal"],
  ["Dispute", "Buyer rejected delivery proof", "High"],
  ["Webhook mismatch", "Deposit amount differs from order", "High"]
];

const apiKeys = [
  ["ProcureBot Alpha", "payments:create, listings:read", "Live"],
  ["DataSmith Merchant", "orders:update, deliveries:create", "Live"],
  ["CopyAudit Agent", "payments:create", "Paused"]
];

function pillClass(value) {
  if (["High", "Review", "Paused"].includes(value)) return "pill danger";
  if (["Pending", "Normal", "Delivery review", "In progress"].includes(value)) return "pill warn";
  return "pill";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
}

function html(strings, ...values) {
  return strings.reduce((result, part, index) => {
    const value = index < values.length ? escapeHtml(values[index]) : "";
    return `${result}${part}${value}`;
  }, "");
}

function renderList(selector, rows, template) {
  const container = document.querySelector(selector);
  if (!container) return;
  container.innerHTML = rows.map(template).join("");
}

function renderAgents() {
  renderList("[data-agent-table]", agents, (agent) => html`
    <div class="row-item">
      <div><strong>${agent.name}</strong><small>${agent.role} · ${agent.spend} spent · ${agent.limit}</small></div>
      <span class="${pillClass(agent.status)}">${agent.status}</span>
    </div>
  `);

  renderList("[data-agent-cards]", agents, (agent) => html`
    <article class="agent-card">
      <span class="${pillClass(agent.status)}">${agent.status}</span>
      <h3>${agent.name}</h3>
      <p>${agent.role} agent with ${agent.limit} policy and ${agent.risk.toLowerCase()} risk state.</p>
      <div class="card-footer"><strong>${agent.spend}</strong><button class="quiet-button" type="button">Edit Limits</button></div>
    </article>
  `);
}

function renderListings(items = listings) {
  renderList("[data-listings]", items, (listing) => html`
    <article class="listing-card" data-listing-id="${listing.id}" data-mongo-id="${listing.mongoId}" data-schema-id="${listing.schemaId}">
      <span class="pill">${listing.category}</span>
      <h3>${listing.title}</h3>
      <p>${listing.description}</p>
      <small>${listing.schemaId}</small>
      <div class="card-footer"><strong>${Number(listing.priceAmount).toFixed(0)} ${listing.currency}</strong><button class="primary-button" type="button" data-buy-listing="${listing.id}">Buy with Escrow</button></div>
      <button class="quiet-button full" type="button" data-schema-url="${listing.schemaUrl || ""}">${listing.schemaUrl ? "View Schema" : "Schema Pending"}</button>
    </article>
  `);
}

function renderStaticLists() {
  renderList("[data-activity-feed]", activities, ([title, detail, value]) => html`
    <div class="activity-item"><div><strong>${title}</strong><small>${detail}</small></div><span class="${pillClass(value)}">${value}</span></div>
  `);

  renderList("[data-ledger-list]", ledger, ([title, detail, value]) => html`
    <div class="ledger-item"><div><strong>${title}</strong><small>${detail}</small></div><strong>${value}</strong></div>
  `);

  renderList("[data-seller-orders]", sellerOrders, ([id, status, value]) => html`
    <div class="order-item"><div><strong>${id}</strong><small>${status}</small></div><strong>${value}</strong></div>
  `);

  renderList("[data-review-list]", reviews, ([title, detail, priority]) => html`
    <div class="review-item"><div><strong>${title}</strong><small>${detail}</small></div><span class="${pillClass(priority)}">${priority}</span></div>
  `);

  renderList("[data-api-keys]", apiKeys, ([agent, scopes, status]) => html`
    <div class="api-key-item"><div><strong>${agent}</strong><small>${scopes}</small></div><span class="${pillClass(status)}">${status}</span></div>
  `);

  renderList("[data-escrow-orders]", sellerOrders, ([id, status, value]) => html`
    <article class="escrow-card">
      <span class="${pillClass(status)}">${status}</span>
      <h3>${id}</h3>
      <p>Escrow-backed digital service order with audit trail and admin resolution path.</p>
      <div class="card-footer"><strong>${value}</strong><button class="quiet-button" type="button">Open</button></div>
    </article>
  `);
}

function activateView(target) {
  const selected = document.querySelector(`[data-view="${target}"]`);
  if (!selected) return;
  navButtons.forEach((item) => item.classList.toggle("active", item === selected));
  pages.forEach((page) => page.classList.toggle("active", page.dataset.page === target));
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activateView(button.dataset.view);
  });
});

document.querySelectorAll("[data-jump-view]").forEach((button) => {
  button.addEventListener("click", () => {
    activateView(button.dataset.jumpView);
  });
});

document.querySelector("[data-search]")?.addEventListener("input", updateMarketplace);
document.querySelector("[data-category]")?.addEventListener("change", updateMarketplace);

function updateMarketplace() {
  const search = document.querySelector("[data-search]")?.value.toLowerCase() || "";
  const category = document.querySelector("[data-category]")?.value || "all";
  const filtered = listings.filter((listing) => {
    const matchesSearch = `${listing.title} ${listing.description} ${listing.schemaId}`.toLowerCase().includes(search);
    const matchesCategory = category === "all" || listing.category === category;
    return matchesSearch && matchesCategory;
  });
  renderListings(filtered);
}

document.querySelector("[data-publish-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const note = document.querySelector("[data-publish-note]");
  if (note) {
    note.textContent = "Listing submitted to the admin review queue.";
    note.classList.add("success");
  }
});

document.querySelector("[data-wallet-action]")?.addEventListener("click", () => {
  alert("Sandbox funding session generated. Production connects this action to the approved payment rail.");
});

document.querySelectorAll("[data-sandbox-wallet]").forEach((button) => {
  button.addEventListener("click", () => {
    const balance = document.querySelector("[data-sandbox-balance]");
    const escrow = document.querySelector("[data-sandbox-escrow]");
    if (balance) balance.textContent = "6,000 testUSDT";
    if (escrow) escrow.textContent = "0 testUSDT";
    alert("Sandbox test wallet funded with demo testnet balance. No live assets moved.");
  });
});

document.addEventListener("click", (event) => {
  const schemaButton = event.target.closest("[data-schema-url]");
  if (schemaButton) {
    if (!schemaButton.dataset.schemaUrl) {
      alert("Schema route pending for this marketplace listing.");
      return;
    }
    alert(`Public schema route: ${schemaButton.dataset.schemaUrl}`);
  }

  const buyButton = event.target.closest("[data-buy-listing]");
  if (buyButton) {
    alert("Sandbox order prepared. Escrow lock and archive delivery proof are available in the backend starter; live USDT requires deployment approval.");
  }
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => modal?.showModal());
});

renderAgents();
renderListings();
renderStaticLists();

const requestedView = new URLSearchParams(window.location.search).get("view") || window.location.hash.replace("#", "");
if (requestedView) {
  activateView(requestedView);
}
