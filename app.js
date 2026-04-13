const STORAGE_KEY = "orbit-vault-state";

const sampleVaults = [
  {
    id: crypto.randomUUID(),
    title: "Community Solar Fund",
    asset: "XLM",
    goal: 1800,
    saved: 940,
    cadence: "Monthly",
    targetDate: "2026-10-30",
    story: "Pooling small recurring deposits for shared clean-energy hardware.",
    owner: "GDF4...SOLAR",
    members: 11,
    createdAt: Date.now() - 1000 * 60 * 60 * 26
  },
  {
    id: crypto.randomUUID(),
    title: "Creator Equipment Vault",
    asset: "USDC",
    goal: 950,
    saved: 410,
    cadence: "Weekly",
    targetDate: "2026-07-16",
    story: "A transparent reserve for camera upgrades and recurring livestream tools.",
    owner: "GBR7...CRE8R",
    members: 4,
    createdAt: Date.now() - 1000 * 60 * 60 * 10
  },
  {
    id: crypto.randomUUID(),
    title: "Mutual Aid Sprint",
    asset: "XLM",
    goal: 600,
    saved: 570,
    cadence: "Biweekly",
    targetDate: "2026-05-28",
    story: "Fast-access collective savings with future milestone-based unlocks.",
    owner: "GCN3...AID9",
    members: 8,
    createdAt: Date.now() - 1000 * 60 * 60 * 4
  }
];

const sampleActivity = [
  {
    id: crypto.randomUUID(),
    label: "Demo vaults loaded",
    detail: "Seeded three realistic prototype vaults for the dashboard.",
    timestamp: Date.now() - 1000 * 60 * 20
  }
];

const state = loadState();

const elements = {
  connectButton: document.getElementById("connect-button"),
  seedButton: document.getElementById("seed-button"),
  walletLabel: document.getElementById("wallet-label"),
  vaultCount: document.getElementById("vault-count"),
  savedTotal: document.getElementById("saved-total"),
  averageProgress: document.getElementById("average-progress"),
  statusChip: document.getElementById("status-chip"),
  vaultList: document.getElementById("vault-list"),
  activityList: document.getElementById("activity-list"),
  form: document.getElementById("vault-form"),
  toast: document.getElementById("toast"),
  titleInput: document.getElementById("title-input"),
  goalInput: document.getElementById("goal-input"),
  assetInput: document.getElementById("asset-input"),
  cadenceInput: document.getElementById("cadence-input"),
  dateInput: document.getElementById("date-input"),
  storyInput: document.getElementById("story-input")
};

setDefaultDate();
bindEvents();
render();

function loadState() {
  const fallback = {
    wallet: "",
    vaults: [],
    activity: []
  };

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      wallet: parsed.wallet || "",
      vaults: Array.isArray(parsed.vaults) ? parsed.vaults : [],
      activity: Array.isArray(parsed.activity) ? parsed.activity : []
    };
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function bindEvents() {
  elements.connectButton.addEventListener("click", connectWallet);
  elements.seedButton.addEventListener("click", loadDemoVaults);
  elements.form.addEventListener("submit", handleCreateVault);
}

function setDefaultDate() {
  if (elements.dateInput.value) {
    return;
  }

  const target = new Date();
  target.setDate(target.getDate() + 45);
  elements.dateInput.value = target.toISOString().split("T")[0];
}

function connectWallet() {
  if (state.wallet) {
    state.wallet = "";
    pushActivity("Wallet disconnected", "Returned to local demo mode.");
    showToast("Demo wallet disconnected");
  } else {
    state.wallet = buildDemoWallet();
    pushActivity("Wallet connected", `Connected ${truncateWallet(state.wallet)} in demo mode.`);
    showToast("Demo wallet connected");
  }

  saveState();
  render();
}

function loadDemoVaults() {
  state.vaults = structuredClone(sampleVaults);
  state.activity = [...structuredClone(sampleActivity), ...state.activity].slice(0, 10);
  saveState();
  render();
  showToast("Demo vaults loaded");
}

function handleCreateVault(event) {
  event.preventDefault();

  const title = elements.titleInput.value.trim();
  const goal = Number(elements.goalInput.value);
  const targetDate = elements.dateInput.value;

  if (!title || !goal || !targetDate) {
    showToast("Fill in the vault basics first");
    return;
  }

  const vault = {
    id: crypto.randomUUID(),
    title,
    asset: elements.assetInput.value,
    goal,
    saved: 0,
    cadence: elements.cadenceInput.value,
    targetDate,
    story: elements.storyInput.value.trim() || "A new savings vault ready for future onchain logic.",
    owner: state.wallet ? truncateWallet(state.wallet) : "Local founder",
    members: 1,
    createdAt: Date.now()
  };

  state.vaults.unshift(vault);
  pushActivity("Vault created", `${title} was added as a new prototype vault.`);
  saveState();
  render();
  elements.form.reset();
  setDefaultDate();
  showToast("Prototype vault created");
}

