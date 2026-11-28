/**
 * Hub Catalog Page (index.html)
 * Renders all games and links each card to game.html?id=<game-id>.
 */
(function () {
  const { escapeHtml, formatScore, getScoreClass, initSharedChrome, updateNavbarIndicators } =
    window.GameHubUI;

  let allGames = [];

  function computeCommunityAverage(reviews) {
    if (!reviews || !reviews.length) return null;
    const sum = reviews.reduce((acc, r) => acc + Number(r.score || 0), 0);
    return sum / reviews.length;
  }

  function populateFilters(games) {
    const platformSelect = document.getElementById("hubPlatformFilter");
    const genreSelect = document.getElementById("hubGenreFilter");

    const platforms = new Set();
    const genres = new Set();
    games.forEach((g) => {
      (g.platforms || []).forEach((p) => platforms.add(p));
      (g.genres || []).forEach((genre) => genres.add(genre));
    });

    platformSelect.innerHTML =
      `<option value="ALL">All Platforms</option>` +
      Array.from(platforms)
        .sort()
        .map((p) => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`)
        .join("");

    genreSelect.innerHTML =
      `<option value="ALL">All Genres</option>` +
      Array.from(genres)
        .sort()
        .map((genre) => `<option value="${escapeHtml(genre)}">${escapeHtml(genre)}</option>`)
        .join("");
  }

  function renderGamesGrid() {
    const grid = document.getElementById("gamesGrid");
    const query = (document.getElementById("hubSearchInput").value || "").trim().toLowerCase();
    const platform = document.getElementById("hubPlatformFilter").value;
    const genre = document.getElementById("hubGenreFilter").value;
    const wishlist = new Set(window.GameHubStorage.getWishlist());

    const filtered = allGames.filter((g) => {
      const matchesQuery =
        !query ||
        g.title.toLowerCase().includes(query) ||
        (g.developer || "").toLowerCase().includes(query) ||
        (g.genres || []).some((item) => item.toLowerCase().includes(query));

      const matchesPlatform =
        platform === "ALL" || (g.platforms || []).includes(platform);

      const matchesGenre = genre === "ALL" || (g.genres || []).includes(genre);

      return matchesQuery && matchesPlatform && matchesGenre;
    });

    if (!filtered.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <h2>No matching games found</h2>
          <p>Try clearing your search or filters.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered
      .map((game) => {
        const communityAvg = computeCommunityAverage(game.reviews);
        const reviewCount = (game.reviews || []).length;
        const score = game.editorScore ?? communityAvg;
        const scoreCls = getScoreClass(score);
        const wishBadge = wishlist.has(game.id)
          ? `<span class="game-card-wish">♥ Wishlisted</span>`
          : "";

        return `
          <a class="game-card" href="game.html?id=${encodeURIComponent(game.id)}">
            <div class="game-card-media">
              <img src="${escapeHtml(game.coverImage || "assets/cover-erdtree.svg")}" alt="${escapeHtml(
                game.title
              )} cover art" loading="lazy" />
              ${wishBadge}
              <span class="game-card-score ${scoreCls}">${escapeHtml(formatScore(score))}</span>
            </div>
            <div class="game-card-body">
              <div class="chip-row">
                ${(game.genres || [])
                  .slice(0, 2)
                  .map((item) => `<span class="chip chip-genre">${escapeHtml(item)}</span>`)
                  .join("")}
              </div>
              <h2>${escapeHtml(game.title)}</h2>
              <div class="game-card-meta">${escapeHtml(game.developer || "Independent")} &middot; ${escapeHtml(
                (game.platforms || []).slice(0, 3).join(", ")
              )}</div>
              <div class="game-card-footer">
                <span>${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}</span>
                <span>Open Game &rarr;</span>
              </div>
            </div>
          </a>
        `;
      })
      .join("");
  }

  async function refreshHub() {
    const { data } = await window.GameHubStorage.loadHubData();
    allGames = data.games || [];
    populateFilters(allGames);
    renderGamesGrid();
    updateNavbarIndicators();
  }

  document.addEventListener("DOMContentLoaded", async () => {
    initSharedChrome({ onDataRefresh: refreshHub });

    document.getElementById("hubSearchInput").addEventListener("input", renderGamesGrid);
    document.getElementById("hubPlatformFilter").addEventListener("change", renderGamesGrid);
    document.getElementById("hubGenreFilter").addEventListener("change", renderGamesGrid);

    await refreshHub();
  });
})();
