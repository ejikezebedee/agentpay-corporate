const pages = document.querySelectorAll("[data-page]");
const navButtons = document.querySelectorAll("[data-view]");
const mobileMenuToggle = document.querySelector("[data-mobile-menu-toggle]");
const sidebarScrim = document.querySelector("[data-sidebar-scrim]");
const modal = document.querySelector("[data-modal]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalBody = document.querySelector("[data-modal-body]");
const modalDetails = document.querySelector("[data-modal-details]");
const adminLoginPanel = document.querySelector("[data-admin-login-panel]");
const adminWorkspace = document.querySelector("[data-admin-workspace]");
const adminLoginForm = document.querySelector("[data-admin-login-form]");
const adminLoginNote = document.querySelector("[data-admin-login-note]");
const adminStatus = document.querySelector("[data-admin-status]");
const adminLogout = document.querySelector("[data-admin-logout]");
const auditEvents = document.querySelector("[data-audit-events]");
const productTable = document.querySelector("[data-product-table]");
const productCount = document.querySelector("[data-product-count]");
const productFormPanel = document.querySelector("[data-product-form-panel]");
const productForm = document.querySelector("[data-product-form]");
const productFormTitle = document.querySelector("[data-product-form-title]");
const productNote = document.querySelector("[data-product-note]");
const listingSummary = document.querySelector("[data-listing-summary]");
const productSearch = document.querySelector("[data-product-search]");
const productCategory = document.querySelector("[data-product-category]");
const productStatus = document.querySelector("[data-product-status]");
const productTypeFilter = document.querySelector("[data-product-type]");
const productDiscounted = document.querySelector("[data-product-discounted]");
const disputeSummary = document.querySelector("[data-dispute-summary]");
const disputeTable = document.querySelector("[data-dispute-table]");
const disputeCount = document.querySelector("[data-dispute-count]");
const disputeTitle = document.querySelector("[data-dispute-title]");
const disputeStatus = document.querySelector("[data-dispute-status]");
const disputeDetail = document.querySelector("[data-dispute-detail]");
const disputeNote = document.querySelector("[data-dispute-note]");
const disputeMessageForm = document.querySelector("[data-dispute-message-form]");
const disputeNoteForm = document.querySelector("[data-dispute-note-form]");
const partialRefundAmount = document.querySelector("[data-partial-refund-amount]");
const userList = document.querySelector("[data-user-list]");
const userSearch = document.querySelector("[data-user-search]");
const messageStatus = document.querySelector("[data-message-status]");
const messageThread = document.querySelector("[data-message-thread]");
const messageThreadTitle = document.querySelector("[data-message-thread-title]");
const messageForm = document.querySelector("[data-message-form]");
const messageTemplate = document.querySelector("[data-message-template]");
const messageNote = document.querySelector("[data-message-note]");
const apiBase = `${window.location.protocol}//${window.location.hostname}:3000`;

let adminSession = JSON.parse(localStorage.getItem("agentpayAdminSession") || "null");
let editingProductId = null;
let selectedUserId = "usr_seller";
let disputes = [];
let selectedDisputeId = null;

function setMobileMenu(open) {
  document.body.classList.toggle("sidebar-open", open);
  mobileMenuToggle?.setAttribute("aria-expanded", String(open));
}

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

const productListings = [
  {
    id: "prod_digital_pack",
    title: "AgentPay Integration Pack",
    description: "Downloadable setup assets and implementation notes for a controlled AgentPay deployment.",
    category: "Development",
    productType: "digital",
    price: 149,
    discountType: "percentage",
    discountValue: 15,
    imageUrl: "",
    digitalFileUrl: "private://agentpay-integration-pack.zip",
    stockQuantity: 100,
    deliveryInstructions: "Private download becomes available after escrow delivery rules allow it.",
    status: "active",
    createdAt: "2026-06-06",
    updatedAt: "2026-06-10"
  },
  {
    id: "prod_service_review",
    title: "API Integration Review",
    description: "Seller reviews endpoint contracts, webhook handling, and authentication rules.",
    category: "Service",
    productType: "service",
    price: 48,
    discountType: "none",
    discountValue: 0,
    imageUrl: "",
    digitalFileUrl: "",
    stockQuantity: 0,
    deliveryInstructions: "Seller submits written review notes and delivery proof.",
    status: "pending_review",
    createdAt: "2026-06-05",
    updatedAt: "2026-06-10"
  },
  {
    id: "prod_shipping_kit",
    title: "Merchant Hardware Starter Kit",
    description: "Physical onboarding kit for merchants testing point-of-sale assisted agent commerce.",
    category: "Hardware",
    productType: "physical",
    price: 120,
    discountType: "fixed",
    discountValue: 20,
    imageUrl: "",
    digitalFileUrl: "",
    stockQuantity: 12,
    deliveryInstructions: "Requires tracking number and courier proof after shipping.",
    status: "draft",
    createdAt: "2026-06-05",
    updatedAt: "2026-06-10"
  }
];

const messageUsers = [
  { id: "usr_buyer", name: "Demo Buyer", email: "buyer@zebepay.test", role: "buyer" },
  { id: "usr_seller", name: "Demo Seller", email: "seller@zebepay.test", role: "seller" },
  { id: "usr_support", name: "Demo Support", email: "support@zebepay.test", role: "support" },
  { id: "usr_admin", name: "AgentPay Admin", email: "admin@zebepay.test", role: "admin" }
];

const messages = [
  {
    id: "msg_seed_1",
    threadId: "thr_seller",
    senderUserId: "usr_admin",
    recipientUserId: "usr_seller",
    recipientRole: "seller",
    relatedEntityType: "listing",
    relatedEntityId: "prod_digital_pack",
    subject: "Listing approved",
    body: "Your AgentPay Integration Pack is active in the backend listing dashboard.",
    status: "sent",
    createdAt: "2026-06-10 10:00",
    readAt: "",
    archivedAt: ""
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

function money(value) {
  return `$${Number(value).toFixed(2)}`;
}

function calculateFinalPrice(product) {
  const price = Number(product.price || 0);
  const discountValue = Number(product.discountValue || 0);

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Normal price must be greater than zero.");
  }

  if (!Number.isFinite(discountValue) || discountValue < 0) {
    throw new Error("Discount value cannot be negative.");
  }

  if (product.discountType === "fixed") {
    const finalPrice = price - discountValue;
    if (finalPrice <= 0) throw new Error("Fixed discount must leave a final price greater than zero.");
    return finalPrice;
  }

  if (product.discountType === "percentage") {
    if (discountValue < 1 || discountValue > 99) throw new Error("Percentage discount must be between 1 and 99.");
    const finalPrice = price - (price * discountValue / 100);
    if (finalPrice <= 0) throw new Error("Percentage discount must leave a final price greater than zero.");
    return finalPrice;
  }

  return price;
}

function statusClass(status) {
  if (["paused", "archived"].includes(status)) return "pill danger";
  if (["draft", "pending_review"].includes(status)) return "pill warn";
  return "pill";
}

function renderProductDashboard() {
  if (!productTable) return;
  const filteredProducts = filterProducts();
  const visibleProducts = filteredProducts.filter((product) => product.status !== "archived");
  renderListingSummary();
  renderCategoryOptions();
  if (productCount) productCount.textContent = `${filteredProducts.length} products`;

  productTable.innerHTML = `
    <div class="product-row header">
      <span>Product</span><span>Type</span><span>Price</span><span>Discount</span><span>Stock</span><span>Status</span><span>Actions</span>
    </div>
    ${filteredProducts.map((product) => {
      const finalPrice = calculateFinalPrice(product);
      const hasDiscount = finalPrice !== Number(product.price);
      const discountLabel = product.discountType === "percentage"
        ? `${product.discountValue}%`
        : product.discountType === "fixed"
          ? `${money(product.discountValue)} off`
          : "None";

      return html`
        <div class="product-row" data-product-id="${product.id}">
          <div data-label="Product"><strong>${product.title}</strong><small>${product.category} - Created ${product.createdAt} - Updated ${product.updatedAt || product.createdAt}</small></div>
          <span data-label="Type">${product.productType}</span>
          <span data-label="Price" class="price-stack"><small>${hasDiscount ? `Was ${money(product.price)}` : "No discount"}</small><strong>${money(finalPrice)}</strong></span>
          <span data-label="Discount">${discountLabel}</span>
          <span data-label="Stock">${product.productType === "physical" ? product.stockQuantity : product.status === "active" ? "Available" : "-"}</span>
          <span data-label="Status" class="${statusClass(product.status)}">${product.status}</span>
          <div class="row-actions" data-label="Actions">
            <button class="quiet-button" type="button" data-edit-product="${product.id}">Edit</button>
            <button class="quiet-button" type="button" data-toggle-product="${product.id}">${product.status === "paused" ? "Activate" : "Pause"}</button>
            <button class="quiet-button" type="button" data-discount-product="${product.id}">Add Discount</button>
            <button class="quiet-button" type="button" data-view-product="${product.id}">View Details</button>
            <button class="danger-button" type="button" data-delete-product="${product.id}">Delete</button>
          </div>
        </div>
      `;
    }).join("") || "<p class=\"form-note\">No products match the current filters.</p>"}
  `;
}

function filterProducts() {
  const search = productSearch?.value.toLowerCase() || "";
  const category = productCategory?.value || "all";
  const status = productStatus?.value || "all";
  const type = productTypeFilter?.value || "all";
  const discountedOnly = Boolean(productDiscounted?.checked);
  return productListings.filter((product) => {
    const finalPrice = calculateFinalPrice(product);
    return (!search || product.title.toLowerCase().includes(search))
      && (category === "all" || product.category === category)
      && (status === "all" || product.status === status)
      && (type === "all" || product.productType === type)
      && (!discountedOnly || finalPrice !== Number(product.price));
  });
}

function renderCategoryOptions() {
  if (!productCategory) return;
  const current = productCategory.value || "all";
  const categories = [...new Set(productListings.map((product) => product.category))].sort();
  productCategory.innerHTML = `<option value="all">All categories</option>${categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")}`;
  productCategory.value = categories.includes(current) ? current : "all";
}

function renderListingSummary() {
  if (!listingSummary) return;
  const activeProducts = productListings.filter((product) => product.status !== "archived");
  const discounted = productListings.filter((product) => calculateFinalPrice(product) !== Number(product.price));
  const inventoryValue = activeProducts.reduce((total, product) => total + calculateFinalPrice(product) * (product.productType === "physical" ? product.stockQuantity : 1), 0);
  const cards = [
    ["Total listings", productListings.length, "All statuses"],
    ["Active listings", productListings.filter((product) => product.status === "active").length, "Published"],
    ["Draft listings", productListings.filter((product) => product.status === "draft").length, "Work in progress"],
    ["Discounted listings", discounted.length, "Promotions"],
    ["Archived listings", productListings.filter((product) => product.status === "archived").length, "Soft-deleted"],
    ["Inventory value", money(inventoryValue), "Estimated"]
  ];
  listingSummary.innerHTML = cards.map(([label, value, note]) => html`
    <article><span>${label}</span><strong>${value}</strong><small>${note}</small></article>
  `).join("");
}

function isResolvedDispute(dispute) {
  return ["resolved_refund_buyer", "resolved_release_seller", "resolved_partial_refund", "rejected", "closed"].includes(dispute.status);
}

function renderDisputes() {
  if (!disputeTable) return;
  const openDisputes = disputes.filter((dispute) => !isResolvedDispute(dispute));
  const disputedValue = openDisputes.reduce((total, dispute) => total + Number(dispute.disputed_amount || 0), 0);
  const cards = [
    ["Open disputes", openDisputes.length, "Unresolved"],
    ["High priority", disputes.filter((dispute) => ["high", "critical"].includes(dispute.priority) && !isResolvedDispute(dispute)).length, "Needs attention"],
    ["Awaiting buyer", disputes.filter((dispute) => dispute.status === "awaiting_buyer_response").length, "Evidence"],
    ["Awaiting seller", disputes.filter((dispute) => dispute.status === "awaiting_seller_response").length, "Response"],
    ["Under review", disputes.filter((dispute) => dispute.status === "under_review").length, "Admin queue"],
    ["Resolved today", disputes.filter((dispute) => dispute.resolved_at?.slice(0, 10) === new Date().toISOString().slice(0, 10)).length, "Closed"],
    ["Disputed value", money(disputedValue), "Locked escrow"],
    ["Avg resolution", "TBD", "In-memory MVP"]
  ];
  if (disputeSummary) {
    disputeSummary.innerHTML = cards.map(([label, value, note]) => html`
      <article><span>${label}</span><strong>${value}</strong><small>${note}</small></article>
    `).join("");
  }
  if (disputeCount) disputeCount.textContent = `${disputes.length} cases`;

  disputeTable.innerHTML = `
    <div class="product-row dispute-row header">
      <span>Case</span><span>Order</span><span>Product</span><span>Amount</span><span>Priority</span><span>Status</span><span>Action</span>
    </div>
    ${disputes.map((dispute) => html`
      <div class="product-row dispute-row ${dispute.id === selectedDisputeId ? "selected" : ""}" data-dispute-id="${dispute.id}">
        <div data-label="Case"><strong>${dispute.id}</strong><small>${dispute.reason}</small></div>
        <span data-label="Order">${dispute.order_id || dispute.escrow_order_id}</span>
        <span data-label="Product">${dispute.listing_title}</span>
        <span data-label="Amount">${money(dispute.disputed_amount)} ${dispute.currency}</span>
        <span data-label="Priority" class="${pillClass(dispute.priority === "critical" || dispute.priority === "high" ? "High" : "Normal")}">${dispute.priority}</span>
        <span data-label="Status" class="${statusClass(dispute.status)}">${dispute.status}</span>
        <button class="quiet-button" type="button" data-label="Action" data-open-dispute="${dispute.id}">View Case</button>
      </div>
    `).join("") || "<p class=\"form-note\">No disputes found.</p>"}
  `;
  renderDisputeDetail();
}

function renderDisputeDetail() {
  if (!disputeDetail) return;
  const dispute = disputes.find((item) => item.id === selectedDisputeId);
  if (!dispute) {
    disputeDetail.innerHTML = "<p class=\"form-note\">Open a dispute from the queue to inspect evidence, messages, audit history, and resolution options.</p>";
    if (disputeTitle) disputeTitle.textContent = "Open a dispute case";
    if (disputeStatus) disputeStatus.textContent = "Waiting";
    return;
  }
  if (disputeTitle) disputeTitle.textContent = `${dispute.id} - ${dispute.listing_title}`;
  if (disputeStatus) disputeStatus.textContent = dispute.status;
  const timeline = dispute.timeline || [];
  const evidence = dispute.evidence || [];
  disputeDetail.innerHTML = `
    <div class="detail-grid">
      <p><span>Buyer</span><strong>${escapeHtml(dispute.buyer_email)}</strong></p>
      <p><span>Seller</span><strong>${escapeHtml(dispute.seller_email)}</strong></p>
      <p><span>Escrow</span><strong>${escapeHtml(dispute.escrow_status)}</strong></p>
      <p><span>Amount</span><strong>${escapeHtml(money(dispute.disputed_amount))} ${escapeHtml(dispute.currency)}</strong></p>
      <p><span>Reason</span><strong>${escapeHtml(dispute.reason)}</strong></p>
      <p><span>Admin note</span><strong>${escapeHtml(dispute.admin_note || "None")}</strong></p>
    </div>
    <h3>Buyer claim</h3><p>${escapeHtml(dispute.buyer_claim || "No claim text yet.")}</p>
    <h3>Seller response</h3><p>${escapeHtml(dispute.seller_response || "No seller response yet.")}</p>
    <h3>Evidence</h3>
    ${evidence.map((item) => `<p class="timeline-item"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.evidence_type)} - ${escapeHtml(item.description)}</small></p>`).join("") || "<p class=\"form-note\">No evidence uploaded yet.</p>"}
    <h3>Audit timeline</h3>
    ${timeline.slice(-8).reverse().map((item) => `<p class="timeline-item"><strong>${escapeHtml(item.action)}</strong><small>${escapeHtml(item.message || item.created_at)}</small></p>`).join("") || "<p class=\"form-note\">No timeline entries yet.</p>"}
  `;
}

