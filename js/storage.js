/**
 * GameHubStorage
 * Persistent data, GitHub repository sync, and per-account Wishlist store.
 *
 * Persistence model:
 * 1. Reads initial catalog, submissions, and per-account wishlists from GitHub
 *    Contents API (if configured), else ./data/games.json, else DEFAULT_HUB_DATA.
 * 2. Saves edits, reviews, submissions, and per-account wishlists immediately in
 *    localStorage so updates survive reloads right away.
 * 3. When GitHub Repo + Fine-Grained PAT are configured, commits changes directly
 *    to data/games.json for permanent cross-device persistence.
 * 4. Per-account wishlists live in BOTH localStorage ("ratinghub.wishlistsByAccount.v1")
 *    and data/games.json ("wishlists": { "<accountId>": ["game-id", ...] }) so your
 *    account system can call GameHubStorage.setCurrentAccount(userId) and
 *    GameHubStorage.getWishlist(userId) directly once login is connected.
 */
(function (global) {
  const STORAGE_KEYS = {
    HUB_DATA: "ratinghub.data.v1",
    GITHUB_CONFIG: "ratinghub.github.config.v1",
    WISHLISTS_BY_ACCOUNT: "ratinghub.wishlistsByAccount.v1",
    CURRENT_ACCOUNT: "ratinghub.currentAccount.v1"
  };

  const DEFAULT_DATA_PATH = "data/games.json";

  function toBase64Utf8(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function fromBase64Utf8(base64) {
    const cleaned = base64.replace(/\s+/g, "");
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function normalizeAccountId(accountId) {
    const cleaned = String(accountId || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._@-]+/g, "_");
    return cleaned || "guest";
  }

  function getCurrentAccount() {
    if (global.RATINGHUB_CURRENT_ACCOUNT) {
      return normalizeAccountId(global.RATINGHUB_CURRENT_ACCOUNT);
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_ACCOUNT);
      return normalizeAccountId(stored || "guest");
    } catch {
      return "guest";
    }
  }

  function setCurrentAccount(accountId) {
    const normalized = normalizeAccountId(accountId);
    localStorage.setItem(STORAGE_KEYS.CURRENT_ACCOUNT, normalized);
    return normalized;
  }

  function getGitHubConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.GITHUB_CONFIG);
      if (!raw) {
        return { owner: "", repo: "", branch: "main", path: DEFAULT_DATA_PATH, token: "" };
      }
      const parsed = JSON.parse(raw);
      return {
        owner: (parsed.owner || "").trim(),
        repo: (parsed.repo || "").trim(),
        branch: (parsed.branch || "main").trim() || "main",
        path: (parsed.path || DEFAULT_DATA_PATH).trim() || DEFAULT_DATA_PATH,
        token: (parsed.token || "").trim()
      };
    } catch {
      return { owner: "", repo: "", branch: "main", path: DEFAULT_DATA_PATH, token: "" };
    }
  }

  function saveGitHubConfig(config) {
    const normalized = {
      owner: (config.owner || "").trim(),
      repo: (config.repo || "").trim(),
      branch: (config.branch || "main").trim() || "main",
      path: (config.path || DEFAULT_DATA_PATH).trim() || DEFAULT_DATA_PATH,
      token: (config.token || "").trim()
    };
    localStorage.setItem(STORAGE_KEYS.GITHUB_CONFIG, JSON.stringify(normalized));
    return normalized;
  }

  function isGitHubReadConfigured(cfg = getGitHubConfig()) {
    return Boolean(cfg.owner && cfg.repo);
  }

  function isGitHubWriteConfigured(cfg = getGitHubConfig()) {
    return Boolean(cfg.owner && cfg.repo && cfg.token);
  }

  function buildGitHubHeaders(token) {
    const headers = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  function normalizeWishlistsMap(rawMap) {
    const out = {};
    if (!rawMap || typeof rawMap !== "object" || Array.isArray(rawMap)) {
      return out;
    }
    Object.entries(rawMap).forEach(([acct, ids]) => {
      if (Array.isArray(ids)) {
        const key = normalizeAccountId(acct);
        out[key] = Array.from(new Set(ids.map(String).filter(Boolean)));
      }
    });
    return out;
  }

  function normalizeHubData(raw) {
    const base = raw && typeof raw === "object" ? raw : {};
    return {
      games: Array.isArray(base.games) ? base.games : [],
      submissions: Array.isArray(base.submissions) ? base.submissions : [],
      wishlists: normalizeWishlistsMap(base.wishlists)
    };
  }

  async function fetchFromGitHubRepo(cfg) {
    const url = `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(
      cfg.repo
    )}/contents/${cfg.path.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(
      cfg.branch
    )}`;

    const res = await fetch(url, {
      headers: buildGitHubHeaders(cfg.token),
      cache: "no-store"
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => res.statusText);
      throw new Error(`GitHub read failed (${res.status}): ${detail}`);
    }

    const payload = await res.json();
    const decoded = fromBase64Utf8(payload.content || "");
    const parsed = JSON.parse(decoded);
    return {
      data: normalizeHubData(parsed),
      sha: payload.sha
    };
  }

  async function commitToGitHubRepo(data, commitMessage) {
    const cfg = getGitHubConfig();
    if (!isGitHubWriteConfigured(cfg)) {
      return { synced: false, reason: "missing-config" };
    }

    const apiPath = cfg.path.split("/").map(encodeURIComponent).join("/");
    const url = `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(
      cfg.repo
    )}/contents/${apiPath}`;

    let currentSha = null;
    const getRes = await fetch(`${url}?ref=${encodeURIComponent(cfg.branch)}`, {
      headers: buildGitHubHeaders(cfg.token),
      cache: "no-store"
    });
    if (getRes.ok) {
      const existing = await getRes.json();
      currentSha = existing.sha || null;
    } else if (getRes.status !== 404) {
      const text = await getRes.text().catch(() => getRes.statusText);
      throw new Error(`Unable to inspect ${cfg.path} on GitHub (${getRes.status}): ${text}`);
    }

    const body = {
      message: commitMessage || `Update ${cfg.path} via RatingHub`,
      content: toBase64Utf8(JSON.stringify(data, null, 2) + "\n"),
      branch: cfg.branch
    };
    if (currentSha) {
      body.sha = currentSha;
    }

    const putRes = await fetch(url, {
      method: "PUT",
      headers: {
        ...buildGitHubHeaders(cfg.token),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!putRes.ok) {
      const errText = await putRes.text().catch(() => putRes.statusText);
      throw new Error(`GitHub commit failed (${putRes.status}): ${errText}`);
    }

    const result = await putRes.json();
    return {
      synced: true,
      commitSha: result.commit && result.commit.sha,
      htmlUrl: result.commit && result.commit.html_url
    };
  }

  function readLocalWishlistsMap() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.WISHLISTS_BY_ACCOUNT);
      if (!raw) return {};
      return normalizeWishlistsMap(JSON.parse(raw));
    } catch {
      return {};
    }
  }

  function writeLocalWishlistsMap(map) {
    const normalized = normalizeWishlistsMap(map);
    localStorage.setItem(STORAGE_KEYS.WISHLISTS_BY_ACCOUNT, JSON.stringify(normalized));
    return normalized;
  }

  function mergeWishlists(primaryMap, secondaryMap) {
    const merged = normalizeWishlistsMap(primaryMap);
    const extra = normalizeWishlistsMap(secondaryMap);
    Object.entries(extra).forEach(([acct, ids]) => {
      merged[acct] = Array.from(new Set([...(merged[acct] || []), ...ids]));
    });
    return merged;
  }

  function readLocalHubData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HUB_DATA);
      if (!raw) return null;
      const parsed = normalizeHubData(JSON.parse(raw));
      parsed.wishlists = mergeWishlists(parsed.wishlists, readLocalWishlistsMap());
      return parsed;
    } catch {
      return null;
    }
  }

  function writeLocalHubData(data) {
    const normalized = normalizeHubData(data);
    writeLocalWishlistsMap(normalized.wishlists);
    localStorage.setItem(STORAGE_KEYS.HUB_DATA, JSON.stringify(normalized));
    return normalized;
  }

  async function loadSeedData() {
    try {
      const res = await fetch("./data/games.json", { cache: "no-store" });
      if (res.ok) {
        return normalizeHubData(await res.json());
      }
    } catch {
      // Expected when opened directly via file://
    }
    return normalizeHubData(
      clone(global.DEFAULT_HUB_DATA || { games: [], submissions: [], wishlists: {} })
    );
  }

  async function loadHubData({ forceRemote = false } = {}) {
    const cfg = getGitHubConfig();

    if (forceRemote && isGitHubReadConfigured(cfg)) {
      const remote = await fetchFromGitHubRepo(cfg);
      remote.data.wishlists = mergeWishlists(remote.data.wishlists, readLocalWishlistsMap());
      writeLocalHubData(remote.data);
      return { data: remote.data, source: "github" };
    }

    const local = readLocalHubData();
    if (local && local.games.length > 0) {
      return { data: local, source: "localStorage" };
    }

    if (isGitHubReadConfigured(cfg)) {
      try {
        const remote = await fetchFromGitHubRepo(cfg);
        remote.data.wishlists = mergeWishlists(remote.data.wishlists, readLocalWishlistsMap());
        writeLocalHubData(remote.data);
        return { data: remote.data, source: "github" };
      } catch {
        // Fall through to bundled file/seed
      }
    }

    const seed = await loadSeedData();
    seed.wishlists = mergeWishlists(seed.wishlists, readLocalWishlistsMap());
    writeLocalHubData(seed);
    return { data: seed, source: "seed" };
  }

  async function persistHubData(data, commitMessage) {
    const normalized = writeLocalHubData(data);
    const cfg = getGitHubConfig();

    if (!isGitHubWriteConfigured(cfg)) {
      return { savedLocal: true, syncedGitHub: false };
    }

    const commitResult = await commitToGitHubRepo(normalized, commitMessage);
    return {
      savedLocal: true,
      syncedGitHub: commitResult.synced,
      commitSha: commitResult.commitSha,
      commitUrl: commitResult.htmlUrl
    };
  }

  async function getGameById(gameId) {
    const { data, source } = await loadHubData();
    if (!data.games.length) {
      return { game: null, data, source };
    }
    const found = gameId ? data.games.find((g) => g.id === gameId) : data.games[0];
    return { game: found || null, data, source };
  }

  async function updateGameInfo(gameId, updates) {
    const { data } = await loadHubData();
    const index = data.games.findIndex((g) => g.id === gameId);
    if (index === -1) {
      throw new Error(`Game "${gameId}" not found.`);
    }

    const existing = data.games[index];
    const updated = {
      ...existing,
      ...updates,
      id: existing.id,
      reviews: existing.reviews || []
    };
    data.games[index] = updated;

    const persistResult = await persistHubData(data, `Update game info: ${updated.title}`);
    return { game: updated, persistResult };
  }

  async function addReview(gameId, reviewInput) {
    const { data } = await loadHubData();
    const index = data.games.findIndex((g) => g.id === gameId);
    if (index === -1) {
      throw new Error(`Game "${gameId}" not found.`);
    }

    const game = data.games[index];
    const review = {
      id: `rev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      author: (reviewInput.author || "Anonymous Player").trim(),
      score: Number(reviewInput.score),
      platform: (reviewInput.platform || "PC").trim(),
      headline: (reviewInput.headline || "").trim(),
      body: (reviewInput.body || "").trim(),
      pros: Array.isArray(reviewInput.pros) ? reviewInput.pros : [],
      cons: Array.isArray(reviewInput.cons) ? reviewInput.cons : [],
      createdAt: new Date().toISOString()
    };

    game.reviews = [review, ...(game.reviews || [])];
    const persistResult = await persistHubData(
      data,
      `Add review by ${review.author} for ${game.title}`
    );
    return { review, game, persistResult };
  }

  async function deleteReview(gameId, reviewId) {
    const { data } = await loadHubData();
    const index = data.games.findIndex((g) => g.id === gameId);
    if (index === -1) {
      throw new Error(`Game "${gameId}" not found.`);
    }

    const game = data.games[index];
    game.reviews = (game.reviews || []).filter((r) => r.id !== reviewId);
    const persistResult = await persistHubData(data, `Remove review ${reviewId} from ${game.title}`);
    return { game, persistResult };
  }

  async function submitGameForReview(submissionInput) {
    const { data } = await loadHubData();
    const submission = {
      id: `sub-${Date.now().toString(36)}`,
      title: (submissionInput.title || "").trim(),
      developer: (submissionInput.developer || "").trim(),
      platforms: (submissionInput.platforms || "").trim(),
      releaseWindow: (submissionInput.releaseWindow || "").trim(),
      officialUrl: (submissionInput.officialUrl || "").trim(),
      coverImage: (submissionInput.coverImage || "").trim(),
      coverFileName: (submissionInput.coverFileName || "").trim(),
      notes: (submissionInput.notes || "").trim(),
      submittedBy: (submissionInput.submittedBy || "Community Member").trim(),
      status: "pending_review",
      createdAt: new Date().toISOString()
    };

    data.submissions = [submission, ...(data.submissions || [])];
    const persistResult = await persistHubData(
      data,
      `Submit game for review: ${submission.title}`
    );
    return { submission, persistResult };
  }

  function buildGitHubIssueUrl({ title, body, labels = [] }) {
    const cfg = getGitHubConfig();
    if (!cfg.owner || !cfg.repo) return null;
    const base = `https://github.com/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(
      cfg.repo
    )}/issues/new`;
    const params = new URLSearchParams();
    params.set("title", title);
    params.set("body", body);
    if (labels.length) {
      params.set("labels", labels.join(","));
    }
    return `${base}?${params.toString()}`;
  }

  async function exportGamesJson() {
    const { data } = await loadHubData();
    const blob = new Blob([JSON.stringify(data, null, 2) + "\n"], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "games.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function resetLocalCacheToSeed() {
    localStorage.removeItem(STORAGE_KEYS.HUB_DATA);
    return loadHubData({ forceRemote: isGitHubReadConfigured() });
  }

  /**
   * Per-Account Permanent Wishlist Store
   * Stores wishlists keyed by accountId in BOTH:
   * - localStorage ("ratinghub.wishlistsByAccount.v1")
   * - data/games.json ("wishlists": { "<accountId>": ["game-id"] }) & GitHub repo
   * Optional external backend adapter can also be plugged in via registerWishlistAdapter.
   */
  let accountWishlistAdapter = null;

  function registerWishlistAdapter(adapter) {
    accountWishlistAdapter = adapter;
  }

  function getAllWishlistsByAccount() {
    const localHub = readLocalHubData();
    const hubMap = localHub ? localHub.wishlists : {};
    return mergeWishlists(hubMap, readLocalWishlistsMap());
  }

  function getWishlist(accountId = getCurrentAccount()) {
    const acct = normalizeAccountId(accountId);
    if (accountWishlistAdapter && typeof accountWishlistAdapter.getAll === "function") {
      return accountWishlistAdapter.getAll(acct);
    }
    const map = getAllWishlistsByAccount();
    return Array.isArray(map[acct]) ? map[acct] : [];
  }

  function isWishlisted(gameId, accountId = getCurrentAccount()) {
    return getWishlist(accountId).includes(gameId);
  }

  async function toggleWishlist(gameId, accountId = getCurrentAccount()) {
    const acct = normalizeAccountId(accountId);
    if (accountWishlistAdapter && typeof accountWishlistAdapter.toggle === "function") {
      return accountWishlistAdapter.toggle(gameId, acct);
    }

    const map = getAllWishlistsByAccount();
    const list = new Set(map[acct] || []);
    let wishlisted = false;
    if (list.has(gameId)) {
      list.delete(gameId);
      wishlisted = false;
    } else {
      list.add(gameId);
      wishlisted = true;
    }

    const updatedList = Array.from(list);
    map[acct] = updatedList;
    writeLocalWishlistsMap(map);

    const { data } = await loadHubData();
    data.wishlists = normalizeWishlistsMap({ ...(data.wishlists || {}), [acct]: updatedList });
    const persistResult = await persistHubData(
      data,
      `Update wishlist for account ${acct} (${gameId})`
    );

    return {
      accountId: acct,
      wishlisted,
      count: updatedList.length,
      items: updatedList,
      persistResult
    };
  }

  global.GameHubStorage = {
    getCurrentAccount,
    setCurrentAccount,
    getGitHubConfig,
    saveGitHubConfig,
    isGitHubReadConfigured,
    isGitHubWriteConfigured,
    loadHubData,
    getGameById,
    updateGameInfo,
    addReview,
    deleteReview,
    submitGameForReview,
    buildGitHubIssueUrl,
    exportGamesJson,
    resetLocalCacheToSeed,
    getAllWishlistsByAccount,
    getWishlist,
    isWishlisted,
    toggleWishlist,
    registerWishlistAdapter
  };
})(window);
