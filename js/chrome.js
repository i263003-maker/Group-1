(function () {
  "use strict";

  const state = window.RatingHubState;
  const catalog = () => window.GAME_HUB || { games: [], updates: [] };
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
  const pageUrl = (path) => new URL(path, document.baseURI).href;

  function toast(message) {
    let region = document.getElementById("toast-region");
    if (!region) {
      region = document.createElement("div");
      region.id = "toast-region";
      region.className = "toast-region";
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    const item = document.createElement("div");
    item.className = "toast";
    item.textContent = message;
    region.appendChild(item);
    window.setTimeout(() => item.remove(), 3900);
  }

  function resolveTheme(preference) {
    if (preference === "light" || preference === "dark") return preference;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function applyTheme(preference, save) {
    const choice = preference || state.getTheme() || "system";
    document.documentElement.dataset.theme = resolveTheme(choice);
    if (save) state.setTheme(choice);
    document.querySelectorAll("[data-theme-choice]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.themeChoice === choice);
    });
  }

  function mountHeader() {
    const host = document.getElementById("site-header-mount");
    if (!host) return;
    const currentPage = document.body.dataset.page || "";
    const links = [
      ["home", "Home", "pages/home.html", "⌂"],
      ["wishlist", "Wishlist", "pages/wishlist.html", "♡"],
      ["demand", "Demand Games", "pages/demand.html", "+"],
      ["compare", "Compare", "pages/compare.html", "⇄"],
      ["about", "About", "pages/about.html", "▣"]
    ];
    host.innerHTML = `
      <header class="site-header">
        <div class="container header-inner">
          <a class="brand-link" href="${pageUrl("pages/home.html")}" aria-label="Rating Hub home">
            <img class="brand-logo" src="${pageUrl("img/logo.png")}" alt="Rating Hub logo">
          </a>
          <button class="header-menu" type="button" id="nav-menu-toggle" aria-expanded="false" aria-label="Toggle navigation">☰</button>
          <nav class="main-nav" id="main-nav" aria-label="Main navigation">
            ${links.map(([key, label, href, icon]) => `
              <a class="nav-link" href="${pageUrl(href)}" ${currentPage === key ? 'aria-current="page"' : ""}>
                <span class="nav-label">${label}</span><span class="nav-hover-icon" aria-hidden="true">${icon}</span>
              </a>`).join("")}
          </nav>
        </div>
      </header>`;

    document.getElementById("nav-menu-toggle").addEventListener("click", (event) => {
      const nav = document.getElementById("main-nav");
      const open = nav.classList.toggle("is-open");
      event.currentTarget.setAttribute("aria-expanded", String(open));
    });
  }

  function renderAuthPanel() {
    const mount = document.getElementById("auth-panel-mount");
    if (!mount) return;
    const user = state.getCurrentUser();
    const points = Number(user?.points || 0);
    const level = Math.floor(points / 5) + 1;
    mount.innerHTML = user ? `
      <div class="auth-wrap">
        <div class="auth-panel">
          <button class="auth-user-btn" id="account-menu-toggle" type="button" aria-expanded="false">
            <span class="auth-avatar">${escapeHtml(user.username.slice(0, 1).toUpperCase())}</span>
            <span>${escapeHtml(user.username)}</span>
          </button>
          <span class="auth-separator" aria-hidden="true"></span>
          <button class="auth-badge-btn" id="redeem-open" type="button" title="${points} redeem points">✦ Lv.${level} · ${points}</button>
        </div>
        <div class="account-menu" id="account-menu">
          <a href="${pageUrl("pages/profile.html")}">My profile</a>
          <a href="${pageUrl("pages/wishlist.html")}">Wishlist (${state.getWishlist().length})</a>
          <button class="redeem-item" id="redeem-menu-open" type="button">Redeem badge</button>
          <button id="logout-action" type="button">Log out</button>
        </div>
      </div>` : `
      <div class="auth-wrap">
        <div class="auth-panel">
          <a class="auth-user-btn" href="${pageUrl("pages/login.html")}">Log in</a>
          <span class="auth-separator" aria-hidden="true"></span>
          <button class="auth-badge-btn" id="redeem-open" type="button" title="Search rank badge">✦ Lv.1 · 0</button>
        </div>
      </div>`;

    const toggle = document.getElementById("account-menu-toggle");
    toggle?.addEventListener("click", () => {
      const menu = document.getElementById("account-menu");
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    document.getElementById("logout-action")?.addEventListener("click", () => {
      state.logout();
      toast("You are signed out.");
      window.setTimeout(() => window.location.reload(), 160);
    });
    document.getElementById("redeem-open")?.addEventListener("click", openRedeemModal);
    document.getElementById("redeem-menu-open")?.addEventListener("click", openRedeemModal);
  }

  function openRedeemModal() {
    const user = state.getCurrentUser();
    const points = Number(user?.points || 0);
    const level = Math.floor(points / 5) + 1;
    const next = level * 5;
    const progress = Math.min(100, (points % 5) * 20);
    const root = document.getElementById("modal-root");
    root.innerHTML = `
      <div class="modal-backdrop" id="redeem-modal" role="presentation">
        <section class="modal" role="dialog" aria-modal="true" aria-labelledby="redeem-title">
          <div class="modal-head"><h2 id="redeem-title">Search rank & redeem</h2><button class="modal-close" data-close-modal aria-label="Close">×</button></div>
          <p class="muted">${user ? `Welcome, ${escapeHtml(user.username)}.` : "Sign in to earn redeem points for every search."} Rank up every five searches.</p>
          <div class="modal-progress"><span style="width:${progress}%"></span></div>
          <p><strong class="accent">Level ${level}</strong> · ${points} points · ${next - points} searches to Level ${level + 1}</p>
          ${user ? "" : `<a class="button" href="${pageUrl("pages/login.html")}">Log in</a>`}
          <p class="muted">Points and rank are stored in this browser profile.</p>
        </section>
      </div>`;
    root.querySelector("[data-close-modal]").addEventListener("click", () => { root.innerHTML = ""; });
    root.querySelector(".modal-backdrop").addEventListener("click", (event) => {
      if (event.target === event.currentTarget) root.innerHTML = "";
    });
  }

  function mountUtility() {
    const host = document.getElementById("utility-strip-mount");
    if (!host) return;
    host.innerHTML = `
      <section class="utility-strip">
        <div class="container utility-row">
          <div class="search-cluster">
            <div class="search-bubble-wrap">
              <button class="notif-dot-btn" id="updates-toggle" type="button" aria-label="Recent game updates" title="Recent updates"></button>
              <form class="search-bubble" id="global-search" role="search">
                <span class="search-bubble-icon" aria-hidden="true">⌕</span>
                <input class="search-bubble-input" id="global-search-input" type="search" placeholder="Search games..." autocomplete="off" aria-label="Search games">
                <button class="search-go-btn" type="submit">Search</button>
              </form>
              <div class="updates-popover" id="updates-popover" role="dialog" aria-label="Recent game notifications">
                <div class="updates-head"><span class="updates-title"><i class="status-dot"></i> Recent game updates</span><button class="button-quiet" id="updates-sync" type="button">Refresh</button></div>
                <div class="updates-list" id="updates-list"></div>
                <div class="updates-footer"><a href="${pageUrl("pages/demand.html")}">Request a game →</a><a href="${pageUrl("pages/about.html")}">About the hub</a></div>
              </div>
            </div>
            <div class="adjacent-search-panel" id="quick-search-panel">
              <div class="adjacent-panel-head"><span id="quick-search-count">Matching games</span><a id="quick-search-all" href="${pageUrl("pages/search.html")}">View all →</a></div>
              <div id="quick-search-list"></div>
            </div>
            <div class="switch-wrap">
              <button class="switch-trigger" id="quick-switch-toggle" type="button" aria-expanded="false">Quick switch <span aria-hidden="true">⌄</span></button>
              <div class="switch-panel" id="quick-switch-panel">
                <button type="button" data-sort="rating-desc">Top rated</button>
                <button type="button" data-sort="year-desc">Recently released</button>
                <button type="button" data-sort="rating-desc">Trending picks</button>
                <button type="button" data-sort="year-asc">Classics first</button>
              </div>
            </div>
          </div>
          <div id="auth-panel-mount"></div>
        </div>
      </section>`;
    renderAuthPanel();
    bindUtilityEvents();
  }

  function renderUpdates() {
    const list = document.getElementById("updates-list");
    if (!list) return;
    const updates = catalog().updates || [];
    list.innerHTML = updates.map((item) => {
      const match = catalog().games.find((game) =>
        window.RatingHubSearch.normalize(game.title) === window.RatingHubSearch.normalize(item.gameTitle)
      );
      return `
      <a class="update-card" href="${pageUrl(match ? `pages/game.html?id=${encodeURIComponent(match.id)}` : `pages/search.html?q=${encodeURIComponent(item.gameTitle)}`)}">
        <div class="update-card-top"><span>${escapeHtml(item.gameTitle)}</span><span class="update-card-badge">${escapeHtml(item.badge)}</span></div>
        <div class="update-card-body">${escapeHtml(item.comment)}</div>
        <div class="update-card-meta"><span>By ${escapeHtml(item.reviewer)}</span><span>★ ${Number(item.rating).toFixed(1)} · ${escapeHtml(item.timestamp)}</span></div>
      </a>`;
    }).join("") || `<p class="muted">No updates to show yet.</p>`;
  }

  function bindUtilityEvents() {
    const form = document.getElementById("global-search");
    const input = document.getElementById("global-search-input");
    const quickPanel = document.getElementById("quick-search-panel");
    const updatePanel = document.getElementById("updates-popover");
    const switchPanel = document.getElementById("quick-switch-panel");
    const updateToggle = document.getElementById("updates-toggle");
    let debounce;

    function renderQuickSearch(query) {
      const q = query.trim();
      if (!q) {
        quickPanel.classList.remove("is-visible");
        return;
      }
      const matches = window.RatingHubSearch.search(q, { sort: "relevance" }).slice(0, 5);
      document.getElementById("quick-search-count").textContent = `${matches.length} quick match${matches.length === 1 ? "" : "es"}`;
      const all = document.getElementById("quick-search-all");
      all.href = pageUrl(`pages/search.html?q=${encodeURIComponent(q)}`);
      document.getElementById("quick-search-list").innerHTML = matches.map((game) => `
        <div class="adjacent-item" data-open-game="${escapeHtml(game.id)}">
          <div><div class="adjacent-item-title">${escapeHtml(game.title)}</div><div class="adjacent-item-sub">${escapeHtml(game.genres.join(" · "))} · ${game.year || "Year TBA"}</div></div>
          <span class="adjacent-item-meta">★ ${Number(game.rating).toFixed(1)}</span>
        </div>`).join("") || `<div class="adjacent-item-sub">No quick match. Press Enter for the full index.</div>`;
      quickPanel.classList.add("is-visible");
      quickPanel.querySelectorAll("[data-open-game]").forEach((node) => {
        node.addEventListener("click", () => { window.location.href = pageUrl(`pages/game.html?id=${encodeURIComponent(node.dataset.openGame)}`); });
      });
    }

    input.addEventListener("input", () => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(() => renderQuickSearch(input.value), 80);
    });
    input.addEventListener("focus", () => {
      document.getElementById("global-search").classList.add("is-expanded");
      renderQuickSearch(input.value);
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = input.value.trim();
      if (!query) { input.focus(); return; }
      state.awardSearchPoint();
      const url = new URL(pageUrl("pages/search.html"));
      url.searchParams.set("q", query);
      window.location.href = url.href;
    });
    updateToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const open = updatePanel.classList.toggle("is-open");
      switchPanel.classList.remove("is-open");
      if (open) renderUpdates();
    });
    document.getElementById("updates-sync").addEventListener("click", renderUpdates);
    document.getElementById("quick-switch-toggle").addEventListener("click", (event) => {
      event.stopPropagation();
      const open = switchPanel.classList.toggle("is-open");
      event.currentTarget.classList.toggle("is-open", open);
      event.currentTarget.setAttribute("aria-expanded", String(open));
      updatePanel.classList.remove("is-open");
    });
    switchPanel.querySelectorAll("[data-sort]").forEach((button) => {
      button.addEventListener("click", () => {
        const url = new URL(pageUrl("pages/search.html"));
        url.searchParams.set("sort", button.dataset.sort);
        window.location.href = url.href;
      });
    });
    document.addEventListener("click", (event) => {
      if (!updatePanel.contains(event.target) && event.target !== updateToggle) updatePanel.classList.remove("is-open");
      if (!switchPanel.contains(event.target) && !event.target.closest("#quick-switch-toggle")) switchPanel.classList.remove("is-open");
      if (!quickPanel.contains(event.target) && !event.target.closest(".search-bubble-wrap")) quickPanel.classList.remove("is-visible");
      const accountMenu = document.getElementById("account-menu");
      if (accountMenu && !accountMenu.contains(event.target) && !event.target.closest("#account-menu-toggle")) accountMenu.classList.remove("is-open");
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        updatePanel.classList.remove("is-open");
        switchPanel.classList.remove("is-open");
        quickPanel.classList.remove("is-visible");
        document.getElementById("modal-root").innerHTML = "";
      }
    });
  }

  function mountFooter() {
    const host = document.getElementById("site-footer-mount");
    if (!host) return;
    host.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-inner">
          <span>© 2026 Rating Hub · Play more. Choose better.</span>
          <div class="footer-links"><a href="${pageUrl("pages/about.html")}">About</a><a href="${pageUrl("pages/demand.html")}">Request a game</a><a href="${pageUrl("pages/compare.html")}">Compare</a></div>
          <div class="social-links"><a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a><a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a><a href="https://x.com" target="_blank" rel="noopener noreferrer">X</a></div>
        </div>
      </footer>`;
  }

  function mountThemeDock() {
    const dock = document.createElement("div");
    dock.className = "theme-dock";
    dock.setAttribute("role", "group");
    dock.setAttribute("aria-label", "Color theme");
    dock.innerHTML = `
      <button type="button" data-theme-choice="system">System</button>
      <button type="button" data-theme-choice="dark">Dark</button>
      <button type="button" data-theme-choice="light">Light</button>`;
    dock.querySelectorAll("[data-theme-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        applyTheme(button.dataset.themeChoice, true);
        toast(`Theme set to ${button.dataset.themeChoice}.`);
      });
    });
    document.body.appendChild(dock);
    applyTheme(state.getTheme(), false);
    window.matchMedia?.("(prefers-color-scheme: light)").addEventListener?.("change", () => {
      if (state.getTheme() === "system") applyTheme("system", false);
    });
  }

  function mount() {
    mountHeader();
    mountUtility();
    mountFooter();
    mountThemeDock();
    renderAuthPanel();
  }

  window.RatingHubChrome = { mount, toast, renderAuthPanel, escapeHtml, pageUrl };
})();
