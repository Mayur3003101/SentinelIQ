import "./styles.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

let cases = [
  { id: "RSK-8241", name: "Marisa Cole", initials: "MC", type: "Return pattern", score: 92, exposure: "₹4,820", status: "New", time: "2m ago", reason: "High-value returns across 3 locations" },
  { id: "RSK-8240", name: "Kline & Co.", initials: "KC", type: "Payment anomaly", score: 84, exposure: "₹12,400", status: "In review", time: "8m ago", reason: "Card velocity exceeds account baseline" },
  { id: "RSK-8239", name: "Arun Shah", initials: "AS", type: "Account behavior", score: 76, exposure: "₹2,160", status: "New", time: "14m ago", reason: "New device and unusual order cadence" },
  { id: "RSK-8238", name: "Oakline Retail", initials: "OR", type: "Return pattern", score: 68, exposure: "₹7,230", status: "In review", time: "21m ago", reason: "Repeated no-receipt return activity" },
  { id: "RSK-8237", name: "Jules Bennett", initials: "JB", type: "Payment anomaly", score: 61, exposure: "₹1,980", status: "Escalated", time: "32m ago", reason: "Chargeback risk detected" }
];

const app = document.querySelector("#app");

app.innerHTML = `
  <div class="shell">
    <aside class="sidebar">
      <div class="brand"><span class="brand-mark"><i></i><i></i><i></i></span><span>sentinel<span>IQ</span></span></div>
      <div class="workspace"><span class="company-dot">N</span><div><strong>Northstar Retail</strong><small>Enterprise workspace</small></div><button class="chevron">⌄</button></div>
      <nav>
        <a class="nav-item active" href="#overview"><span class="icon">◈</span>Overview</a>
        <a class="nav-item" href="#queue"><span class="icon">⊙</span>Risk queue <b>12</b></a>
        <a class="nav-item" href="#customers"><span class="icon">♧</span>Customers</a>
        <a class="nav-item" href="#insights"><span class="icon">◌</span>Insights</a>
        <a class="nav-item" href="#rules"><span class="icon">⌘</span>Rules & models</a>
      </nav>
      <div class="sidebar-footer">
        <a class="nav-item" href="#settings"><span class="icon">⚙</span>Settings</a>
        <div class="analyst"><span class="avatar lavender">MP</span><div><strong>Mayur Patil</strong><small>Risk analyst</small></div><span class="more">•••</span></div>
      </div>
    </aside>
    <main>
      <header>
        <div class="crumb"><span>Risk operations</span><span class="slash">/</span><strong>Overview</strong></div>
        <div class="top-actions"><button class="agent-button" id="agentButton">✦ Ask Sentinel</button><button class="icon-button" aria-label="Search">⌕</button><button class="icon-button notification" aria-label="Notifications">♧<i></i></button><button class="help">?</button></div>
      </header>
      <section class="hero" id="overview">
        <div><p class="eyebrow">GOOD MORNING, Mayur</p><h1>Risk, in clear view.</h1><p class="subcopy">Your operation is protected. Here’s what needs your attention.</p></div>
        <div class="date-control"><span>◴</span><strong>Last 30 days</strong><span>⌄</span></div>
      </section>
      <section class="stats-grid">
        <article class="stat-card highlighted"><div class="stat-head"><span class="stat-icon coral">↗</span><span class="stat-label">TOTAL RISK EXPOSURE</span><button class="dots">•••</button></div><div class="metric" id="totalExposure">₹48,296</div><div class="trend down" id="exposureChange">↓ 12.4% <span>vs. previous period</span></div><div class="spark coral-spark"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></article>
        <article class="stat-card"><div class="stat-head"><span class="stat-icon violet">⌁</span><span class="stat-label">OPEN CASES</span><button class="dots">•••</button></div><div class="metric" id="openCases">12</div><div class="trend up" id="newCases">↑ 3 <span>since yesterday</span></div><div class="case-breakdown"><span><i class="red"></i>High <b>4</b></span><span><i class="amber"></i>Medium <b>5</b></span><span><i class="teal"></i>Low <b>3</b></span></div></article>
        <article class="stat-card"><div class="stat-head"><span class="stat-icon green">◌</span><span class="stat-label">MODEL PRECISION</span><button class="dots">•••</button></div><div class="metric" id="modelPrecision">94.2<span class="unit">%</span></div><div class="trend up" id="precisionChange">↑ 1.8% <span>vs. previous period</span></div><div class="precision-bar"><i id="precisionBar"></i></div><div class="precision-foot"><span>Target: 92%</span><strong>Above target</strong></div></article>
      </section>
      <section class="content-grid">
        <article class="panel queue-panel" id="queue"><div class="panel-heading"><div><p class="eyebrow">PRIORITY QUEUE</p><h2>Cases that need a decision</h2></div><button class="text-button" id="viewAll">View all cases <span>→</span></button></div><div class="queue-filters"><button class="filter active" data-filter="all">All <b>12</b></button><button class="filter" data-filter="New">New <b>5</b></button><button class="filter" data-filter="In review">In review <b>4</b></button><button class="filter" data-filter="Escalated">Escalated <b>3</b></button></div><div class="case-list" id="caseList"></div></article>
        <div class="right-rail">
          <article class="panel exposure-panel"><div class="panel-heading"><div><p class="eyebrow">RISK LANDSCAPE</p><h2>Exposure by category</h2></div><button class="dots">•••</button></div><div class="donut-wrap"><div class="donut"><div><strong>₹48.3k</strong><small>Total exposure</small></div></div><div class="legend"><span><i class="l1"></i>Returns <b>44%</b></span><span><i class="l2"></i>Payments <b>32%</b></span><span><i class="l3"></i>Account abuse <b>17%</b></span><span><i class="l4"></i>Other <b>7%</b></span></div></div></article>
          <article class="panel signal-panel"><div class="signal-icon">✦</div><div><p class="eyebrow">MODEL SIGNAL</p><h3>Return risk is rising</h3><p>Elevated return activity in the West region is driving 38% more high-risk flags this week.</p><button class="text-button" id="exploreSignal">Explore insight →</button></div></article>
        </div>
      </section>
      <section class="panel activity-panel" id="insights"><div class="panel-heading"><div><p class="eyebrow">ACTIVITY</p><h2>What changed recently</h2></div><button class="text-button" id="viewActivity">View activity <span>→</span></button></div><div class="activity-grid"><div><span class="activity-bullet success">✓</span><p><strong>Case RSK-8228 was resolved</strong><small>False positive · 18 minutes ago</small></p></div><div><span class="activity-bullet model">⌁</span><p><strong>Model performance report is ready</strong><small>August 2026 · 1 hour ago</small></p></div><div><span class="activity-bullet rule">⌘</span><p><strong>Rule “High velocity returns” was updated</strong><small>By Priya Sharma · 3 hours ago</small></p></div></div></section>
    </main>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
    <div class="drawer-backdrop" id="drawerBackdrop" aria-hidden="true">
      <aside class="case-drawer" aria-labelledby="drawerTitle" role="dialog" aria-modal="true">
        <button class="drawer-close" id="drawerClose" aria-label="Close case details">×</button>
        <div id="drawerContent"></div>
      </aside>
    </div>
    <div class="workspace-backdrop" id="workspaceBackdrop" aria-hidden="true"><section class="workspace-dialog" aria-labelledby="workspaceTitle" role="dialog" aria-modal="true"><button class="drawer-close" id="workspaceClose" aria-label="Close workspace">×</button><div id="workspaceContent"></div></section></div>
  </div>`;