async function loadDisputes({ selectFirst = false } = {}) {
  if (!adminSession) return;
  if (disputeNote) {
    disputeNote.textContent = "Loading disputes...";
    disputeNote.classList.remove("error", "success");
  }
  const payload = await adminFetch("/api/disputes");
  disputes = payload.items;
  if (selectFirst && !selectedDisputeId && disputes[0]) selectedDisputeId = disputes[0].id;
  renderDisputes();
  if (disputeNote) disputeNote.textContent = "Disputes loaded from backend.";
}

async function reloadSelectedDispute() {
  if (!selectedDisputeId) return;
  const dispute = await adminFetch(`/api/disputes/${selectedDisputeId}`);
  const index = disputes.findIndex((item) => item.id === selectedDisputeId);
  if (index >= 0) disputes[index] = dispute;
  else disputes.unshift(dispute);
  renderDisputes();
}

function resetProductForm() {
  if (!productForm) return;
  editingProductId = null;
  productForm.reset();
  productForm.elements.id.value = "";
  productForm.elements.productType.value = "digital";
  productForm.elements.discountType.value = "none";
  productForm.elements.discountValue.value = "0";
  productForm.elements.stockQuantity.value = "0";
  productForm.elements.status.value = "draft";
  if (productFormTitle) productFormTitle.textContent = "Add New Product";
  updateFinalPricePreview();
}

