/**
 * QuestIndex - Shared UI Chrome, SVG Artwork, Search Bubble, Auth & Modals
 * Pure Vanilla JavaScript (ES6)
 */

(function () {
  "use strict";

  const DATA = window.QUEST_INDEX_DATA;
  const ST = window.QuestIndex.state;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function createGameArtSvg(game, height = 200) {
    const [c1, c2] = game.bgStops || ["#1e293b", "#0f172a"];
    const accent = game.accent || "#38bdf8";
    const motif =
      game.trailerTheme === "siege" || game.trailerTheme === "castle"
        ? `<path d="M50 155 L50 95 L70 95 L70 110 L90 110 L90 95 L110 95 L110 155 Z" fill="${accent}" opacity="0.28"/>
           <path d="M190 155 L190 78 L212 78 L212 94 L232 94 L232 78 L255 78 L255 155 Z" fill="${accent}" opacity="0.35"/>`
        : game.trailerTheme === "chess"
        ? `<rect x="195" y="45" width="70" height="70" rx="8" fill="none" stroke="${accent}" stroke-width="2" opacity="0.45"/>
           <circle cx="230" cy="80" r="16" fill="${accent}" opacity="0.35"/>`
        : game.trailerTheme === "zombie"
        ? `<circle cx="230" cy="85" r="34" fill="none" stroke="${accent}" stroke-width="2" opacity="0.4"/>
           <line x1="230" y1="42" x2="230" y2="128" stroke="${accent}" stroke-width="1.5" opacity="0.4"/>
           <line x1="187" y1="85" x2="273" y2="85" stroke="${accent}" stroke-width="1.5" opacity="0.4"/>`
        : `<polygon points="180,150 230,60 285,150" fill="${accent}" opacity="0.28"/>
           <circle cx="245" cy="58" r="18" fill="${accent}" opacity="0.42"/>`;

    return `
      <svg viewBox="0 0 320 180" width="100%" height="${height}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g-${game.id}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${c1}" />
            <stop offset="100%" stop-color="${c2}" />
          </linearGradient>
        </defs>
        <rect width="320" height="180" fill="url(#g-${game.id})" />
        <circle cx="52" cy="40" r="65" fill="${accent}" opacity="0.1" />
        ${motif}
        <text x="18" y="34" fill="#e2e8f0" font-size="11" font-weight="700" font-family="Inter, sans-serif" opacity="0.85">${escapeHtml(
          game.genre.toUpperCase()
        )} • ${escapeHtml(game.platform)}</text>
        <text x="18" y="156" fill="#ffffff" font-size="17" font-weight="800" font-family="Inter, sans-serif">${escapeHtml(
          game.title
        )}</text>
      </svg>
    `;
  }

  function getHeroSlideIcon(iconType) {
    if (iconType === "chess") {
      return `<span class="hero-inline-icon" title="Team Chess">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 16l-1.447.724a1 1 0 0 0-.553.894V20h12v-2.382a1 1 0 0 0-.553-.894L16 16"/>
          <path d="M8.5 16c0-4 2-6 3.5-8 1.5 2 3.5 4 3.5 8"/>
          <path d="M12 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
        </svg>
      </span>`;
    }
    if (iconType === "zombie") {
      return `<span class="hero-inline-icon" title="Zombie Rewards">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <line x1="12" y1="3" x2="12" y2="7"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
          <line x1="3" y1="12" x2="7" y2="12"/>
          <line x1="17" y1="12" x2="21" y2="12"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      </span>`;
    }
    return "";
  }

  function awardSearchRedeemPoint() {
    const state = ST.loadAuthState();
    const before = ST.calculateBadgeProgress(state.points);
    state.points += 1;
    const after = ST.calculateBadgeProgress(state.points);
    ST.saveAuthState(state);
    renderAuthPanel();

    if (after.level > before.level) {
      ST.showToast(
        `Level Up! ${state.loggedIn ? state.username : "Guest"} reached Badge Level ${after.level} (${after.rankTitle}) at ${after.points} Redeem Points!`
      );
    } else if (state.loggedIn) {
      ST.showToast(`+1 Redeem Point (${after.points}/${after.nextThreshold} to Lv.${after.level + 1})`);
    }
  }

  function getCurrentPageKey() {
    const file = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (file === "" || file === "index.html" || file === "home.html") return "home";
    if (file === "explore.html") return "explore";
    if (file === "top-rate.html") return "top-rate";
    if (file === "about.html") return "about";
    if (file === "search.html") return "search";
    return "home";
  }

  function renderSiteHeader() {
    const host = document.getElementById("site-header-mount");
    if (!host) return;
    const active = getCurrentPageKey();

    host.innerHTML = `
      <header class="site-header">
        <div class="container header-inner">
          <a href="home.html" class="brand-link" title="Go to Home (home.html)">
            <div class="brand-logo-box">
              <span class="logo-mark">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </span>
              <span class="logo-home-icon" aria-hidden="true">&#8962;</span>
            </div>
            <div class="brand-text">
              <span class="brand-name">${DATA.brandName}</span>
              <span class="brand-sub">Game Review &amp; Search Index</span>
            </div>
          </a>

          <nav class="main-nav" aria-label="Main Navigation">
            <a href="index.html" class="nav-link ${active === "home" ? "active" : ""}" title="Home">
              <span class="nav-label">Home</span>
              <span class="nav-hover-icon" aria-hidden="true">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 10.5L12 3l9 7.5"></path>
                  <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"></path>
                </svg>
              </span>
            </a>
            <a href="explore.html" class="nav-link ${active === "explore" ? "active" : ""}" title="Explore Games">
              <span class="nav-label">Explore Games</span>
              <span class="nav-hover-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="5"></rect>
                  <line x1="6" y1="12" x2="10" y2="12"></line>
                  <line x1="8" y1="10" x2="8" y2="14"></line>
                  <circle cx="15.5" cy="10.5" r="1"></circle>
                  <circle cx="17.5" cy="13.5" r="1"></circle>
                </svg>
              </span>
            </a>
            <a href="top-rate.html" class="nav-link ${active === "top-rate" ? "active" : ""}" title="Top Rate">
              <span class="nav-label">Top Rate</span>
              <span class="nav-hover-icon" aria-hidden="true">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </span>
            </a>
            <a href="about.html" class="nav-link ${active === "about" ? "active" : ""}" title="About / Portfolio">
              <span class="nav-label">About</span>
              <span class="nav-hover-icon" aria-hidden="true">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"></path>
                  <line x1="2" y1="13" x2="22" y2="13"></line>
                </svg>
              </span>
            </a>
          </nav>
        </div>
      </header>
    `;
  }

  function renderUtilityStrip() {
    const host = document.getElementById("utility-strip-mount");
    if (!host) return;

    host.innerHTML = `
      <section class="utility-strip">
        <div class="container utility-row">
          <div class="search-cluster">
            <div class="search-bubble-wrap" id="qi-search-wrap">
              <button
                type="button"
                class="notif-dot-btn"
                id="qi-notif-dot"
                title="Recent updates &amp; Google Form reviews"
                aria-label="Open recent updates from Google Form reviews"
              ></button>

              <form class="search-bubble" id="qi-search-form" role="search">
                <span class="search-bubble-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
                <input
                  type="text"
                  class="search-bubble-input"
                  id="qi-search-input"
                  placeholder="Search"
                  autocomplete="off"
                  aria-label="Search favorite games"
                />
                <button type="submit" class="search-go-btn">Go</button>
              </form>

              <div class="updates-popover" id="qi-updates-popover" role="dialog" aria-label="Recent Updates">
                <div class="updates-header">
                  <div class="updates-title">
                    <span class="updates-dot-tag"></span>
                    Recent Google Form Updates
                  </div>
                  <button type="button" class="btn-ghost" id="qi-sync-updates-btn" style="padding:4px 10px;font-size:0.74rem;">Sync</button>
                </div>
                <div class="updates-list" id="qi-updates-list"></div>
                <div class="updates-footer">
                  <a href="#" id="qi-open-gform-link" target="_blank" rel="noopener" style="color:var(--accent-primary);font-weight:700;">Submit Review (Google Form) &rarr;</a>
                  <a href="about.html#google-form-setup" style="color:var(--text-secondary);">Configure Feed</a>
                </div>
              </div>
            </div>

            <div class="adjacent-search-panel" id="qi-adjacent-panel" aria-live="polite">
              <div class="adjacent-panel-head">
                <span id="qi-adjacent-count">Matching Games</span>
                <a href="search.html?q=Stronghold" id="qi-adjacent-see-all" style="color:var(--accent-primary);font-weight:700;">Detailed View &rarr;</a>
              </div>
              <div class="adjacent-result-list" id="qi-adjacent-list"></div>
            </div>

            <div class="switch-wrap">
              <button type="button" class="switch-trigger-btn" id="qi-switch-btn" title="Quick Switch Panel">
                <span>Quick Switch</span>
                <span>&#9662;</span>
              </button>
              <div class="switch-radial-panel" id="qi-switch-panel">
                <button type="button" class="switch-chip-btn" data-switch="top">Sort top</button>
                <button type="button" class="switch-chip-btn" data-switch="recent">Recent sort</button>
                <button type="button" class="switch-chip-btn" data-switch="trending">Trending</button>
                <button type="button" class="switch-chip-btn" data-switch="newlist">New sort</button>
              </div>
            </div>
          </div>

          <div id="qi-auth-panel-mount"></div>
        </div>
      </section>
    `;

    renderAuthPanel();
    bindUtilityEvents();
  }

  function renderAuthPanel() {
    const mount = document.getElementById("qi-auth-panel-mount");
    if (!mount) return;
    const state = ST.loadAuthState();
    const prog = ST.calculateBadgeProgress(state.points);

    if (!state.loggedIn) {
      mount.innerHTML = `
        <div class="auth-panel">
          <button type="button" class="auth-user-btn" id="qi-login-open-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Log in</span>
          </button>
          <span class="auth-separator" aria-hidden="true"></span>
          <button type="button" class="auth-badge-btn" id="qi-badge-open-btn" title="Search Rank Badge">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="12" cy="8" r="6"></circle>
              <path d="M8.5 13.5L7 22l5-3 5 3-1.5-8.5"></path>
            </svg>
            <span>Lv.${prog.level}</span>
          </button>
        </div>
      `;
    } else {
      mount.innerHTML = `
        <div class="auth-panel">
          <button type="button" class="auth-user-btn" id="qi-badge-open-btn" title="Signed in account &amp; stats">
            <span class="auth-avatar">${escapeHtml(state.username.slice(0, 1).toUpperCase())}</span>
            <span>${escapeHtml(state.username)}</span>
          </button>
          <span class="auth-separator" aria-hidden="true"></span>
          <button type="button" class="auth-badge-btn" id="qi-badge-open-btn-2" title="${escapeHtml(
            prog.rankTitle
          )} (${prog.points} pts)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 16.8l-5.8 3.06 1.11-6.46-4.7-4.58 6.49-.94L12 2z"></path>
            </svg>
            <span>Lv.${prog.level} &bull; ${prog.points}pts</span>
          </button>
        </div>
      `;
    }

    document.getElementById("qi-login-open-btn")?.addEventListener("click", openLoginModal);
    document.getElementById("qi-badge-open-btn")?.addEventListener("click", openBadgeModal);
    document.getElementById("qi-badge-open-btn-2")?.addEventListener("click", openBadgeModal);
  }

  function renderSiteFooter() {
    const host = document.getElementById("site-footer-mount");
    if (!host) return;
    host.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-inner">
          <div class="footer-copy">Copyright 2026 &copy; ${DATA.brandName} &mdash; Game Review &amp; Search Index Service</div>
          <div class="social-links" aria-label="Social Media Links">
            <a href="#youtube" class="social-icon-btn" title="YouTube" aria-label="YouTube">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            </a>
            <a href="#facebook" class="social-icon-btn" title="Facebook" aria-label="Facebook">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#x-social" class="social-icon-btn" title="X (Twitter)" aria-label="X">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4l16 16M20 4L4 20"></path></svg>
            </a>
            <a href="#instagram" class="social-icon-btn" title="Instagram" aria-label="Instagram">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
          </div>
        </div>
      </footer>
    `;
  }

  function ensureGlobalModals() {
    if (document.getElementById("qi-modal-backdrop")) return;
    const el = document.createElement("div");
    el.id = "qi-modal-backdrop";
    el.className = "modal-backdrop";
    el.innerHTML = `<div class="modal-card" id="qi-modal-card"></div>`;
    el.addEventListener("click", (e) => {
      if (e.target === el) closeModal();
    });
    document.body.appendChild(el);
  }

  function openModal(html) {
    ensureGlobalModals();
    const backdrop = document.getElementById("qi-modal-backdrop");
    const card = document.getElementById("qi-modal-card");
    card.innerHTML = html;
    backdrop.classList.add("is-open");
    card.querySelector("[data-close-modal]")?.addEventListener("click", closeModal);
  }

  function closeModal() {
    document.getElementById("qi-modal-backdrop")?.classList.remove("is-open");
  }

  function openLoginModal() {
    openModal(`
      <div class="modal-head">
        <h2 style="margin:0;">Sign in to ${DATA.brandName}</h2>
        <button type="button" class="modal-close-btn" data-close-modal>&times;</button>
      </div>
      <p style="color:var(--text-secondary);margin-top:0;font-size:0.9rem;">
        Sign in to display your credentials and rank up your Search Badge every 5 redeem points.
      </p>
      <form id="qi-login-form">
        <div class="form-field">
          <label for="qi-login-user">Username</label>
          <input id="qi-login-user" type="text" value="Mario12" required />
        </div>
        <div class="form-field">
          <label for="qi-login-pass">Password</label>
          <input id="qi-login-pass" type="password" value="********" required />
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;">
          <button type="button" class="btn-ghost" data-close-modal>Cancel</button>
          <button type="submit" class="btn-primary">Sign In as Mario12</button>
        </div>
      </form>
    `);

    document.getElementById("qi-login-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const user = document.getElementById("qi-login-user").value.trim() || "Mario12";
      const state = ST.loadAuthState();
      state.loggedIn = true;
      state.username = user;
      ST.saveAuthState(state);
      // Default to System theme on sign-in unless user explicitly chose Dark/Light
      const currentPref = ST.getThemePreference();
      ST.applyTheme(currentPref, false);
      renderThemeDock();
      renderAuthPanel();
      closeModal();
      ST.showToast(`Welcome back, ${user}! Theme: ${currentPref === "system" ? "System" : currentPref}.`);
    });
  }

  function openBadgeModal() {
    const state = ST.loadAuthState();
    const prog = ST.calculateBadgeProgress(state.points);
    const pct = Math.min(100, Math.round(((prog.points - prog.prevThreshold) / 5) * 100));

    openModal(`
      <div class="modal-head">
        <h2 style="margin:0;">Search Rank &amp; Redeem Badge</h2>
        <button type="button" class="modal-close-btn" data-close-modal>&times;</button>
      </div>
      <div style="padding:16px;border-radius:16px;background:var(--bg-card);border:1px solid var(--border-subtle);margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <strong>${state.loggedIn ? escapeHtml(state.username) : "Guest Explorer"}</strong>
          <span style="color:var(--accent-gold);font-weight:800;">Level ${prog.level} &bull; ${escapeHtml(
      prog.rankTitle
    )}</span>
        </div>
        <div style="height:10px;border-radius:999px;background:#0b0f19;overflow:hidden;margin-bottom:8px;">
          <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#38bdf8,#fbbf24);"></div>
        </div>
        <div style="font-size:0.84rem;color:var(--text-secondary);">
          Total Redeem Points: <strong>${prog.points}</strong> &bull;
          <strong>${prog.pointsToNext}</strong> more searches to reach Level ${prog.level + 1} (at ${prog.nextThreshold} pts)
        </div>
      </div>
      <p style="font-size:0.84rem;color:var(--text-muted);margin:0 0 16px;">
        Recursive progression: Level 2 at 5 points, Level 3 at 10 points, Level 4 at 15 points, continuing recursively every +5 points.
      </p>
      <div style="display:flex;gap:10px;justify-content:space-between;">
        ${
          state.loggedIn
            ? `<button type="button" class="btn-ghost" id="qi-logout-btn">Log out</button>`
            : `<button type="button" class="btn-primary" id="qi-switch-login-btn">Log in as Mario12</button>`
        }
        <button type="button" class="btn-ghost" data-close-modal>Close</button>
      </div>
    `);

    document.getElementById("qi-logout-btn")?.addEventListener("click", () => {
      const s = ST.loadAuthState();
      s.loggedIn = false;
      ST.saveAuthState(s);
      renderAuthPanel();
      closeModal();
      ST.showToast("Signed out.");
    });

    document.getElementById("qi-switch-login-btn")?.addEventListener("click", openLoginModal);
  }

  function openGameDetailModal(game) {
    const cfg = ST.loadFormConfig();
    const reviewsHtml = (game.reviews || [])
      .map(
        (r) => `
        <div class="update-card">
          <div class="update-card-top">
            <span>${escapeHtml(r.user)}</span>
            <span class="star-rating">&#9733; ${r.score.toFixed(1)}</span>
          </div>
          <div class="update-card-body">${escapeHtml(r.text)}</div>
        </div>
      `
      )
      .join("");

    openModal(`
      <div class="modal-head">
        <h2 style="margin:0;">${escapeHtml(game.title)}</h2>
        <button type="button" class="modal-close-btn" data-close-modal>&times;</button>
      </div>
      <div style="border-radius:16px;overflow:hidden;border:1px solid var(--border-subtle);margin-bottom:14px;">
        ${createGameArtSvg(game, 180)}
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
        <span class="feature-pill" style="margin:0;">${escapeHtml(game.genre)}</span>
        <span class="feature-pill" style="margin:0;background:rgba(251,191,36,0.16);color:var(--accent-gold);">&#9733; ${game.rating.toFixed(
          1
        )}</span>
        <span class="feature-pill" style="margin:0;background:rgba(148,163,184,0.15);color:var(--text-primary);">${escapeHtml(
          game.platform
        )} &bull; ${game.year}</span>
      </div>
      <p style="color:var(--text-secondary);font-size:0.94rem;margin-top:0;">${escapeHtml(game.description)}</p>
      <h4 style="margin:14px 0 8px;">Community Reviews</h4>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">${reviewsHtml}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
        <a href="${escapeHtml(cfg.formUrl)}" target="_blank" rel="noopener" class="btn-primary">Submit Feedback (Google Form)</a>
        <button type="button" class="btn-ghost" data-close-modal>Close</button>
      </div>
    `);
  }

  function bindUtilityEvents() {
    const dotBtn = document.getElementById("qi-notif-dot");
    const popover = document.getElementById("qi-updates-popover");
    const syncBtn = document.getElementById("qi-sync-updates-btn");
    const gformLink = document.getElementById("qi-open-gform-link");
    const searchForm = document.getElementById("qi-search-form");
    const searchInput = document.getElementById("qi-search-input");
    const adjPanel = document.getElementById("qi-adjacent-panel");
    const adjList = document.getElementById("qi-adjacent-list");
    const adjCount = document.getElementById("qi-adjacent-count");
    const adjSeeAll = document.getElementById("qi-adjacent-see-all");
    const switchBtn = document.getElementById("qi-switch-btn");
    const switchPanel = document.getElementById("qi-switch-panel");

    if (gformLink) gformLink.href = ST.loadFormConfig().formUrl;

    async function loadAndRenderUpdates() {
      const list = document.getElementById("qi-updates-list");
      if (!list) return;
      list.innerHTML = `<div style="font-size:0.82rem;color:var(--text-secondary);padding:8px;">Fetching Google Form feedback...</div>`;
      const result = await ST.fetchGoogleFormUpdates();
      list.innerHTML = result.items
        .map(
          (item) => `
          <div class="update-card">
            <div class="update-card-top">
              <span>${escapeHtml(item.gameTitle)}</span>
              <span class="update-card-badge">${escapeHtml(item.badge)}</span>
            </div>
            <div class="update-card-body">${escapeHtml(item.comment)}</div>
            <div class="update-card-meta">
              <span>By ${escapeHtml(item.reviewer)}</span>
              <span>&#9733; ${Number(item.rating).toFixed(1)} &bull; ${escapeHtml(item.timestamp)}</span>
            </div>
          </div>
        `
        )
        .join("");
    }

    if (dotBtn && popover) {
      dotBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        switchPanel?.classList.remove("is-open");
        const willOpen = !popover.classList.contains("is-open");
        popover.classList.toggle("is-open", willOpen);
        if (willOpen) loadAndRenderUpdates();
      });
    }

    syncBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      loadAndRenderUpdates();
      ST.showToast("Synced latest Google Form reviews.");
    });

    function updateAdjacentSearchBox(query) {
      const q = query.trim().toLowerCase();
      if (!q) {
        adjPanel.classList.remove("is-visible");
        searchForm.classList.remove("is-expanded");
        return;
      }
      searchForm.classList.add("is-expanded");
      const matches = DATA.games.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.genre.toLowerCase().includes(q) ||
          g.platform.toLowerCase().includes(q)
      );

      adjCount.textContent = `${matches.length} Favorite Match${matches.length === 1 ? "" : "es"}`;
      adjSeeAll.href = `search.html?q=${encodeURIComponent(query.trim())}`;

      if (matches.length === 0) {
        adjList.innerHTML = `<div style="font-size:0.82rem;color:var(--text-muted);padding:6px 4px;">No quick match. Press Enter to view search index.</div>`;
      } else {
        adjList.innerHTML = matches
          .slice(0, 5)
          .map(
            (g) => `
            <div class="adjacent-item" data-game-id="${g.id}">
              <div>
                <div class="adjacent-item-title">${escapeHtml(g.title)}</div>
                <div style="font-size:0.72rem;color:var(--text-muted);">${escapeHtml(g.genre)} &bull; ${escapeHtml(
              g.platform
            )}</div>
              </div>
              <div class="adjacent-item-meta">&#9733; ${g.rating.toFixed(1)}</div>
            </div>
          `
          )
          .join("");

        adjList.querySelectorAll(".adjacent-item").forEach((el) => {
          el.addEventListener("click", () => {
            const found = DATA.games.find((g) => g.id === el.dataset.gameId);
            if (found) {
              awardSearchRedeemPoint();
              openGameDetailModal(found);
            }
          });
        });
      }
      adjPanel.classList.add("is-visible");
    }

    if (searchInput) {
      searchInput.addEventListener("input", () => updateAdjacentSearchBox(searchInput.value));
      searchInput.addEventListener("focus", () => {
        searchForm.classList.add("is-expanded");
        if (searchInput.value.trim()) updateAdjacentSearchBox(searchInput.value);
      });
    }

    searchForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = searchInput.value.trim();
      if (!q) {
        searchInput.focus();
        return;
      }
      awardSearchRedeemPoint();
      window.location.href = `search.html?q=${encodeURIComponent(q)}`;
    });

    if (switchBtn && switchPanel) {
      switchBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        popover?.classList.remove("is-open");
        switchPanel.classList.toggle("is-open");
      });

      switchPanel.querySelectorAll("[data-switch]").forEach((btn) => {
        btn.addEventListener("click", () => {
          switchPanel.classList.remove("is-open");
          window.location.href = `explore.html?mode=${encodeURIComponent(btn.dataset.switch)}`;
        });
      });
    }

    document.addEventListener("click", (e) => {
      if (popover && !popover.contains(e.target) && e.target !== dotBtn) {
        popover.classList.remove("is-open");
      }
      if (switchPanel && !switchPanel.contains(e.target) && !switchBtn.contains(e.target)) {
        switchPanel.classList.remove("is-open");
      }
    });
  }

  function renderThemeDock() {
    let dock = document.getElementById("qi-theme-dock");
    if (!dock) {
      dock = document.createElement("div");
      dock.id = "qi-theme-dock";
      dock.className = "theme-dock";
      dock.setAttribute("role", "group");
      dock.setAttribute("aria-label", "Theme Switcher");
      document.body.appendChild(dock);
    }

    const pref = ST.getThemePreference();
    const effective = ST.resolveEffectiveTheme(pref);

    dock.innerHTML = `
      <button type="button" class="theme-dock-btn ${pref === "system" ? "is-active" : ""}" data-theme-choice="system" title="System Theme (${effective})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        <span>System</span>
      </button>
      <button type="button" class="theme-dock-btn ${pref === "dark" ? "is-active" : ""}" data-theme-choice="dark" title="Dark Theme">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        <span>Dark</span>
      </button>
      <button type="button" class="theme-dock-btn ${pref === "light" ? "is-active" : ""}" data-theme-choice="light" title="Light Theme">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        <span>Light</span>
      </button>
    `;

    dock.querySelectorAll("[data-theme-choice]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const choice = btn.dataset.themeChoice;
        const res = ST.applyTheme(choice, true);
        renderThemeDock();
        ST.showToast(`Theme set to ${choice === "system" ? `System (${res.effective})` : choice}`);
      });
    });
  }

  window.QuestIndex = window.QuestIndex || {};
  window.QuestIndex.chrome = {
    escapeHtml,
    createGameArtSvg,
    getHeroSlideIcon,
    awardSearchRedeemPoint,
    openGameDetailModal,
    mount() {
      ST.initThemeListener(() => renderThemeDock());
      renderSiteHeader();
      renderUtilityStrip();
      renderSiteFooter();
      renderThemeDock();
    }
  };
})();