const list = document.querySelector("#caseList");
function scoreClass(score) { return score >= 85 ? "critical" : score >= 70 ? "high" : score >= 60 ? "medium" : "low"; }
function renderCases(filter = "all") {
  const activeCases = cases.filter(item => item.status !== "Resolved");
  const shown = filter === "all" ? activeCases : activeCases.filter(item => item.status === filter);
  list.innerHTML = shown.map(c => `<button class="case-row" data-id="${c.id}"><span class="avatar ${scoreClass(c.score)}">${c.initials}</span><span class="case-main"><strong>${c.name}</strong><small>${c.type} <i>•</i> ${c.id}</small></span><span class="case-exposure"><small>EXPOSURE</small><strong>${c.exposure}</strong></span><span class="risk-score ${scoreClass(c.score)}"><b>${c.score}</b><small>RISK SCORE</small></span><span class="status ${c.status.toLowerCase().replace(' ', '-')}">${c.status}</span><span class="row-arrow">›</span></button>`).join("");
  if (!shown.length) list.innerHTML = '<div class="empty">No cases in this view.</div>';
}
renderCases();

function initials(name) {
  return name.split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase();
}
function relativeTime(value) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  return minutes < 60 ? `${minutes}m ago` : `${Math.round(minutes / 60)}h ago`;
}
function apiCaseToUi(riskCase) {
  return {
    id: riskCase.id, name: riskCase.subject, initials: initials(riskCase.subject), type: riskCase.category,
    score: riskCase.score,
    exposure: new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(riskCase.exposure),
    status: riskCase.status, time: relativeTime(riskCase.created_at), reason: riskCase.reason,
  };
}
async function loadLiveCases() {
  try {
    const response = await fetch(`${API_BASE}/cases`);
    if (!response.ok) throw new Error("Risk API unavailable");
    cases = (await response.json()).map(apiCaseToUi);
    renderCases(document.querySelector(".filter.active").dataset.filter);
  } catch {
    // The static data keeps the app demonstrable before the API is started.
  }
}
loadLiveCases();