function contributeToVault(vaultId, amount) {
  const vault = state.vaults.find((item) => item.id === vaultId);
  if (!vault) {
    return;
  }

  vault.saved = Math.min(vault.goal, vault.saved + amount);
  pushActivity("Contribution added", `${amount} ${vault.asset} moved into ${vault.title}.`);
  saveState();
  render();
  showToast(`${amount} ${vault.asset} added to ${vault.title}`);
}

function releaseVault(vaultId) {
  const vault = state.vaults.find((item) => item.id === vaultId);
  if (!vault) {
    return;
  }

  pushActivity("Release flow planned", `${vault.title} is marked for future Soroban release logic.`);
  saveState();
  render();
  showToast("Release logic is intentionally left for the next build phase");
}

function pushActivity(label, detail) {
  state.activity.unshift({
    id: crypto.randomUUID(),
    label,
    detail,
    timestamp: Date.now()
  });

  state.activity = state.activity.slice(0, 12);
}

function render() {
  renderHeader();
  renderVaults();
  renderActivity();
}

function renderHeader() {
  const totalSaved = state.vaults.reduce((sum, vault) => sum + vault.saved, 0);
  const average = state.vaults.length
    ? Math.round(
        state.vaults.reduce((sum, vault) => sum + Math.min(100, percent(vault.saved, vault.goal)), 0) /
          state.vaults.length
      )
    : 0;

  elements.walletLabel.textContent = state.wallet ? truncateWallet(state.wallet) : "Not connected";
  elements.connectButton.textContent = state.wallet ? "Disconnect Demo Wallet" : "Connect Demo Wallet";
  elements.vaultCount.textContent = String(state.vaults.length);
  elements.savedTotal.textContent = `${formatAmount(totalSaved)} units`;
  elements.averageProgress.textContent = `${average}%`;
  elements.statusChip.textContent = state.vaults.length ? "Prototype vaults loaded" : "Waiting for demo data";
}

function renderVaults() {
  if (!state.vaults.length) {
    elements.vaultList.innerHTML = `
      <div class="empty-state">
        <div>
          <strong>No vaults yet.</strong>
          <p>Load the sample board or create your first demo vault to shape the story.</p>
        </div>
      </div>
    `;
    return;
  }

  elements.vaultList.innerHTML = state.vaults
    .map((vault) => {
      const progress = percent(vault.saved, vault.goal);
      const target = new Date(vault.targetDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      });

      return `
        <article class="vault-card">
          <div class="status-row">
            <div>
              <h4>${escapeHtml(vault.title)}</h4>
              <p>${escapeHtml(vault.story)}</p>
            </div>
            <span class="mini-pill">${progress}% funded</span>
          </div>

          <div class="vault-tags">
            <span class="tag">${escapeHtml(vault.asset)}</span>
            <span class="tag">${escapeHtml(vault.cadence)}</span>
            <span class="tag">Target ${target}</span>
            <span class="tag">${vault.members} members</span>
          </div>

          <div>
            <div class="status-row">
              <strong>${formatAmount(vault.saved)} / ${formatAmount(vault.goal)} ${escapeHtml(vault.asset)}</strong>
              <span>${escapeHtml(vault.owner)}</span>
            </div>
            <div class="progress-shell">
              <div class="progress-bar" style="width: ${progress}%"></div>
            </div>
          </div>

          <div class="vault-card-footer">
            <div class="vault-actions">
              <button class="inline-button accent" data-action="add-50" data-id="${vault.id}">Add 50</button>
              <button class="inline-button" data-action="add-100" data-id="${vault.id}">Add 100</button>
              <button class="inline-button" data-action="release" data-id="${vault.id}">Plan Release</button>
            </div>
            <strong>${vault.goal - vault.saved} ${escapeHtml(vault.asset)} left</strong>
          </div>
        </article>
      `;
    })
    .join("");

  elements.vaultList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const { action, id } = button.dataset;
      if (action === "add-50") {
        contributeToVault(id, 50);
      }
      if (action === "add-100") {
        contributeToVault(id, 100);
      }
      if (action === "release") {
        releaseVault(id);
      }
    });
  });
}

function renderActivity() {
  if (!state.activity.length) {
    elements.activityList.innerHTML = `
      <div class="empty-state">
        <div>
          <strong>No activity yet.</strong>
          <p>Connect a demo wallet or create a vault to populate the timeline.</p>
        </div>
      </div>
    `;
    return;
  }

  elements.activityList.innerHTML = state.activity
    .map(
      (item) => `
        <article class="activity-item">
          <div class="activity-badge">${item.label.charAt(0)}</div>
          <div>
            <strong>${escapeHtml(item.label)}</strong>
            <p>${escapeHtml(item.detail)}</p>
            <div class="activity-time">${timeAgo(item.timestamp)}</div>
          </div>
        </article>
      `
    )
    .join("");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    elements.toast.classList.remove("visible");
  }, 2200);
}

function buildDemoWallet() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let wallet = "G";
  for (let index = 0; index < 15; index += 1) {
    wallet += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return wallet;
}

function truncateWallet(value) {
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function percent(saved, goal) {
  if (!goal) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round((saved / goal) * 100)));
}

function formatAmount(value) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0
  }).format(value);
}

function timeAgo(timestamp) {
  const diffMinutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