function loadProductForm(product) {
  if (!productForm) return;
  editingProductId = product.id;
  productForm.elements.id.value = product.id;
  productForm.elements.title.value = product.title;
  productForm.elements.description.value = product.description;
  productForm.elements.category.value = product.category;
  productForm.elements.productType.value = product.productType;
  productForm.elements.price.value = product.price;
  productForm.elements.discountType.value = product.discountType;
  productForm.elements.discountValue.value = product.discountValue;
  productForm.elements.imageUrl.value = product.imageUrl;
  productForm.elements.digitalFileUrl.value = product.digitalFileUrl;
  productForm.elements.stockQuantity.value = product.stockQuantity;
  productForm.elements.deliveryInstructions.value = product.deliveryInstructions;
  productForm.elements.status.value = ["active", "paused"].includes(product.status) ? "draft" : product.status;
  if (productFormTitle) productFormTitle.textContent = `Edit Product: ${product.title}`;
  updateFinalPricePreview();
}

function productFromForm() {
  const formData = new FormData(productForm);
  const existingProduct = productListings.find((item) => item.id === formData.get("id"));
  const product = {
    id: formData.get("id") || `prod_${Date.now()}`,
    title: formData.get("title").trim(),
    description: formData.get("description").trim(),
    category: formData.get("category").trim(),
    productType: formData.get("productType"),
    price: Number(formData.get("price")),
    discountType: formData.get("discountType"),
    discountValue: Number(formData.get("discountValue") || 0),
    imageUrl: formData.get("imageUrl").trim(),
    digitalFileUrl: formData.get("digitalFileUrl").trim(),
    stockQuantity: Number(formData.get("stockQuantity") || 0),
    deliveryInstructions: formData.get("deliveryInstructions").trim(),
    status: formData.get("status"),
    createdAt: existingProduct?.createdAt || new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10)
  };
  calculateFinalPrice(product);
  if (!product.title || !product.description || !product.category) throw new Error("Title, description, and category are required.");
  if (product.productType === "physical" && (!Number.isInteger(product.stockQuantity) || product.stockQuantity < 0)) {
    throw new Error("Physical products need a non-negative stock quantity.");
  }
  return product;
}

