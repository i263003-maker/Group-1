(function () {
  "use strict";
  const games = () => window.GAME_HUB?.games || [];
  const esc = (value) => window.RatingHubChrome.escapeHtml(value);

  function gameCard(game) {
    return `<article class="game-card">
      <a href="pages/game.html?id=${encodeURIComponent(game.id)}" aria-label="Read reviews for ${esc(game.title)}">
        <div class="game-card-media"><img src="${esc(game.cover || "")}" alt="${esc(game.title)} cover" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><span class="fallback-art" style="display:none">${esc(game.title)}</span><span class="game-card-score">★ ${Number(game.rating || 0).toFixed(1)}</span></div>
        <div class="game-card-body"><h3>${esc(game.title)}</h3><div class="game-card-meta">${esc(game.year || "Year TBA")} · ${esc((game.genres || []).slice(0, 2).join(" / "))}</div><div class="chip-row">${(game.platforms || []).slice(0, 2).map((platform) => `<span class="chip">${esc(platform)}</span>`).join("")}</div></div>
      </a><div class="game-card-actions"><a class="button-secondary" href="pages/game.html?id=${encodeURIComponent(game.id)}">Reviews</a><a class="button-quiet" href="pages/compare.html?gameA=${encodeURIComponent(game.id)}">Compare</a></div>
    </article>`;
  }

  function renderHome() {
    const list = [...games()];
    const target = document.getElementById("home-games");
    if (target) target.innerHTML = list.slice().sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)).slice(0, 8).map(gameCard).join("");
    const featured = document.getElementById("feature-grid");
    if (featured) {
      const picks = list.filter((game) => (game.tags || []).includes("featured")).slice(0, 3);
      featured.innerHTML = picks.map((game) => `<a class="feature-card" href="pages/game.html?id=${encodeURIComponent(game.id)}"><img src="${esc(game.banner || game.cover || "")}" alt="" loading="lazy" onerror="this.style.display='none'"><div class="feature-card-copy"><span class="eyebrow">★ ${Number(game.rating || 0).toFixed(1)} · ${esc(game.year || "Year TBA")}</span><h3>${esc(game.title)}</h3><p>${esc((game.genres || []).slice(0, 3).join(" · "))}</p></div></a>`).join("");
    }
    const heading = document.getElementById("hero-heading");
    if (heading) {
      const slides = window.GAME_HUB?.heroSlides || [];
      if (slides.length) {
        let current = 0;
        const rotate = () => {
          const slide = slides[current];
          heading.textContent = slide.heading || "Find your next favourite.";
          const text = document.getElementById("hero-promo-text");
          const badge = document.querySelector("#hero-promo-badge strong");
          if (text) text.textContent = slide.promoText || "Explore the community's verdict and find your next adventure.";
          if (badge) badge.textContent = slide.promoTitle || "Community picks";
          current = (current + 1) % slides.length;
        };
        rotate();
        window.setInterval(rotate, 6500);
      }
    }
  }

  function renderSearch() {
    const form = document.getElementById("search-form");
    if (!form) return;
    const genres = [...new Set(games().flatMap((game) => game.genres || []))].sort();
    const platforms = [...new Set(games().flatMap((game) => game.platforms || []))].sort();
    document.getElementById("filter-genre").innerHTML += genres.map((value) => `<option value="${esc(value)}">${esc(value)}</option>`).join("");
    document.getElementById("filter-platform").innerHTML += platforms.map((value) => `<option value="${esc(value)}">${esc(value)}</option>`).join("");
    const params = new URLSearchParams(location.search);
    ["q", "genre", "platform", "era", "sort"].forEach((key) => {
      const node = document.getElementById(key === "q" ? "search-query" : `filter-${key}`);
      if (node && params.has(key)) node.value = params.get(key);
    });
    const run = (event) => {
      if (event) event.preventDefault();
      const query = document.getElementById("search-query").value.trim();
      const opts = {
        genre: document.getElementById("filter-genre").value,
        platform: document.getElementById("filter-platform").value,
        era: document.getElementById("filter-era").value,
        sort: document.getElementById("filter-sort").value
      };
      const results = window.RatingHubSearch.search(query, opts);
      document.getElementById("search-summary").textContent = `${results.length} game${results.length === 1 ? "" : "s"} found${query ? ` for “${query}”` : " in the catalog"}.`;
      document.getElementById("search-results").innerHTML = results.map((game) => `<article class="search-row"><a class="search-row-main" href="pages/game.html?id=${encodeURIComponent(game.id)}"><span class="search-row-art"><img src="${esc(game.cover || "")}" alt="" loading="lazy" onerror="this.style.display='none'"></span><span><h3>${esc(game.title)}</h3><p>${esc(game.year || "Year TBA")} · ${esc((game.genres || []).join(" / "))} · ★ ${Number(game.rating || 0).toFixed(1)}</p><p>${esc(game.developer || game.publisher || "")}</p></span></a><span class="search-row-actions"><a class="button-secondary" href="pages/game.html?id=${encodeURIComponent(game.id)}">Reviews</a><a class="button-quiet" href="pages/compare.html?gameA=${encodeURIComponent(game.id)}">Compare</a></span></article>`).join("") || `<div class="empty-state"><h2>No matches yet</h2><p>Try a shorter title, a release year, or a broader filter.</p></div>`;
    };
    form.addEventListener("submit", run);
    ["filter-genre", "filter-platform", "filter-era", "filter-sort"].forEach((id) => document.getElementById(id).addEventListener("change", run));
    document.getElementById("clear-filters").addEventListener("click", () => { form.reset(); run(); });
    run();
  }

  function renderWishlist() {
    const host = document.getElementById("wishlist-grid");
    if (!host) return;
    const ids = new Set(window.RatingHubState.getWishlist());
    const saved = games().filter((game) => ids.has(String(game.id)));
    host.innerHTML = saved.length ? saved.map(gameCard).join("") : `<div class="empty-state"><h2>Your wishlist is ready</h2><p>${window.RatingHubState.getCurrentUser() ? "Save games from any detail page and they will appear here." : "Sign in to keep your wishlist associated with your account."}</p><a class="button" href="${window.RatingHubState.getCurrentUser() ? "pages/search.html" : "pages/login.html"}">${window.RatingHubState.getCurrentUser() ? "Explore games" : "Log in"} →</a></div>`;
  }

  function renderDemand() {
    const form = document.getElementById("request-form");
    const host = document.getElementById("request-list");
    const renderList = () => {
      if (!host) return;
      const requests = window.RatingHubState.getRequests();
      host.innerHTML = requests.length ? requests.map((request) => `<article class="request-item"><strong>${esc(request.title)} ${request.platform ? `· ${esc(request.platform)}` : ""}</strong><p class="muted">${esc(request.reason)}</p><small>${new Date(request.createdAt).toLocaleDateString()} · ${esc(request.username || "Guest player")}</small></article>`).join("") : `<div class="empty-state">No game requests yet. Tell us what you'd like to see in the hub.</div>`;
    };
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const request = {
        title: document.getElementById("request-title").value.trim(),
        platform: document.getElementById("request-platform").value.trim(),
        reason: document.getElementById("request-reason").value.trim(),
        username: window.RatingHubState.getCurrentUser()?.username || "Guest player"
      };
      if (window.RatingHubState.addRequest(request)) {
        form.reset();
        document.getElementById("request-message").textContent = "Thanks! Your request is saved on this browser.";
        renderList();
      } else {
        document.getElementById("request-message").textContent = "Could not save your request. Please check browser storage and retry.";
      }
    });
    renderList();
  }

  function renderAbout() {
    const host = document.getElementById("developer-grid");
    if (!host) return;
    host.innerHTML = (window.RATING_HUB_DEVELOPERS || []).map((person) => `<article class="developer-card"><span class="developer-avatar" aria-hidden="true">${esc(person.initials)}</span><h3>${esc(person.name)}</h3><p>${esc(person.role)}</p><a class="button-secondary" href="mailto:${esc(person.email)}">Inbox →</a></article>`).join("");
  }

  function boot() {
    window.RatingHubChrome.mount();
    window.RatingHubAuth.bind();
    const page = document.body.dataset.page;
    if (page === "home") renderHome();
    if (page === "search") renderSearch();
    if (page === "wishlist") renderWishlist();
    if (page === "demand") renderDemand();
    if (page === "game") window.RatingHubGamePage.renderGame();
    if (page === "compare") window.RatingHubCompare.renderPicker();
    if (page === "comparison-results") window.RatingHubCompare.renderResults();
    if (page === "comparison-summary") window.RatingHubCompare.renderSummary();
    if (page === "profile") window.RatingHubAuth.renderProfile();
    if (page === "about") renderAbout();
  }
  document.addEventListener("DOMContentLoaded", boot);
})();
