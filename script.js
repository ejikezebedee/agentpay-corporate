const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const tabs = document.querySelectorAll("[data-tab]");
const panels = document.querySelectorAll("[data-panel]");
const form = document.querySelector("[data-contact-form]");
const formNote = document.querySelector("[data-form-note]");
const publicListings = document.querySelector("[data-public-listings]");
const backendPort = window.location.port === "4175" ? "3001" : "3000";
const apiBase = window.AGENTPAY_BACKEND_ORIGIN || `${window.location.protocol}//${window.location.hostname}:${backendPort}`;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
}

function money(value) {
  return `$${Number(value).toFixed(2)}`;
}

if (menuButton && header) {
  menuButton.addEventListener("click", () => {
    const isOpen = header.classList.toggle("menu-active");
    document.body.classList.toggle("menu-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  header.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("menu-active");
      document.body.classList.remove("menu-open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;

    tabs.forEach((button) => button.classList.toggle("active", button === tab));
    panels.forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.panel === target);
    });
  });
});

if (publicListings) {
  fetch(`${apiBase}/api/public/listings`)
    .then((response) => response.ok ? response.json() : Promise.reject(new Error("Unable to load marketplace listings")))
    .then((payload) => {
      if (!payload.items?.length) return;
      publicListings.innerHTML = payload.items.map((listing) => `
        <article class="listing">
          <span>${escapeHtml(listing.category)}</span>
          <h3>${escapeHtml(listing.title)}</h3>
          <p>${escapeHtml(listing.description)}</p>
          <b>${escapeHtml(money(listing.final_price || listing.price))} ${escapeHtml(listing.currency)}</b>
        </article>
      `).join("");
    })
    .catch(() => {
      publicListings.dataset.backendStatus = "fallback";
    });
}

if (form && formNote) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    formNote.textContent = "Submitting request...";
    formNote.classList.remove("error", "success");
    try {
      const response = await fetch(`${apiBase}/api/contact-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData))
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Request failed");
      form.reset();
      formNote.textContent = "Access request received by the AgentPay backend.";
      formNote.classList.add("success");
    } catch (error) {
      formNote.textContent = error.message;
      formNote.classList.add("error");
    }
  });
}