function productToListingPayload(product) {
  return {
    title: product.title,
    description: product.description,
    category: product.category,
    productType: product.productType,
    price: Number(product.price).toFixed(2),
    currency: "USDT",
    discountType: product.discountType,
    discountValue: Number(product.discountValue || 0).toFixed(2),
    imageUrl: product.imageUrl,
    digitalFileUrl: product.digitalFileUrl,
    stockQuantity: product.stockQuantity,
    deliveryInstructions: product.deliveryInstructions,
    status: product.status
  };
}

function listingToProduct(listing) {
  const createdAt = (listing.created_at || new Date().toISOString()).slice(0, 10);
  const updatedAt = (listing.updated_at || listing.created_at || new Date().toISOString()).slice(0, 10);
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    category: listing.category,
    productType: listing.product_type,
    price: Number(listing.price),
    discountType: listing.discount_type,
    discountValue: Number(listing.discount_value || 0),
    imageUrl: listing.image_url || "",
    digitalFileUrl: listing.digital_file_url || "",
    stockQuantity: Number(listing.stock_quantity || 0),
    deliveryInstructions: listing.delivery_instructions || "",
    status: listing.status,
    createdAt,
    updatedAt
  };
}

async function saveProductListing(product) {
  if (!adminSession) {
    return { product, persisted: false };
  }

  const existingProduct = productListings.find((item) => item.id === product.id);
  const canPatchExisting = Boolean(existingProduct) && !String(product.id).startsWith("prod_");
  const payload = productToListingPayload(product);
  const listing = await adminFetch(canPatchExisting ? `/api/listings/${product.id}` : "/api/listings", {
    method: canPatchExisting ? "PATCH" : "POST",
    body: JSON.stringify(payload)
  });
  return { product: listingToProduct(listing), persisted: true };
}

function updateFinalPricePreview() {
  if (!productForm) return;
  const preview = productForm.elements.finalPrice;
  try {
    const product = {
      price: Number(productForm.elements.price.value || 0),
      discountType: productForm.elements.discountType.value,
      discountValue: Number(productForm.elements.discountValue.value || 0)
    };
    preview.value = product.price > 0 ? money(calculateFinalPrice(product)) : "$0.00";
    if (productNote) {
      productNote.textContent = adminSession
        ? "Products save to the backend listing API for this admin session."
        : "Products can be drafted locally. Log in as admin to persist them through the backend listing API.";
      productNote.classList.remove("error");
    }
  } catch (error) {
    preview.value = "Invalid discount";
    if (productNote) {
      productNote.textContent = error.message;
      productNote.classList.add("error");
    }
  }
}

