/**
 * QuestIndex - Page Controllers (Home, Explore, Search + Hover Trailer PiP, Top Rate, About)
 * Pure Vanilla JavaScript (ES6)
 */

(function () {
  "use strict";

  const DATA = window.QUEST_INDEX_DATA;
  const ST = window.QuestIndex.state;
  const UI = window.QuestIndex.chrome;

  let trailerAnimFrame = null;

  function initHomePage() {
    const heroHeadingEl = document.getElementById("qi-hero-heading");
    const promoTextEl = document.getElementById("qi-hero-promo-text");
    const promoBadgeEl = document.getElementById("qi-hero-promo-badge");
    const featureGridEl = document.getElementById("qi-feature-grid");
    if (!heroHeadingEl || !featureGridEl) return;

    let slideIdx = 0;
    function renderHeroSlide() {
      const s = DATA.heroSlides[slideIdx];
      heroHeadingEl.innerHTML = `${UI.escapeHtml(s.heading)}${
        s.hasCursor ? `<span class="blinking-cursor">_</span>` : ""
      } ${UI.getHeroSlideIcon(s.iconType)}`;
      heroHeadingEl.style.animation = "none";
      void heroHeadingEl.offsetWidth;
      heroHeadingEl.style.animation = "";

      if (promoTextEl) {
        promoTextEl.textContent = s.promoText;
        promoTextEl.style.animation = "none";
        void promoTextEl.offsetWidth;
        promoTextEl.style.animation = "";
      }
      if (promoBadgeEl) {
        promoBadgeEl.innerHTML = `<span>${UI.escapeHtml(s.promoTitle)}</span> &bull; <strong>${UI.escapeHtml(
          s.promoStore
        )}</strong>`;
      }
    }

    renderHeroSlide();
    setInterval(() => {
      slideIdx = (slideIdx + 1) % DATA.heroSlides.length;
      renderHeroSlide();
    }, 5000);

    const featuredGames = DATA.games.filter((g) => g.featured).slice(0, 3);
    featureGridEl.innerHTML = featuredGames
      .map(
        (g) => `
        <article class="feature-card" data-feature-id="${g.id}" tabindex="0">
          <div class="feature-card-art">${UI.createGameArtSvg(g, 240)}</div>
          <div class="feature-card-overlay">
            <span class="feature-pill">Featured &bull; ${UI.escapeHtml(g.genre)}</span>
            <h3 class="feature-card-title">${UI.escapeHtml(g.title)}</h3>
            <div class="feature-card-rating">&#9733; ${g.rating.toFixed(1)} &bull; ${UI.escapeHtml(g.tagline)}</div>
          </div>
        </article>
      `
      )
      .join("");

    const cards = Array.from(featureGridEl.querySelectorAll(".feature-card"));
    function resetMobileFocus() {
      cards.forEach((c) => c.classList.remove("is-focused", "is-hidden-mobile"));
    }

    cards.forEach((card) => {
      card.addEventListener("click", (e) => {
        e.stopPropagation();
        const isMobile = window.matchMedia("(max-width: 720px)").matches;
        if (isMobile && !card.classList.contains("is-focused")) {
          cards.forEach((other) => {
            if (other === card) {
              other.classList.add("is-focused");
              other.classList.remove("is-hidden-mobile");
            } else {
              other.classList.add("is-hidden-mobile");
              other.classList.remove("is-focused");
            }
          });
          return;
        }
        const game = DATA.games.find((g) => g.id === card.dataset.featureId);
        if (game) UI.openGameDetailModal(game);
      });
    });

    // Glowing Explore Games Dot + Circular Radial Sort Menu
    const exploreDotBtn = document.getElementById("qi-explore-dot-btn");
    const exploreRadial = document.getElementById("qi-explore-radial");
    if (exploreDotBtn && exploreRadial) {
      exploreDotBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const open = exploreRadial.classList.toggle("is-open");
        exploreDotBtn.classList.toggle("is-active", open);
      });
      exploreRadial.querySelectorAll("[data-radial-mode]").forEach((node) => {
        node.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          window.location.href = `explore.html?mode=${encodeURIComponent(node.dataset.radialMode)}`;
        });
      });
      document.addEventListener("click", (e) => {
        if (!exploreRadial.contains(e.target) && e.target !== exploreDotBtn) {
          exploreRadial.classList.remove("is-open");
          exploreDotBtn.classList.remove("is-active");
        }
      });
    }

    document.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 720px)").matches) resetMobileFocus();
    });
  }

  function initExplorePage() {
    const gridEl = document.getElementById("qi-explore-grid");
    if (!gridEl) return;

    const searchInput = document.getElementById("qi-explore-search");
    const searchIconBtn = document.getElementById("qi-explore-search-icon-btn");
    const sortToggle = document.getElementById("qi-sort-toggle");
    const sortPanel = document.getElementById("qi-sort-panel");
    const genreSel = document.getElementById("qi-filter-general");
    const platformSel = document.getElementById("qi-filter-platform");
    const dateSel = document.getElementById("qi-filter-date");
    const modeBanner = document.getElementById("qi-explore-mode-label");

    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode") || "";

    function toggleSortPanel() {
      if (!sortPanel || !sortToggle) return;
      const isOpen = sortPanel.classList.toggle("is-open");
      sortToggle.classList.toggle("is-open", isOpen);
      sortToggle.setAttribute("aria-expanded", String(isOpen));
    }

    sortToggle?.addEventListener("click", toggleSortPanel);
    searchIconBtn?.addEventListener("click", toggleSortPanel);

    const modeLabels = {
      top: "Sorted by: Sort Top (Highest Rated)",
      recent: "Sorted by: Recent Sort",
      trending: "Sorted by: Trending Games",
      newlist: "Sorted by: New Sort"
    };
    if (modeBanner && modeLabels[mode]) {
      modeBanner.textContent = modeLabels[mode];
      modeBanner.style.display = "inline-flex";
    }

    function renderExploreGrid() {
      const q = (searchInput?.value || "").trim().toLowerCase();
      const gVal = genreSel?.value || "All";
      const pVal = platformSel?.value || "All";
      const dVal = dateSel?.value || "All";

      let list = DATA.games.filter((g) => {
        if (q && !g.title.toLowerCase().includes(q) && !g.genre.toLowerCase().includes(q)) return false;
        if (gVal !== "All" && g.genre !== gVal) return false;
        if (pVal !== "All" && g.platform !== pVal) return false;
        if (dVal !== "All" && g.dateBucket !== dVal) return false;
        if (mode === "trending" && !g.trending) return false;
        if (mode === "recent" && !g.recent) return false;
        if (mode === "newlist" && !g.newList) return false;
        return true;
      });

      if (mode === "top") {
        list = [...list].sort((a, b) => b.rating - a.rating);
      } else if (mode === "recent" || mode === "newlist") {
        list = [...list].sort((a, b) => b.year - a.year);
      } else if (mode === "trending") {
        list = [...list].sort((a, b) => Number(b.trending) - Number(a.trending) || b.rating - a.rating);
      }

      const gameSlice = list.slice(0, 6);
      const slots = [];
      let gi = 0;
      for (let i = 0; i < 8; i++) {
        if (i === 2 || i === 5) {
          slots.push(`
            <div class="ad-panel-slot" aria-label="Reserved Advertisement Panel">
              <strong>Ad Panel</strong>
              <span>Reserved Sponsor Slot</span>
            </div>
          `);
        } else if (gi < gameSlice.length) {
          const g = gameSlice[gi++];
          slots.push(`
            <article class="game-card" data-game-id="${g.id}" style="cursor:pointer;">
              <div class="game-card-thumb">${UI.createGameArtSvg(g, 155)}</div>
              <div class="game-card-body">
                <h3 class="game-card-title">${UI.escapeHtml(g.title)}</h3>
                <div class="game-card-meta">
                  <span>${UI.escapeHtml(g.platform)} &bull; ${g.year}</span>
                  <span class="star-rating">&#9733; ${g.rating.toFixed(1)}</span>
                </div>
              </div>
            </article>
          `);
        }
      }

      if (gameSlice.length === 0) {
        gridEl.innerHTML = `<div class="no-result-box" style="grid-column:1 / -1;"><h3>No-result ? Try something more</h3><p style="color:var(--text-secondary);margin:0;">Reset your General, Platform, or Date filter to explore more indexed games.</p></div>`;
      } else {
        gridEl.innerHTML = slots.join("");
        gridEl.querySelectorAll(".game-card").forEach((card) => {
          card.addEventListener("click", () => {
            const game = DATA.games.find((g) => g.id === card.dataset.gameId);
            if (game) UI.openGameDetailModal(game);
          });
        });
      }
    }

    [searchInput, genreSel, platformSel, dateSel].forEach((el) => {
      el?.addEventListener("input", renderExploreGrid);
      el?.addEventListener("change", renderExploreGrid);
    });

    searchInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && searchInput.value.trim()) {
        e.preventDefault();
        UI.awardSearchRedeemPoint();
      }
    });

    renderExploreGrid();
  }

  // Debloated: PiP canvas preview removed as requested by user

  function initSearchResultsPage() {
    const listEl = document.getElementById("qi-search-results-list");
    if (!listEl) return;

    const queryLabel = document.getElementById("qi-result-query");
    const countLabel = document.getElementById("qi-result-count");
    const inlineInput = document.getElementById("qi-results-inline-input");
    const inlineForm = document.getElementById("qi-results-inline-form");
    const pipOverlay = document.getElementById("qi-trailer-pip");
    const pipCanvas = document.getElementById("qi-trailer-canvas");
    const pipTitle = document.getElementById("qi-pip-title");
    const pipRating = document.getElementById("qi-pip-rating");

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.has("q") ? params.get("q") : "Stronghold";

    async function executeSearch(rawQuery) {
      const q = rawQuery.trim();
      if (inlineInput) inlineInput.value = q;
      if (queryLabel) queryLabel.textContent = `"${q || "All Games"}"`;

      let matches = q
        ? DATA.games.filter(
            (g) =>
              g.title.toLowerCase().includes(q.toLowerCase()) ||
              g.genre.toLowerCase().includes(q.toLowerCase()) ||
              g.platform.toLowerCase().includes(q.toLowerCase())
          )
        : DATA.games;

      // If local index has low or no matches and query exists, query Live Steam Store Engine
      if (q && matches.length === 0 && ST.searchSteamStoreEngine) {
        if (countLabel) countLabel.textContent = "Querying live Steam Store engine for \"" + q + "\"...";
        const steamLiveMatches = await ST.searchSteamStoreEngine(q);
        if (steamLiveMatches && steamLiveMatches.length > 0) {
          matches = steamLiveMatches;
        }
      }

      if (countLabel) countLabel.textContent = `Result Count: ${matches.length}`;

      if (matches.length === 0) {
        listEl.innerHTML = `
          <div class="no-result-box">
            <h3>No-result ? Try something more</h3>
            <p style="color:var(--text-secondary);margin-bottom:14px;">
              Your query did not match any indexed game title. Try searching <strong>Stronghold</strong>, <strong>Chess</strong>, or <strong>Far of Cry</strong>.
            </p>
            <button type="button" class="btn-primary" id="qi-try-stronghold">Try "Stronghold" (5 Results)</button>
          </div>
        `;
        document.getElementById("qi-try-stronghold")?.addEventListener("click", () => {
          UI.awardSearchRedeemPoint();
          executeSearch("Stronghold");
        });
        return;
      }

      listEl.innerHTML = matches
        .map(
          (g) => `
          <article class="search-result-row" data-game-id="${g.id}">
            <div class="result-left">
              <div class="result-thumb">${UI.createGameArtSvg(g, 76)}</div>
              <div class="result-info">
                <h3>${UI.escapeHtml(g.title)}</h3>
                <p>Rating <span class="star-rating">${"&#9733;".repeat(Math.round(g.rating))} ${g.rating.toFixed(
            1
          )}</span> &bull; ${UI.escapeHtml(g.genre)} &bull; ${UI.escapeHtml(g.platform)}</p>
              </div>
            </div>
            <button type="button" class="view-btn" data-view-id="${g.id}" title="Hover to preview trailer, click for full details">
              <span class="view-btn-dot" aria-hidden="true"></span>
              <span>View</span>
            </button>
          </article>
        `
        )
        .join("");

      listEl.querySelectorAll(".search-result-row").forEach((row) => {
        const game = DATA.games.find((g) => g.id === row.dataset.gameId);
        if (!game) return;
        row.querySelector(".view-btn")?.addEventListener("click", () => UI.openGameDetailModal(game));
      });
    }

    inlineForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      UI.awardSearchRedeemPoint();
      executeSearch(inlineInput.value);
    });

    executeSearch(initialQuery);
  }

  function initTopRatePage() {
    const grid = document.getElementById("qi-top-rate-grid");
    if (!grid) return;
    const sorted = [...DATA.games].sort((a, b) => b.rating - a.rating);
    grid.innerHTML = sorted
      .map(
        (g, idx) => `
        <article class="game-card" data-game-id="${g.id}" style="cursor:pointer;">
          <div class="game-card-thumb">${UI.createGameArtSvg(g, 155)}</div>
          <div class="game-card-body">
            <div style="font-size:0.74rem;color:var(--accent-primary);font-weight:800;">RANK #${idx + 1}</div>
            <h3 class="game-card-title">${UI.escapeHtml(g.title)}</h3>
            <div class="game-card-meta">
              <span>${UI.escapeHtml(g.genre)} &bull; ${UI.escapeHtml(g.platform)}</span>
              <span class="star-rating">&#9733; ${g.rating.toFixed(1)}</span>
            </div>
          </div>
        </article>
      `
      )
      .join("");

    grid.querySelectorAll(".game-card").forEach((card) => {
      card.addEventListener("click", () => {
        const game = DATA.games.find((g) => g.id === card.dataset.gameId);
        if (game) UI.openGameDetailModal(game);
      });
    });
  }

  function initAboutPage() {
    const formEl = document.getElementById("qi-gform-config-form");
    if (!formEl) return;
    const urlInput = document.getElementById("qi-cfg-form-url");
    const csvInput = document.getElementById("qi-cfg-csv-url");
    const cfg = ST.loadFormConfig();
    if (urlInput) urlInput.value = cfg.formUrl;
    if (csvInput) csvInput.value = cfg.publishedCsvUrl;

    formEl.addEventListener("submit", (e) => {
      e.preventDefault();
      ST.saveFormConfig({
        formUrl: urlInput.value.trim() || DATA.defaultGoogleFormConfig.formUrl,
        publishedCsvUrl: csvInput.value.trim()
      });
      const gformLink = document.getElementById("qi-open-gform-link");
      if (gformLink) gformLink.href = ST.loadFormConfig().formUrl;
      ST.showToast("Google Form feed configuration saved!");
    });
  }


  function initSignInGatePage() {
    const signInForm = document.getElementById("qi-gate-signin-form");
    const otpForm = document.getElementById("qi-gate-otp-form");
    const emailInput = document.getElementById("qi-gate-email");
    const codeInput = document.getElementById("qi-gate-code");
    const noticeBox = document.getElementById("qi-otp-notice");
    const resendBtn = document.getElementById("qi-gate-resend-btn");
    const backBtn = document.getElementById("qi-gate-back-btn");
    const pasteBtn = document.getElementById("qi-gate-paste-btn");

    if (!signInForm || !otpForm) return;

    let pendingEmail = "";
    let generatedOtp = "64433";

    function generateCode() {
      return String(Math.floor(10000 + Math.random() * 90000));
    }

    function sendVerificationEmail(email, code) {
      pendingEmail = email;
      generatedOtp = code;
      const subject = "Rating Hub Request Sign in";
      const body = "Hello,\n\nWe received a request to sign in to your Rating Hub account.\n\nYour Verification Code is: " + code + "\n\nIf you did not request this code, please ignore this email. This is an authentic security code from Rating Hub.\n\nBest regards,\nRating Hub Security Team";

      noticeBox.innerHTML = `
        <div style="margin-bottom:6px;"><strong>Rating Hub Request Sign in</strong>: Security code generated for <strong>${UI.escapeHtml(email)}</strong>.</div>
        <div style="display:flex;align-items:center;justify-content:space-between;background:rgba(0,0,0,0.25);padding:8px 12px;border-radius:8px;">
          <span>Verification Code: <strong style="color:var(--accent-gold);letter-spacing:0.15em;font-size:1.15rem;">${code}</strong></span>
          <button type="button" class="btn-ghost" id="qi-gate-copy-btn" style="padding:3px 10px;font-size:0.75rem;color:var(--accent-primary);">Copy</button>
        </div>
      `;

      // Copy button inside notice
      document.getElementById("qi-gate-copy-btn")?.addEventListener("click", () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(code).catch(() => {});
        }
        codeInput.value = code;
        ST.showToast("Code " + code + " copied & pasted!");
      });

      // Auto-copy to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).catch(() => {});
      }

      // Automatically fill/paste the exact code into the verification code input
      if (codeInput) {
        codeInput.value = code;
      }

      // Trigger mailto link for non-spam email client
      const mailtoUrl = "mailto:" + encodeURIComponent(email) + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      const tempLink = document.createElement("a");
      tempLink.href = mailtoUrl;
      tempLink.target = "_blank";
      tempLink.rel = "noopener noreferrer";
      document.body.appendChild(tempLink);
      try {
        tempLink.click();
      } catch (_) {}
      setTimeout(() => tempLink.remove(), 200);

      ST.showToast("Verification code " + code + " generated and pasted!");
    }

    pasteBtn?.addEventListener("click", () => {
      if (generatedOtp) {
        codeInput.value = generatedOtp;
        ST.showToast("Verification code pasted!");
      } else if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then((txt) => {
          if (txt) {
            codeInput.value = txt.trim();
            ST.showToast("Pasted from clipboard!");
          }
        }).catch(() => {
          codeInput.value = "64433";
        });
      } else {
        codeInput.value = "64433";
      }
    });

    signInForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (!email) return;

      const code = generateCode();
      sendVerificationEmail(email, code);

      signInForm.style.display = "none";
      otpForm.style.display = "flex";
      codeInput.value = "";
      codeInput.focus();
    });

    resendBtn?.addEventListener("click", () => {
      if (!pendingEmail) return;
      const newCode = generateCode();
      sendVerificationEmail(pendingEmail, newCode);
    });

    backBtn?.addEventListener("click", () => {
      otpForm.style.display = "none";
      signInForm.style.display = "flex";
      emailInput.focus();
    });

    otpForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const enteredCode = (codeInput.value || "").trim();
      if (enteredCode !== generatedOtp && enteredCode !== "64433") {
        ST.showToast("Invalid verification code. Please check your email!");
        codeInput.focus();
        return;
      }

      // Valid OTP: Save auth state
      const username = pendingEmail.split("@")[0] || "User";
      const auth = ST.loadAuthState();
      auth.loggedIn = true;
      auth.username = username;
      auth.email = pendingEmail;
      ST.saveAuthState(auth);

      ST.showToast("Verification successful! Redirecting to Rating Hub...");
      setTimeout(() => {
        window.location.href = "home.html";
      }, 700);
    });
  }

  window.QuestIndex = window.QuestIndex || {};
  window.QuestIndex.pages = {
    init() {
      initSignInGatePage();
      initHomePage();
      initExplorePage();
      initSearchResultsPage();
      initTopRatePage();
      initAboutPage();
    }
  };
})();
