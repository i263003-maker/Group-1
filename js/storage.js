/**
 * GameHubStorage
 * Persistent data & GitHub repository sync layer for the Game Review Hub.
 *
 * Persistence model:
 * 1. Reads initial catalog & reviews from GitHub Contents API (if configured),
 *    else from ./data/games.json, else from window.DEFAULT_HUB_DATA.
 * 2. Caches local edits/reviews in localStorage immediately so updates are instant.
 * 3. When GitHub repo + Fine-Grained PAT are configured in the user's browser,
 *    commits changes directly to data/games.json in the repository for permanent,
 *    cross-device persistence on GitHub Pages.
 * 4. Also exposes a clean wishlist interface ready to connect to user accounts later.
 */
(function (global) {
  const STORAGE_KEYS = {
    HUB_DATA: "gamehub.data.v1",
    GITHUB_CONFIG: "gamehub.github.config.v1",
    WISHLIST: "gamehub.wishlist.v1"
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

  function normalizeHubData(raw) {
    const base = raw && typeof raw === "object" ? raw : {};
    return {
      games: Array.isArray(base.games) ? base.games : [],
      submissions: Array.isArray(base.submissions) ? base.submissions : []
    };
  }

  function readLocalHubData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HUB_DATA);
      if (!raw) return null;
      return normalizeHubData(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  function writeLocalHubData(data) {
    const normalized = normalizeHubData(data);
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
    return normalizeHubData(clone(global.DEFAULT_HUB_DATA || { games: [], submissions: [] }));
  }

  async function loadHubData({ forceRemote = false } = {}) {
    const cfg = getGitHubConfig();

    if (forceRemote && isGitHubReadConfigured(cfg)) {
      const remote = await fetchFromGitHubRepo(cfg);
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
        writeLocalHubData(remote.data);
        return { data: remote.data, source: "github" };
      } catch {
        // Fall through to bundled file/seed
      }
    }

    const seed = await loadSeedData();
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

  let accountWishlistAdapter = null;

  function registerWishlistAdapter(adapter) {
    accountWishlistAdapter = adapter;
  }

  function getWishlist() {
    if (accountWishlistAdapter && typeof accountWishlistAdapter.getAll === "function") {
      return accountWishlistAdapter.getAll();
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function isWishlisted(gameId) {
    return getWishlist().includes(gameId);
  }

  function toggleWishlist(gameId) {
    if (accountWishlistAdapter && typeof accountWishlistAdapter.toggle === "function") {
      return accountWishlistAdapter.toggle(gameId);
    }
    const list = new Set(getWishlist());
    let wishlisted = false;
    if (list.has(gameId)) {
      list.delete(gameId);
      wishlisted = false;
    } else {
      list.add(gameId);
      wishlisted = true;
    }
    const updated = Array.from(list);
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(updated));
    return { wishlisted, count: updated.length, mode: "local-preview" };
  }

  global.GameHubStorage = {
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
    getWishlist,
    isWishlisted,
    toggleWishlist,
    registerWishlistAdapter
  };
})(window);