function renderUsers() {
  if (!userList) return;
  const search = userSearch?.value.toLowerCase() || "";
  const filtered = messageUsers.filter((user) => `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(search));
  userList.innerHTML = filtered.map((user) => html`
    <button class="user-item ${user.id === selectedUserId ? "active" : ""}" type="button" data-select-user="${user.id}">
      <strong>${user.name}</strong>
      <span>${user.email}</span>
      <small>${user.role}</small>
    </button>
  `).join("");
}

function renderMessageThread() {
  if (!messageThread) return;
  const selectedUser = messageUsers.find((user) => user.id === selectedUserId);
  const status = messageStatus?.value || "all";
  const filtered = messages
    .filter((message) => message.senderUserId === selectedUserId || message.recipientUserId === selectedUserId)
    .filter((message) => status === "all" || message.status === status);
  if (messageThreadTitle) messageThreadTitle.textContent = selectedUser ? `${selectedUser.name} - ${selectedUser.role}` : "Select a user";
  messageThread.innerHTML = filtered.length ? filtered.map((message) => html`
    <article class="message-item">
      <strong>${message.subject}</strong>
      <p>${message.body}</p>
      <div class="message-meta">
        <span>${message.status}</span>
        <span>${message.createdAt}</span>
        <span>${message.relatedEntityType}${message.relatedEntityId ? `:${message.relatedEntityId}` : ""}</span>
      </div>
      <div class="message-actions">
        <button class="quiet-button" type="button" data-read-message="${message.id}">Mark Read</button>
        <button class="quiet-button" type="button" data-archive-message="${message.id}">Archive</button>
      </div>
    </article>
  `).join("") : "<p class=\"form-note\">No messages match this filter.</p>";
}

function applyMessageTemplate(template) {
  if (!messageForm || !template) return;
  const bodies = {
    "Listing approved": "Your listing has been approved and is ready for publishing.",
    "Listing rejected": "Your listing needs changes before it can be approved.",
    "Order update": "There is an update on your order. Please review the dashboard.",
    "Payment/escrow notice": "A payment or escrow event requires your attention.",
    "Dispute notice": "A dispute has been opened or updated. Please review evidence.",
    "Account warning": "Your account has a policy warning that requires action.",
    "General announcement": "We have an important AgentPay platform update to share."
  };
  messageForm.elements.subject.value = template;
  messageForm.elements.body.value = bodies[template] || "";
}

function renderMessages() {
  renderUsers();
  renderMessageThread();
}

function openModal(title, body, details = []) {
  if (!modal) return;
  if (modalTitle) modalTitle.textContent = title;
  if (modalBody) modalBody.textContent = body;
  if (modalDetails) {
    modalDetails.innerHTML = details.map(([label, value]) => html`
      <p><span>${label}</span><strong>${value}</strong></p>
    `).join("");
  }
  modal.showModal();
}

function renderAgents() {
  renderList("[data-agent-table]", agents, (agent) => html`
    <button class="row-item clickable-row" type="button" data-open-agent="${agent.name}">
      <div><strong>${agent.name}</strong><small>${agent.role} - ${agent.spend} spent - ${agent.limit}</small></div>
      <span class="${pillClass(agent.status)}">${agent.status}</span>
    </button>
  `);

  renderList("[data-agent-cards]", agents, (agent) => html`
    <article class="agent-card">
      <span class="${pillClass(agent.status)}">${agent.status}</span>
      <h3>${agent.name}</h3>
      <p>${agent.role} agent with ${agent.limit} policy and ${agent.risk.toLowerCase()} risk state.</p>
      <div class="card-footer"><strong>${agent.spend}</strong><button class="quiet-button" type="button" data-edit-agent="${agent.name}">Edit Limits</button></div>
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
      <div class="card-footer"><strong>${Number(listing.priceAmount).toFixed(0)} ${listing.currency}</strong><button class="quiet-button" type="button" data-view-listing="${listing.id}">View Details</button></div>
      <div class="row-actions">
        <button class="quiet-button" type="button" data-edit-market-listing="${listing.id}">Edit</button>
        <button class="quiet-button" type="button" data-pause-market-listing="${listing.id}">Pause / Activate</button>
        <button class="quiet-button" type="button" data-schema-url="${listing.schemaUrl || ""}">${listing.schemaUrl ? "Schema" : "Schema Pending"}</button>
      </div>
    </article>
  `);
}

function renderStaticLists() {
  renderList("[data-activity-feed]", activities, ([title, detail, value]) => html`
    <button class="activity-item clickable-row" type="button" data-open-activity="${title}"><div><strong>${title}</strong><small>${detail}</small></div><span class="${pillClass(value)}">${value}</span></button>
  `);

  renderList("[data-ledger-list]", ledger, ([title, detail, value]) => html`
    <button class="ledger-item clickable-row" type="button" data-open-ledger="${title}"><div><strong>${title}</strong><small>${detail}</small></div><strong>${value}</strong></button>
  `);

  renderList("[data-seller-orders]", sellerOrders, ([id, status, value]) => html`
    <button class="order-item clickable-row" type="button" data-open-order="${id}"><div><strong>${id}</strong><small>${status}</small></div><strong>${value}</strong></button>
  `);

  renderList("[data-review-list]", reviews, ([title, detail, priority]) => html`
    <button class="review-item clickable-row" type="button" data-open-review="${title}"><div><strong>${title}</strong><small>${detail}</small></div><span class="${pillClass(priority)}">${priority}</span></button>
  `);

  renderList("[data-api-keys]", apiKeys, ([agent, scopes, status]) => html`
    <button class="api-key-item clickable-row" type="button" data-open-api-key="${agent}"><div><strong>${agent}</strong><small>${scopes}</small></div><span class="${pillClass(status)}">${status}</span></button>
  `);

  renderList("[data-escrow-orders]", sellerOrders, ([id, status, value]) => html`
    <article class="escrow-card">
      <span class="${pillClass(status)}">${status}</span>
      <h3>${id}</h3>
      <p>Escrow-backed digital service order with audit trail and admin resolution path.</p>
      <div class="card-footer"><strong>${value}</strong><button class="quiet-button" type="button" data-open-order="${id}">Open</button></div>
    </article>
  `);
}

function activateView(target) {
  const selected = document.querySelector(`[data-view="${target}"]`);
  if (!selected) return;
  navButtons.forEach((item) => item.classList.toggle("active", item === selected));
  pages.forEach((page) => page.classList.toggle("active", page.dataset.page === target));
}

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

async function adminFetch(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(adminSession?.token ? { Authorization: `Bearer ${adminSession.token}` } : {}),
      ...(options.headers || {})
    }
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Backend request failed");
  return payload;
}

function setAdminAuthenticated(authenticated) {
  if (adminLoginPanel) adminLoginPanel.hidden = authenticated;
  if (adminWorkspace) adminWorkspace.hidden = !authenticated;
  if (adminLogout) adminLogout.hidden = !authenticated;
  if (adminStatus) adminStatus.textContent = authenticated ? `Logged in as ${adminSession.admin.email}` : "KYC, listings, disputes";
}

async function loadAuditEvents() {
  if (!auditEvents || !adminSession) return;
  auditEvents.innerHTML = "<p class=\"form-note\">Loading audit events...</p>";
  try {
    const payload = await adminFetch("/api/v1/admin/audit-events");
    const items = payload.items.slice(-6).reverse();
    auditEvents.innerHTML = items.length ? items.map((item) => html`
      <button class="audit-item clickable-row" type="button" data-open-activity="${item.action}">
        <div><strong>${item.action}</strong><small>${item.actorType || "system"} ${item.actorId || ""}</small></div>
        <span class="pill">${item.subjectType || "event"}</span>
      </button>
    `).join("") : "<p class=\"form-note\">No audit events yet. Admin actions will appear here.</p>";
  } catch (error) {
    auditEvents.innerHTML = `<p class="form-note error">${escapeHtml(error.message)}</p>`;
  }
}

async function loadBackendProductListings({ showNote = false } = {}) {
  if (!adminSession) return;
  if (showNote && productNote) {
    productNote.textContent = "Refreshing listings from backend...";
    productNote.classList.remove("error", "success");
  }
  const payload = await adminFetch("/api/listings?include_archived=true");
  productListings.splice(0, productListings.length, ...payload.items.map(listingToProduct));
  renderProductDashboard();
  if (showNote && productNote) {
    productNote.textContent = "Listings refreshed from the backend.";
    productNote.classList.add("success");
    productNote.classList.remove("error");
  }
}

async function loadAdminSessionFromCookie() {
  try {
    const payload = await adminFetch("/api/auth/session");
    adminSession = { token: adminSession?.token || "", admin: payload.admin };
    localStorage.setItem("agentpayAdminSession", JSON.stringify(adminSession));
    setAdminAuthenticated(true);
    await loadBackendProductListings();
    await loadDisputes({ selectFirst: true });
    await loadAuditEvents();
  } catch (error) {
    adminSession = null;
    localStorage.removeItem("agentpayAdminSession");
    setAdminAuthenticated(false);
  }
}

function handleAdminControl(action) {
  if (!adminSession) {
    openModal("Admin Login Required", "Login to the backend before using admin controls.");
    return;
  }

  const actions = {
    "pause-risk": ["High-Risk Agents Paused", "All agents marked High or Review have been queued for pause enforcement."],
    "export-audit": ["Audit Export Ready", "Audit events were collected from the backend feed and prepared for export."],
    disputes: ["Dispute Board Opened", "Active disputes are filtered for admin resolution and evidence review."],
    reconcile: ["Wallet Reconciliation Started", "Deposit records and ledger entries are queued for reconciliation."]
  };
  const [title, body] = actions[action] || ["Admin Action", "Admin action completed."];
  openModal(title, body, [["Operator", adminSession.admin.email], ["Result", "Action accepted"]]);
  loadAuditEvents();
}

navButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    activateView(button.dataset.view);
    setMobileMenu(false);
    if (button.dataset.view === "disputes") {
      try {
        await loadDisputes({ selectFirst: true });
      } catch (error) {
        if (disputeNote) {
          disputeNote.textContent = error.message;
          disputeNote.classList.add("error");
        }
      }
    }
  });
});

mobileMenuToggle?.addEventListener("click", () => {
  setMobileMenu(!document.body.classList.contains("sidebar-open"));
});

sidebarScrim?.addEventListener("click", () => {
  setMobileMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMobileMenu(false);
    if (modal?.open) modal.close();
  }
});

document.querySelectorAll("[data-jump-view]").forEach((button) => {
  button.addEventListener("click", () => {
    activateView(button.dataset.jumpView);
  });
});

document.querySelector("[data-search]")?.addEventListener("input", updateMarketplace);
document.querySelector("[data-category]")?.addEventListener("change", updateMarketplace);
[productSearch, productCategory, productStatus, productTypeFilter, productDiscounted].forEach((control) => {
  control?.addEventListener("input", renderProductDashboard);
  control?.addEventListener("change", renderProductDashboard);
});

document.querySelector("[data-export-listings]")?.addEventListener("click", async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  button.textContent = "Exporting...";
  try {
    await loadBackendProductListings();
    const rows = [["title", "type", "category", "price", "discount_type", "discount_value", "final_price", "stock", "status", "created", "updated"]]
      .concat(productListings.map((product) => [product.title, product.productType, product.category, product.price, product.discountType, product.discountValue, calculateFinalPrice(product), product.stockQuantity, product.status, product.createdAt, product.updatedAt || product.createdAt]));
    openModal("Export Listings", "CSV export was prepared from the backend listing API.", [["Rows", rows.length - 1], ["Source", "GET /api/listings"]]);
  } catch (error) {
    openModal("Export Failed", error.message);
  } finally {
    button.disabled = false;
    button.textContent = "Export Listings";
  }
});

document.querySelector("[data-refresh-listings]")?.addEventListener("click", async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  button.textContent = "Refreshing...";
  try {
    await loadBackendProductListings({ showNote: true });
    openModal("Listings Refreshed", "The backend dashboard listing state has been refreshed.", [["Products", productListings.filter((product) => product.status !== "archived").length]]);
  } catch (error) {
    openModal("Refresh Failed", error.message);
  } finally {
    button.disabled = false;
    button.textContent = "Sync / Refresh";
  }
});

[userSearch, messageStatus].forEach((control) => {
  control?.addEventListener("input", renderMessages);
  control?.addEventListener("change", renderMessages);
});

document.querySelector("[data-refresh-disputes]")?.addEventListener("click", async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  button.textContent = "Refreshing...";
  try {
    await loadDisputes({ selectFirst: true });
  } catch (error) {
    if (disputeNote) {
      disputeNote.textContent = error.message;
      disputeNote.classList.add("error");
    }
  } finally {
    button.disabled = false;
    button.textContent = "Refresh Disputes";
  }
});

disputeMessageForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!selectedDisputeId) return;
  const formData = new FormData(disputeMessageForm);
  const template = formData.get("template");
  const body = formData.get("body").trim() || template;
  if (!body) {
    if (disputeNote) {
      disputeNote.textContent = "Message body cannot be empty.";
      disputeNote.classList.add("error");
    }
    return;
  }
  const button = disputeMessageForm.querySelector("button[type='submit']");
  button.disabled = true;
  try {
    await adminFetch(`/api/disputes/${selectedDisputeId}/message`, {
      method: "POST",
      body: JSON.stringify({ recipientRole: formData.get("recipientRole"), subject: template || "Dispute update", body })
    });
    disputeMessageForm.reset();
    await reloadSelectedDispute();
    if (disputeNote) {
      disputeNote.textContent = "Dispute message sent.";
      disputeNote.classList.add("success");
      disputeNote.classList.remove("error");
    }
  } catch (error) {
    if (disputeNote) {
      disputeNote.textContent = error.message;
      disputeNote.classList.add("error");
    }
  } finally {
    button.disabled = false;
  }
});

disputeNoteForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!selectedDisputeId) return;
  const note = new FormData(disputeNoteForm).get("note").trim();
  if (!note) return;
  const button = disputeNoteForm.querySelector("button[type='submit']");
  button.disabled = true;
  try {
    await adminFetch(`/api/disputes/${selectedDisputeId}/admin-note`, { method: "POST", body: JSON.stringify({ note }) });
    disputeNoteForm.reset();
    await reloadSelectedDispute();
  } catch (error) {
    if (disputeNote) {
      disputeNote.textContent = error.message;
      disputeNote.classList.add("error");
    }
  } finally {
    button.disabled = false;
  }
});

messageTemplate?.addEventListener("change", () => {
  applyMessageTemplate(messageTemplate.value);
});

messageForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const selectedUser = messageUsers.find((user) => user.id === selectedUserId);
  const subject = messageForm.elements.subject.value.trim();
  const body = messageForm.elements.body.value.trim();
  if (!selectedUser || !subject || !body) {
    if (messageNote) {
      messageNote.textContent = "Select a user and enter a subject and message body.";
      messageNote.classList.add("error");
    }
    return;
  }
  const message = {
    id: `msg_${Date.now()}`,
    threadId: `thr_${selectedUser.id}`,
    senderUserId: "usr_admin",
    recipientUserId: selectedUser.id,
    recipientRole: selectedUser.role,
    relatedEntityType: messageForm.elements.relatedEntityType.value,
    relatedEntityId: "",
    subject,
    body,
    status: "sent",
    createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    readAt: "",
    archivedAt: ""
  };
  messages.unshift(message);
  messageForm.reset();
  if (messageNote) {
    messageNote.textContent = "Message sent in the internal dashboard. Email/SMS notification delivery is a future integration TODO.";
    messageNote.classList.remove("error");
    messageNote.classList.add("success");
  }
  renderMessages();
});

document.querySelector("[data-send-announcement]")?.addEventListener("click", () => {
  const subject = "General announcement";
  const body = "Platform announcement drafted from the owner messaging dashboard.";
  messageUsers.filter((user) => user.id !== "usr_admin").forEach((user) => {
    messages.unshift({
      id: `msg_${Date.now()}_${user.id}`,
      threadId: `thr_${user.id}`,
      senderUserId: "usr_admin",
      recipientUserId: user.id,
      recipientRole: user.role,
      relatedEntityType: "general",
      relatedEntityId: "",
      subject,
      body,
      status: "sent",
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      readAt: "",
      archivedAt: ""
    });
  });
  renderMessages();
  openModal("Announcement Sent", "Announcement messages were created for all users in the current dashboard state.", [["Recipients", messageUsers.length - 1]]);
});

document.querySelectorAll("[data-add-product]").forEach((button) => {
  button.addEventListener("click", () => {
    activateView("dashboard");
    resetProductForm();
    productFormPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelector("[data-product-cancel]")?.addEventListener("click", () => {
  resetProductForm();
});

productForm?.addEventListener("input", updateFinalPricePreview);

productForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const product = productFromForm();
    if (productNote) {
      productNote.textContent = adminSession ? "Saving product to backend..." : "Saving product locally...";
      productNote.classList.remove("error", "success");
    }

    const result = await saveProductListing(product);
    const savedProduct = result.product;
    const existingIndex = productListings.findIndex((item) => item.id === product.id || item.id === savedProduct.id);
    if (existingIndex >= 0) {
      productListings[existingIndex] = savedProduct;
      activities.unshift(["Listing updated", savedProduct.title, savedProduct.status]);
    } else {
      productListings.unshift(savedProduct);
      activities.unshift(["Listing created", savedProduct.title, savedProduct.status]);
    }
    renderProductDashboard();
    renderStaticLists();
    resetProductForm();
    if (productNote) {
      productNote.textContent = result.persisted
        ? "Product saved to the backend listing API and added to the dashboard."
        : "Product saved in the current dashboard state. Log in as admin to persist new products through the backend API.";
      productNote.classList.add("success");
      productNote.classList.remove("error");
    }
  } catch (error) {
    if (productNote) {
      productNote.textContent = error.message;
      productNote.classList.add("error");
      productNote.classList.remove("success");
    }
  }
});

document.querySelector("[data-publish-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const note = document.querySelector("[data-publish-note]");
  if (note) {
    note.textContent = "Listing submitted to the admin review queue.";
    note.classList.add("success");
  }
  openModal("Listing Submitted", "The listing is now visible in the admin review workflow.", [["Queue", "Listing approval"], ["Status", "Pending review"]]);
});

document.querySelector("[data-wallet-action]")?.addEventListener("click", () => {
  openModal("Funding Session", "A sandbox funding session has been generated for demo wallet testing.", [
    ["Reference", `BP-${Math.floor(1000 + Math.random() * 9000)}`],
    ["Rail", "Sandbox testnet"],
    ["Status", "Ready for deposit simulation"]
  ]);
});

document.querySelectorAll("[data-sandbox-wallet]").forEach((button) => {
  button.addEventListener("click", () => {
    const balance = document.querySelector("[data-sandbox-balance]");
    const escrow = document.querySelector("[data-sandbox-escrow]");
    if (balance) balance.textContent = "6,000 testUSDT";
    if (escrow) escrow.textContent = "0 testUSDT";
    openModal("Sandbox Wallet Funded", "The test wallet balance was updated for demo purchase testing. No live assets moved.", [
      ["Available", "6,000 testUSDT"],
      ["Escrow", "0 testUSDT"]
    ]);
  });
});

adminLoginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(adminLoginForm);
  if (adminLoginNote) {
    adminLoginNote.textContent = "Logging in...";
    adminLoginNote.classList.remove("error");
  }

  try {
    const payload = await adminFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: formData.get("email"),
        password: formData.get("password")
      })
    });
    adminSession = { token: payload.token, admin: payload.admin };
    localStorage.setItem("agentpayAdminSession", JSON.stringify(adminSession));
    if (adminLoginNote) {
      adminLoginNote.textContent = "Login successful.";
      adminLoginNote.classList.add("success");
    }
    setAdminAuthenticated(true);
    await loadBackendProductListings();
    await loadAuditEvents();
  } catch (error) {
    if (adminLoginNote) {
      adminLoginNote.textContent = error.message;
      adminLoginNote.classList.remove("success");
      adminLoginNote.classList.add("error");
    }
  }
});

adminLogout?.addEventListener("click", async () => {
  try {
    await adminFetch("/api/auth/logout", { method: "POST" });
  } catch (error) {
    console.warn(error.message);
  }
  adminSession = null;
  localStorage.removeItem("agentpayAdminSession");
  setAdminAuthenticated(false);
  if (auditEvents) auditEvents.innerHTML = "";
});

document.addEventListener("click", (event) => {
  const selectUser = event.target.closest("[data-select-user]");
  if (selectUser) {
    selectedUserId = selectUser.dataset.selectUser;
    renderMessages();
  }

  const readMessage = event.target.closest("[data-read-message]");
  if (readMessage) {
    const message = messages.find((item) => item.id === readMessage.dataset.readMessage);
    if (message) {
      message.status = "read";
      message.readAt = new Date().toISOString();
      renderMessages();
    }
  }

  const archiveMessage = event.target.closest("[data-archive-message]");
  if (archiveMessage) {
    const message = messages.find((item) => item.id === archiveMessage.dataset.archiveMessage);
    if (message) {
      message.status = "archived";
      message.archivedAt = new Date().toISOString();
      renderMessages();
    }
  }

  const editProduct = event.target.closest("[data-edit-product]");
  if (editProduct) {
    const product = productListings.find((item) => item.id === editProduct.dataset.editProduct);
    if (product) {
      loadProductForm(product);
      productFormPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const toggleProduct = event.target.closest("[data-toggle-product]");
  if (toggleProduct) {
    const product = productListings.find((item) => item.id === toggleProduct.dataset.toggleProduct);
    if (product) {
      const nextStatus = product.status === "paused" ? "active" : "paused";
      toggleProduct.disabled = true;
      toggleProduct.textContent = "Saving...";
      try {
        const updated = adminSession
          ? listingToProduct(await adminFetch(`/api/listings/${product.id}/status`, {
              method: "PATCH",
              body: JSON.stringify({ status: nextStatus })
            }))
          : { ...product, status: nextStatus, updatedAt: new Date().toISOString().slice(0, 10) };
        productListings[productListings.findIndex((item) => item.id === product.id)] = updated;
        activities.unshift(["Listing status changed", updated.title, updated.status]);
        renderProductDashboard();
        renderStaticLists();
        openModal("Listing Status Updated", `${updated.title} is now ${updated.status}.`, [["Status", updated.status]]);
      } catch (error) {
        openModal("Status Update Failed", error.message);
        renderProductDashboard();
      }
    }
  }

  const deleteProduct = event.target.closest("[data-delete-product]");
  if (deleteProduct) {
    const product = productListings.find((item) => item.id === deleteProduct.dataset.deleteProduct);
    if (product) {
      const confirmed = window.confirm(`Archive ${product.title}? This removes it from the active dashboard list.`);
      if (!confirmed) return;
      deleteProduct.disabled = true;
      deleteProduct.textContent = "Archiving...";
      try {
        const archived = adminSession
          ? listingToProduct(await adminFetch(`/api/listings/${product.id}`, { method: "DELETE" }))
          : { ...product, status: "archived", updatedAt: new Date().toISOString().slice(0, 10) };
        productListings[productListings.findIndex((item) => item.id === product.id)] = archived;
        activities.unshift(["Listing archived", archived.title, "archived"]);
        renderProductDashboard();
        renderStaticLists();
        openModal("Listing Archived", `${archived.title} was soft-deleted by setting status to archived.`, [["Status", "archived"]]);
      } catch (error) {
        openModal("Archive Failed", error.message);
        renderProductDashboard();
      }
    }
  }

  const discountProduct = event.target.closest("[data-discount-product]");
  if (discountProduct) {
    const product = productListings.find((item) => item.id === discountProduct.dataset.discountProduct);
    if (product) {
      loadProductForm(product);
      productForm.elements.discountType.value = product.discountType === "none" ? "percentage" : product.discountType;
      productForm.elements.discountValue.value = product.discountType === "none" ? "10" : product.discountValue;
      updateFinalPricePreview();
      productFormPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const viewProduct = event.target.closest("[data-view-product], [data-view-listing], [data-edit-market-listing], [data-pause-market-listing]");
  if (viewProduct) {
    const id = Object.values(viewProduct.dataset)[0];
    openModal("Listing Details", "Backend listing management action selected.", [["Listing", id], ["Actions", "Edit, pause, discount, archive"]]);
  }

  const openDispute = event.target.closest("[data-open-dispute]");
  if (openDispute) {
    selectedDisputeId = openDispute.dataset.openDispute;
    reloadSelectedDispute().catch((error) => {
      if (disputeNote) {
        disputeNote.textContent = error.message;
        disputeNote.classList.add("error");
      }
    });
  }

  const disputeAction = event.target.closest("[data-dispute-action]");
  if (disputeAction && selectedDisputeId) {
    const action = disputeAction.dataset.disputeAction;
    disputeAction.disabled = true;
    disputeAction.textContent = "Saving...";
    const requests = {
      under_review: () => adminFetch(`/api/disputes/${selectedDisputeId}/status`, { method: "PATCH", body: JSON.stringify({ status: "under_review" }) }),
      request_buyer: () => adminFetch(`/api/disputes/${selectedDisputeId}/request-evidence`, { method: "POST", body: JSON.stringify({ requiredFrom: "buyer" }) }),
      request_seller: () => adminFetch(`/api/disputes/${selectedDisputeId}/request-evidence`, { method: "POST", body: JSON.stringify({ requiredFrom: "seller" }) }),
      escalate: () => adminFetch(`/api/disputes/${selectedDisputeId}/escalate`, { method: "POST", body: JSON.stringify({ message: "Escalated for senior review" }) }),
      close: () => adminFetch(`/api/disputes/${selectedDisputeId}/close`, { method: "POST", body: JSON.stringify({ message: "Closed by admin" }) })
    };
    requests[action]?.()
      .then(async () => {
        await reloadSelectedDispute();
        if (disputeNote) {
          disputeNote.textContent = "Dispute action completed.";
          disputeNote.classList.add("success");
          disputeNote.classList.remove("error");
        }
      })
      .catch((error) => {
        if (disputeNote) {
          disputeNote.textContent = error.message;
          disputeNote.classList.add("error");
        }
      })
      .finally(() => {
        disputeAction.disabled = false;
        disputeAction.textContent = {
          under_review: "Mark under review",
          request_buyer: "Request buyer evidence",
          request_seller: "Request seller evidence",
          escalate: "Escalate",
          close: "Close"
        }[action] || "Action";
      });
  }

  const disputeResolution = event.target.closest("[data-dispute-resolution]");
  if (disputeResolution && selectedDisputeId) {
    const action = disputeResolution.dataset.disputeResolution;
    disputeResolution.disabled = true;
    disputeResolution.textContent = "Resolving...";
    const idempotencyKey = `ui:${selectedDisputeId}:${action}:${Date.now()}`;
    const body = action === "partial-refund" ? { amount: partialRefundAmount?.value } : {};
    adminFetch(`/api/disputes/${selectedDisputeId}/${action}`, {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(body)
    })
      .then(async () => {
        await reloadSelectedDispute();
        if (disputeNote) {
          disputeNote.textContent = "Dispute resolution completed through the ledger.";
          disputeNote.classList.add("success");
          disputeNote.classList.remove("error");
        }
      })
      .catch((error) => {
        if (disputeNote) {
          disputeNote.textContent = error.message;
          disputeNote.classList.add("error");
        }
      })
      .finally(() => {
        disputeResolution.disabled = false;
        disputeResolution.textContent = {
          refund: "Refund Buyer",
          release: "Release Seller",
          "partial-refund": "Partial Refund"
        }[action] || "Resolve";
      });
  }

  const detailButton = event.target.closest("[data-open-agent], [data-edit-agent], [data-open-activity], [data-open-ledger], [data-open-order], [data-open-review], [data-open-api-key]");
  if (detailButton) {
    const datasetEntry = Object.entries(detailButton.dataset)[0];
    const value = datasetEntry?.[1] || "Selected item";
    const key = datasetEntry?.[0] || "item";
    const readable = key.replace(/([A-Z])/g, " $1").replace(/^open /, "").replace(/^edit /, "");
    openModal(value, `Opened ${readable.toLowerCase()} details. This action is wired in the console and ready for backend persistence.`, [
      ["State", "Demo action completed"],
      ["Next backend step", "Persist changes through the admin API"]
    ]);
  }

  const schemaButton = event.target.closest("[data-schema-url]");
  if (schemaButton) {
    if (!schemaButton.dataset.schemaUrl) {
      openModal("Schema Pending", "This listing does not have a public schema route yet.", [["Status", "Pending"]]);
      return;
    }
    openModal("Public Schema Route", "Use this route for buyer-agent listing discovery.", [["Route", schemaButton.dataset.schemaUrl]]);
  }

  const buyButton = event.target.closest("[data-buy-listing]");
  if (buyButton) {
    openModal("Sandbox Order Prepared", "Escrow lock and archive delivery proof are available in the backend starter; live USDT requires deployment approval.", [
      ["Listing", buyButton.dataset.buyListing],
      ["Status", "Ready for escrow"]
    ]);
  }

  const adminControl = event.target.closest("[data-admin-control]");
  if (adminControl) {
    handleAdminControl(adminControl.dataset.adminControl);
  }
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    openModal("Create Listing", "Create Listing is clickable and prepared for backend publishing. Use the Merchant tab to submit a demo listing into the review queue.", [
      ["Target", "Merchant publishing API"],
      ["Status", "Ready for integration"]
    ]);
  });
});

renderAgents();
renderListings();
renderStaticLists();
renderProductDashboard();
renderMessages();
resetProductForm();
setAdminAuthenticated(Boolean(adminSession));
loadAdminSessionFromCookie();

const requestedView = new URLSearchParams(window.location.search).get("view") || window.location.hash.replace("#", "");
if (requestedView) {
  activateView(requestedView);
}