async function loadDashboardSummary() {
  try {
    const response = await fetch(`${API_BASE}/dashboard`);
    if (!response.ok) throw new Error("Dashboard API unavailable");
    const summary = await response.json();
    const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
    document.querySelector("#totalExposure").textContent = money.format(summary.total_exposure);
    document.querySelector("#exposureChange").innerHTML = `↓ ${Math.abs(summary.exposure_change_pct)}% <span>vs. previous period</span>`;
    document.querySelector("#openCases").textContent = summary.open_cases;
    document.querySelector("#newCases").innerHTML = `↑ ${summary.new_cases} <span>since yesterday</span>`;
    document.querySelector("#modelPrecision").innerHTML = `${summary.model_precision}<span class="unit">%</span>`;
    document.querySelector("#precisionChange").innerHTML = `↑ ${summary.precision_change_pct}% <span>vs. previous period</span>`;
    document.querySelector("#precisionBar").style.width = `${summary.model_precision}%`;
  } catch {
    // Overview cards retain representative defaults while working offline.
  }
}
loadDashboardSummary();

document.querySelectorAll(".filter").forEach(btn => btn.addEventListener("click", () => { document.querySelectorAll(".filter").forEach(b => b.classList.remove("active")); btn.classList.add("active"); renderCases(btn.dataset.filter); }));
const toast = document.querySelector("#toast");
function showToast(message) { toast.textContent = message; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 2400); }
const drawerBackdrop = document.querySelector("#drawerBackdrop");
const drawerContent = document.querySelector("#drawerContent");
function openCase(riskCase) {
  drawerContent.innerHTML = `<p class="eyebrow">CASE FILE · ${riskCase.id}</p><div class="drawer-title"><span class="avatar ${scoreClass(riskCase.score)}">${riskCase.initials}</span><div><h2 id="drawerTitle">${riskCase.name}</h2><p>${riskCase.type} · ${riskCase.time}</p></div></div><div class="drawer-score ${scoreClass(riskCase.score)}"><span>RISK SCORE</span><strong>${riskCase.score}</strong><small>${riskCase.status}</small></div><section class="evidence"><h3>Why it was flagged</h3><p>${riskCase.reason}</p><div><span>Potential exposure</span><strong>${riskCase.exposure}</strong></div></section><section class="evidence"><h3>Recommended next step</h3><p>Confirm the supporting account and transaction details before making a final disposition.</p></section><div class="drawer-actions"><button class="decision secondary" data-action="review">Mark in review</button><button class="decision danger" data-action="escalate">Escalate case</button><button class="decision primary" data-action="resolve">Resolve</button></div>`;
  drawerContent.dataset.caseId = riskCase.id;
  drawerBackdrop.classList.add("open");
  drawerBackdrop.setAttribute("aria-hidden", "false");
}
function closeDrawer() { drawerBackdrop.classList.remove("open"); drawerBackdrop.setAttribute("aria-hidden", "true"); }
list.addEventListener("click", e => { const row = e.target.closest(".case-row"); if (row) openCase(cases.find(c => c.id === row.dataset.id)); });
document.querySelector("#drawerClose").addEventListener("click", closeDrawer);
drawerBackdrop.addEventListener("click", e => { if (e.target === drawerBackdrop) closeDrawer(); });
drawerContent.addEventListener("click", async e => {
  const button = e.target.closest(".decision");
  if (!button) return;
  const action = button.dataset.action;
  const riskCase = cases.find(item => item.id === drawerContent.dataset.caseId);
  try {
    const response = await fetch(`${API_BASE}/cases/${riskCase.id}/decision`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    if (!response.ok) throw new Error("Could not save decision");
    Object.assign(riskCase, apiCaseToUi(await response.json()));
  } catch { riskCase.status = action === "escalate" ? "Escalated" : action === "resolve" ? "Resolved" : "In review"; }
  renderCases(document.querySelector(".filter.active").dataset.filter);
  closeDrawer();
  showToast(`${riskCase.id} was ${action === "review" ? "moved to review" : action === "escalate" ? "escalated" : "resolved"}.`);
});
document.querySelector("#viewAll").addEventListener("click", () => openWorkspace("cases"));
document.querySelector("#viewActivity").addEventListener("click", () => openWorkspace("activity"));
document.querySelector("#exploreSignal").addEventListener("click", () => showToast("Insight opened: Return activity is concentrated in the West region."));
const workspaceBackdrop = document.querySelector("#workspaceBackdrop");
const workspaceContent = document.querySelector("#workspaceContent");
const workspaceRoutes = { cases: "/cases", customers: "/customers", insights: "/insights", rules: "/rules", activity: "/activity", settings: "/settings" };
const money = value => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
function workspaceMarkup(view, data) {
  if (view === "cases") return `<p class="eyebrow">RISK QUEUE</p><h2 id="workspaceTitle">All active cases</h2><p class="workspace-intro">Every unresolved risk case, sorted by the highest score.</p><div class="workspace-list">${data.map(item => `<div><span><strong>${item.subject}</strong><small>${item.id} · ${item.category} · ${item.reason}</small></span><b>${money(item.exposure)}</b><em>Risk ${item.score}</em></div>`).join("")}</div>`;
  if (view === "activity") return `<p class="eyebrow">ACTIVITY</p><h2 id="workspaceTitle">All recent activity</h2><p class="workspace-intro">Latest decisions, rule changes, and model events.</p><div class="workspace-list">${data.map(item => `<div><span><strong>${item.title}</strong><small>${item.detail} · ${relativeTime(item.occurred_at)}</small></span></div>`).join("")}</div>`;
  if (view === "customers") return `<p class="eyebrow">CUSTOMERS</p><div class="workspace-heading"><div><h2 id="workspaceTitle">Customer risk profiles</h2><p class="workspace-intro">Stored locally and prioritised by potential financial exposure.</p></div><button class="add-button" id="addCustomer">+ Add customer</button></div><form class="customer-form" id="customerForm"><label>Name<input name="name" required minlength="2" placeholder="Customer name"></label><label>Email<input name="email" type="email" placeholder="name@company.com"></label><label>Risk score<input name="risk_score" type="number" min="0" max="100" value="0"></label><label>Exposure (₹)<input name="total_exposure" type="number" min="0" value="0"></label><button class="decision primary" type="submit">Save customer</button></form><div class="workspace-list">${data.map(item => `<div><span><strong>${item.name}</strong><small>${item.id} · ${item.open_cases} open case</small></span><b>${money(item.total_exposure)}</b><button class="edit-customer" data-customer-id="${item.id}">Edit</button><em>Risk ${item.risk_score}</em></div>`).join("")}</div>`;
  if (view === "insights") return `<p class="eyebrow">INSIGHTS</p><h2 id="workspaceTitle">Model signals</h2><p class="workspace-intro">Trends identified across your current risk portfolio.</p><div class="workspace-list">${data.map(item => `<div><span><strong>${item.title}</strong><small>${item.description}</small></span><b>${item.impact}</b><em class="severity-${item.severity.toLowerCase()}">${item.severity}</em></div>`).join("")}</div>`;
  if (view === "rules") return `<p class="eyebrow">RULES & MODELS</p><h2 id="workspaceTitle">Decision controls</h2><p class="workspace-intro">Monitor the rules and models that create risk cases.</p><div class="workspace-list">${data.map(item => `<div><span><strong>${item.name}</strong><small>${item.id} · ${item.rule_type}</small></span><b>${item.precision}% precision</b><em class="severity-low">${item.status}</em></div>`).join("")}</div>`;
  return `<p class="eyebrow">SETTINGS</p><h2 id="workspaceTitle">Workspace settings</h2><p class="workspace-intro">Current operating defaults for Northstar Retail.</p><div class="settings-list"><div><span>Workspace</span><strong>${data.workspace_name}</strong></div><div><span>Currency</span><strong>Indian Rupee (₹ / ${data.currency})</strong></div><div><span>High-risk threshold</span><strong>${data.risk_threshold} and above</strong></div><div><span>Primary analyst</span><strong>${data.analyst_name}</strong></div></div>`;
}
async function openWorkspace(view) {
  if (view === "agent") {
    workspaceContent.innerHTML = `<p class="eyebrow">SENTINEL AI</p><h2 id="workspaceTitle">Ask the risk assistant</h2><p class="workspace-intro">Get a data-aware recommendation based on the active cases stored in SentinelIQ.</p><form class="agent-form" id="agentForm"><textarea name="question" required placeholder="Example: Which case should I review first?"></textarea><button class="decision primary" type="submit">Analyse live queue</button></form><div class="agent-answer" id="agentAnswer">Ask a question to begin.</div>`;
    workspaceBackdrop.classList.add("open"); workspaceBackdrop.setAttribute("aria-hidden", "false"); return;
  }
  workspaceContent.innerHTML = `<p class="eyebrow">LOADING</p><h2 id="workspaceTitle">Preparing workspace…</h2>`;
  workspaceBackdrop.classList.add("open");
  workspaceBackdrop.setAttribute("aria-hidden", "false");
  try {
    const response = await fetch(`${API_BASE}${workspaceRoutes[view]}`);
    if (!response.ok) throw new Error("Workspace data unavailable");
    workspaceContent.innerHTML = workspaceMarkup(view, await response.json());
  } catch {
    workspaceContent.innerHTML = `<p class="eyebrow">OFFLINE</p><h2 id="workspaceTitle">${view === "rules" ? "Rules & models" : view[0].toUpperCase() + view.slice(1)}</h2><p class="workspace-intro">Start the SentinelIQ API to load this workspace’s live data.</p>`;
  }
}
function closeWorkspace() { workspaceBackdrop.classList.remove("open"); workspaceBackdrop.setAttribute("aria-hidden", "true"); }
document.querySelector("#workspaceClose").addEventListener("click", closeWorkspace);
workspaceBackdrop.addEventListener("click", e => { if (e.target === workspaceBackdrop) closeWorkspace(); });
workspaceContent.addEventListener("click", event => {
  if (event.target.id === "addCustomer") document.querySelector("#customerForm").classList.toggle("visible");
  if (event.target.id === "backToCustomers") openWorkspace("customers");
  if (event.target.id === "deleteCustomer") deleteCustomer(event.target.dataset.customerId);
  const edit = event.target.closest(".edit-customer");
  if (edit) openCustomerEditor(edit.dataset.customerId);
});
workspaceContent.addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.target;
  if (form.id === "customerForm" || form.id === "customerEditForm") {
    const fields = new FormData(form);
    const isEdit = form.id === "customerEditForm";
    const response = await fetch(`${API_BASE}/customers${isEdit ? `/${form.dataset.customerId}` : ""}`, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: fields.get("name"), email: fields.get("email"), risk_score: Number(fields.get("risk_score")), total_exposure: Number(fields.get("total_exposure")) }) });
    if (!response.ok) { showToast("Could not save customer. Check the fields and API."); return; }
    showToast(isEdit ? "Customer updated across the workspace." : "Customer saved to the database.");
    await Promise.all([loadLiveCases(), loadDashboardSummary()]);
    openWorkspace("customers");
  }
  if (form.id === "agentForm") {
    const answer = document.querySelector("#agentAnswer");
    answer.textContent = "Reviewing the live queue…";
    const response = await fetch(`${API_BASE}/agent/ask`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: new FormData(form).get("question") }) });
    if (!response.ok) { answer.textContent = "The assistant needs the SentinelIQ API to be running."; return; }
    const result = await response.json();
    answer.innerHTML = `<strong>Recommendation</strong><p>${result.answer}</p><small>Priority cases: ${result.suggested_cases.join(", ")}</small>`;
  }
});
async function openCustomerEditor(customerId) {
  const response = await fetch(`${API_BASE}/customers`);
  if (!response.ok) { showToast("Could not load customer details."); return; }
  const customer = (await response.json()).find(item => item.id === customerId);
  if (!customer) return;
  workspaceContent.innerHTML = `<p class="eyebrow">CUSTOMER PROFILE</p><h2 id="workspaceTitle">Edit ${customer.name}</h2><p class="workspace-intro">Changes update the stored customer and linked active risk case.</p><form class="customer-form visible" id="customerEditForm" data-customer-id="${customer.id}"><label>Name<input name="name" required value="${customer.name}"></label><label>Email<input name="email" type="email" placeholder="Optional email" value="${customer.email || ""}"></label><label>Risk score<input name="risk_score" type="number" min="0" max="100" value="${customer.risk_score}"></label><label>Exposure (₹)<input name="total_exposure" type="number" min="0" value="${customer.total_exposure}"></label><button class="decision primary" type="submit">Save changes</button></form><div class="editor-actions"><button class="text-button" id="backToCustomers">← Back to customers</button><button class="delete-customer" id="deleteCustomer" data-customer-id="${customer.id}">Delete customer</button></div>`;
}
async function deleteCustomer(customerId) {
  if (!window.confirm("Delete this customer and all linked risk cases? This cannot be undone.")) return;
  const response = await fetch(`${API_BASE}/customers/${customerId}`, { method: "DELETE" });
  if (!response.ok) { showToast("Could not delete customer."); return; }
  showToast("Customer and linked cases deleted.");
  await Promise.all([loadLiveCases(), loadDashboardSummary()]);
  openWorkspace("customers");
}
document.querySelector("#agentButton").addEventListener("click", () => openWorkspace("agent"));
document.querySelectorAll(".nav-item").forEach(link => link.addEventListener("click", event => {
  document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
  link.classList.add("active");
  const view = link.getAttribute("href").slice(1);
  if (workspaceRoutes[view]) { event.preventDefault(); openWorkspace(view); }
}));
