/**
 * Game Detail, Inline Info Editor, Wishlist & Permanent Review Page (game.html)
 */
(function () {
  const {
    escapeHtml,
    getVerdictLabel,
    getScoreClass,
    formatScore,
    formatDate,
    showToast,
    openModal,
    closeModal,
    updateNavbarIndicators,
    initSharedChrome
  } = window.GameHubUI;

  let currentGame = null;
  let allGames = [];
  let currentSource = "seed";

  function getRequestedGameId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || params.get("slug") || "";
  }

  function parseCsvList(input) {
    return String(input || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function parseLineList(input) {
    return String(input || "")
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function renderWishlistState() {
    if (!currentGame) return;
    const wishlisted = window.GameHubStorage.isWishlisted(currentGame.id);
    const btn = document.getElementById("wishlistBtn");
    const label = document.getElementById("wishlistBtnLabel");
    const icon = btn.querySelector(".heart-icon");

    btn.classList.toggle("is-wishlisted", wishlisted);
    btn.setAttribute("aria-pressed", String(wishlisted));
    icon.textContent = wishlisted ? "♥" : "♡";
    label.textContent = wishlisted ? "Wishlisted" : "Add to Wishlist";
    updateNavbarIndicators();
  }

  function renderScoreCards(game) {
    const editorBadge = document.getElementById("editorScoreBadge");
    const editorVerdict = document.getElementById("editorVerdictLabel");
    const editorScore = game.editorScore;

    editorBadge.className = `score-badge-lg ${getScoreClass(editorScore)}`;
    editorBadge.textContent = formatScore(editorScore);
    editorVerdict.textContent = getVerdictLabel(editorScore);

    const reviews = game.reviews || [];
    const commBadge = document.getElementById("communityScoreBadge");
    const commVerdict = document.getElementById("communityVerdictLabel");
    const countLabel = document.getElementById("reviewCountLabel");
    const distEl = document.getElementById("scoreDistribution");

    if (!reviews.length) {
      commBadge.className = "score-badge-lg community";
      commBadge.textContent = "—";
      commVerdict.textContent = "No reviews yet";
      countLabel.textContent = "Be the first player to leave a permanent review.";
      distEl.innerHTML = "";
      return;
    }

    const avg = reviews.reduce((sum, r) => sum + Number(r.score || 0), 0) / reviews.length;
    commBadge.className = `score-badge-lg ${getScoreClass(avg)}`;
    commBadge.textContent = formatScore(avg);
    commVerdict.textContent = getVerdictLabel(avg);
    countLabel.textContent = `Based on ${reviews.length} permanent ${
      reviews.length === 1 ? "review" : "reviews"
    }`;

    const buckets = [
      { label: "9–10", count: reviews.filter((r) => r.score >= 9).length },
      { label: "7–8.5", count: reviews.filter((r) => r.score >= 7 && r.score < 9).length },
      { label: "5–6.5", count: reviews.filter((r) => r.score >= 5 && r.score < 7).length },
      { label: "< 5", count: reviews.filter((r) => r.score < 5).length }
    ];

    distEl.innerHTML = buckets
      .map((b) => {
        const pct = Math.round((b.count / reviews.length) * 100);
        return `
          <div class="bar-row">
            <span>${b.label}</span>
            <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
            <span>${b.count}</span>
          </div>
        `;
      })
      .join("");
  }

  function renderReviewsList() {
    if (!currentGame) return;
    const reviews = [...(currentGame.reviews || [])];
    const platformFilter = document.getElementById("reviewsPlatformFilter").value;
    const sortBy = document.getElementById("reviewsSort").value;

    const filtered =
      platformFilter === "ALL"
        ? reviews
        : reviews.filter((r) => (r.platform || "") === platformFilter);

    filtered.sort((a, b) => {
      if (sortBy === "highest") return Number(b.score) - Number(a.score);
      if (sortBy === "lowest") return Number(a.score) - Number(b.score);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    document.getElementById("reviewsHeaderCount").textContent = String(reviews.length);

    const listEl = document.getElementById("reviewsList");
    if (!filtered.length) {
      listEl.innerHTML = `<p class="muted">No reviews match this filter yet.</p>`;
      return;
    }

    listEl.innerHTML = filtered
      .map((r) => {
        const prosHtml = (r.pros || [])
          .map((p) => `<span class="tag-pro">+ ${escapeHtml(p)}</span>`)
          .join("");
        const consHtml = (r.cons || [])
          .map((c) => `<span class="tag-con">&minus; ${escapeHtml(c)}</span>`)
          .join("");

        return `
          <article class="review-card">
            <div class="review-card-head">
              <div style="display:flex; gap:0.85rem; align-items:flex-start;">
                <div class="review-score-pill ${getScoreClass(r.score)}">${escapeHtml(
                  formatScore(r.score)
                )}</div>
                <div>
                  <h4 class="review-headline">${escapeHtml(r.headline)}</h4>
                  <div class="review-author-line">
                    <strong>${escapeHtml(r.author)}</strong>
                    <span>&middot;</span>
                    <span class="chip">${escapeHtml(r.platform || "PC")}</span>
                    <span>&middot;</span>
                    <span>${escapeHtml(formatDate(r.createdAt))}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                class="btn btn-ghost btn-sm"
                data-delete-review="${escapeHtml(r.id)}"
                title="Delete this review"
              >
                Delete
              </button>
            </div>
            <p class="review-body">${escapeHtml(r.body)}</p>
            ${
              prosHtml || consHtml
                ? `<div class="review-tags">${prosHtml}${consHtml}</div>`
                : ""
            }
          </article>
        `;
      })
      .join("");
  }

  function renderRelatedGames() {
    const container = document.getElementById("relatedGamesList");
    const others = allGames.filter((g) => g.id !== currentGame.id);
    if (!others.length) {
      container.innerHTML = `<p class="muted">No other games in catalog.</p>`;
      return;
    }

    container.innerHTML = others
      .map(
        (g) => `
        <a class="related-item" href="game.html?id=${encodeURIComponent(g.id)}">
          <img src="${escapeHtml(g.coverImage || "assets/cover-erdtree.svg")}" alt="${escapeHtml(
            g.title
          )}" />
          <div>
            <strong>${escapeHtml(g.title)}</strong>
            <div class="muted" style="font-size:0.8rem;">${escapeHtml(g.developer || "")}</div>
          </div>
          <span class="related-item-score ${getScoreClass(g.editorScore)}">${escapeHtml(
            formatScore(g.editorScore)
          )}</span>
        </a>
      `
      )
      .join("");
  }

  function renderGamePage(game) {
    currentGame = game;
    document.title = `${game.title} — Game Info & Reviews // RatingHub`;

    document.getElementById("crumbGameTitle").textContent = game.title;
    document.getElementById("gameTitle").textContent = game.title;
    document.getElementById("gameTagline").textContent = game.tagline || "";

    const coverImg = document.getElementById("gameCoverImg");
    coverImg.src = game.coverImage || "assets/cover-erdtree.svg";
    coverImg.alt = `${game.title} cover art`;

    const bannerImg = document.getElementById("heroBannerImg");
    bannerImg.src = game.bannerImage || game.coverImage || "assets/banner-erdtree.svg";
    bannerImg.alt = `${game.title} banner`;

    document.getElementById("metaDeveloper").textContent = game.developer || "—";
    document.getElementById("metaPublisher").textContent = game.publisher || "—";
    document.getElementById("metaReleaseDate").textContent = formatDate(game.releaseDate);
    document.getElementById("metaAgeRating").textContent = game.ageRating || "NR";
    document.getElementById("metaPlaytime").textContent = game.playtime || "—";

    document.getElementById("gameGenres").innerHTML = (game.genres || [])
      .map((g) => `<span class="chip chip-genre">${escapeHtml(g)}</span>`)
      .join("");

    document.getElementById("gamePlatforms").innerHTML = (game.platforms || [])
      .map((p) => `<span class="chip">${escapeHtml(p)}</span>`)
      .join("");

    document.getElementById("gameSummary").textContent = game.summary || "";

    document.getElementById("gameProsList").innerHTML = (game.pros || []).length
      ? game.pros.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
      : `<li class="muted">No pros listed yet.</li>`;

    document.getElementById("gameConsList").innerHTML = (game.cons || []).length
      ? game.cons.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
      : `<li class="muted">No cons listed yet.</li>`;

    const shots = game.screenshots && game.screenshots.length
      ? game.screenshots
      : [game.bannerImage || game.coverImage].filter(Boolean);

    document.getElementById("screenshotsGallery").innerHTML = shots
      .map(
        (src, idx) => `
        <button type="button" class="screenshot-thumb" data-lightbox-src="${escapeHtml(
          src
        )}" aria-label="View screenshot ${idx + 1}">
          <img src="${escapeHtml(src)}" alt="${escapeHtml(game.title)} screenshot ${idx + 1}" />
        </button>
      `
      )
      .join("");

    document.getElementById("gameSpecsTable").innerHTML = `
      <div><dt>Title</dt><dd>${escapeHtml(game.title)}</dd></div>
      <div><dt>Developer</dt><dd>${escapeHtml(game.developer || "—")}</dd></div>
      <div><dt>Publisher</dt><dd>${escapeHtml(game.publisher || "—")}</dd></div>
      <div><dt>Release Date</dt><dd>${escapeHtml(formatDate(game.releaseDate))}</dd></div>
      <div><dt>Platforms</dt><dd>${escapeHtml((game.platforms || []).join(", ") || "—")}</dd></div>
      <div><dt>Genres</dt><dd>${escapeHtml((game.genres || []).join(", ") || "—")}</dd></div>
      <div><dt>Age Rating</dt><dd>${escapeHtml(game.ageRating || "NR")}</dd></div>
      <div><dt>Est. Playtime</dt><dd>${escapeHtml(game.playtime || "—")}</dd></div>
    `;

    const platformOptions = game.platforms && game.platforms.length ? game.platforms : ["PC"];
    document.getElementById("revPlatform").innerHTML = platformOptions
      .map((p) => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`)
      .join("");

    const allReviewPlatforms = new Set([
      ...platformOptions,
      ...(game.reviews || []).map((r) => r.platform).filter(Boolean)
    ]);
    document.getElementById("reviewsPlatformFilter").innerHTML =
      `<option value="ALL">All Platforms</option>` +
      Array.from(allReviewPlatforms)
        .map((p) => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`)
        .join("");

    const isGhWrite = window.GameHubStorage.isGitHubWriteConfigured();
    document.getElementById("reviewPersistHint").textContent = isGhWrite
      ? "Auto-committing to GitHub"
      : "Saved in browser (connect GitHub Sync to commit)";

    document.getElementById("dataSourceFooter").textContent = `Data source: ${currentSource}`;

    renderWishlistState();
    renderScoreCards(game);
    renderReviewsList();
    renderRelatedGames();
  }

  function populateEditForm(game) {
    document.getElementById("editTitle").value = game.title || "";
    document.getElementById("editReleaseDate").value = game.releaseDate || "";
    document.getElementById("editTagline").value = game.tagline || "";
    document.getElementById("editDeveloper").value = game.developer || "";
    document.getElementById("editPublisher").value = game.publisher || "";
    document.getElementById("editEditorScore").value =
      game.editorScore !== undefined && game.editorScore !== null ? game.editorScore : "";
    document.getElementById("editAgeRating").value = game.ageRating || "";
    document.getElementById("editPlaytime").value = game.playtime || "";
    document.getElementById("editPlatforms").value = (game.platforms || []).join(", ");
    document.getElementById("editGenres").value = (game.genres || []).join(", ");
    document.getElementById("editCoverImage").value = game.coverImage || "";
    document.getElementById("editBannerImage").value = game.bannerImage || "";
    document.getElementById("editScreenshots").value = (game.screenshots || []).join("\n");
    document.getElementById("editSummary").value = game.summary || "";
    document.getElementById("editPros").value = (game.pros || []).join("\n");
    document.getElementById("editCons").value = (game.cons || []).join("\n");
  }

  async function loadPage() {
    const requestedId = getRequestedGameId();
    const { game, data, source } = await window.GameHubStorage.getGameById(requestedId);
    allGames = data.games || [];
    currentSource = source;

    const notFoundEl = document.getElementById("gameNotFound");
    const contentEl = document.getElementById("gamePageContent");

    if (!game) {
      notFoundEl.hidden = false;
      contentEl.hidden = true;
      return;
    }

    notFoundEl.hidden = true;
    contentEl.hidden = false;
    renderGamePage(game);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    initSharedChrome({ onDataRefresh: loadPage });

    document.getElementById("wishlistBtn").addEventListener("click", () => {
      if (!currentGame) return;
      const result = window.GameHubStorage.toggleWishlist(currentGame.id);
      renderWishlistState();
      showToast(
        result.wishlisted
          ? `Added "${currentGame.title}" to your Wishlist (saved locally until accounts launch).`
          : `Removed "${currentGame.title}" from your Wishlist.`,
        "info"
      );
    });

    document.getElementById("jumpToReviewBtn").addEventListener("click", () => {
      document.getElementById("reviewComposerSection").scrollIntoView({ behavior: "smooth" });
      document.getElementById("revAuthor").focus();
    });

    const openEdit = () => {
      if (!currentGame) return;
      populateEditForm(currentGame);
      openModal("editGameModal");
    };
    document.getElementById("openEditInfoBtn").addEventListener("click", openEdit);
    document.getElementById("inlineEditInfoBtn").addEventListener("click", openEdit);

    document.getElementById("editGameForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!currentGame) return;

      const rawScore = document.getElementById("editEditorScore").value;
      const editorScore = rawScore === "" ? null : Math.max(0, Math.min(10, Number(rawScore)));

      const updates = {
        title: document.getElementById("editTitle").value.trim(),
        releaseDate: document.getElementById("editReleaseDate").value.trim(),
        tagline: document.getElementById("editTagline").value.trim(),
        developer: document.getElementById("editDeveloper").value.trim(),
        publisher: document.getElementById("editPublisher").value.trim(),
        editorScore,
        editorVerdict: editorScore !== null ? getVerdictLabel(editorScore) : "Unrated",
        ageRating: document.getElementById("editAgeRating").value.trim(),
        playtime: document.getElementById("editPlaytime").value.trim(),
        platforms: parseCsvList(document.getElementById("editPlatforms").value),
        genres: parseCsvList(document.getElementById("editGenres").value),
        coverImage: document.getElementById("editCoverImage").value.trim(),
        bannerImage: document.getElementById("editBannerImage").value.trim(),
        screenshots: parseLineList(document.getElementById("editScreenshots").value),
        summary: document.getElementById("editSummary").value.trim(),
        pros: parseLineList(document.getElementById("editPros").value),
        cons: parseLineList(document.getElementById("editCons").value)
      };

      try {
        const { game, persistResult } = await window.GameHubStorage.updateGameInfo(
          currentGame.id,
          updates
        );
        closeModal("editGameModal");
        renderGamePage(game);
        showToast(
          persistResult.syncedGitHub
            ? "Game info updated & committed to GitHub!"
            : "Game info updated locally (configure GitHub Sync to commit).",
          "success"
        );
      } catch (err) {
        showToast(err.message || "Failed to save game changes.", "error");
      }
    });

    const revScoreInput = document.getElementById("revScore");
    revScoreInput.addEventListener("input", () => {
      const val = Number(revScoreInput.value);
      document.getElementById("revScoreValue").textContent = val.toFixed(1);
      document.getElementById("revScoreVerdict").textContent = getVerdictLabel(val);
    });

    document.getElementById("reviewForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!currentGame) return;

      const submitBtn = document.getElementById("submitReviewBtn");
      submitBtn.disabled = true;

      try {
        const { game, persistResult } = await window.GameHubStorage.addReview(currentGame.id, {
          author: document.getElementById("revAuthor").value,
          platform: document.getElementById("revPlatform").value,
          score: document.getElementById("revScore").value,
          headline: document.getElementById("revHeadline").value,
          body: document.getElementById("revBody").value,
          pros: parseCsvList(document.getElementById("revPros").value),
          cons: parseCsvList(document.getElementById("revCons").value)
        });

        event.target.reset();
        document.getElementById("revScore").value = "8.5";
        document.getElementById("revScoreValue").textContent = "8.5";
        document.getElementById("revScoreVerdict").textContent = "Great";

        renderGamePage(game);
        showToast(
          persistResult.syncedGitHub
            ? "Review published permanently to GitHub!"
            : "Review saved permanently in this browser (configure GitHub Sync to commit to repo).",
          "success"
        );
      } catch (err) {
        showToast(err.message || "Could not publish review.", "error");
      } finally {
        submitBtn.disabled = false;
      }
    });

    document.getElementById("reviewsPlatformFilter").addEventListener("change", renderReviewsList);
    document.getElementById("reviewsSort").addEventListener("change", renderReviewsList);

    document.getElementById("reviewsList").addEventListener("click", async (event) => {
      const btn = event.target.closest("[data-delete-review]");
      if (!btn || !currentGame) return;
      const reviewId = btn.getAttribute("data-delete-review");
      try {
        const { game, persistResult } = await window.GameHubStorage.deleteReview(
          currentGame.id,
          reviewId
        );
        renderGamePage(game);
        showToast(
          persistResult.syncedGitHub ? "Review removed from GitHub." : "Review removed locally.",
          "info"
        );
      } catch (err) {
        showToast(err.message || "Failed to delete review.", "error");
      }
    });

    document.getElementById("screenshotsGallery").addEventListener("click", (event) => {
      const thumb = event.target.closest("[data-lightbox-src]");
      if (!thumb) return;
      document.getElementById("lightboxImg").src = thumb.getAttribute("data-lightbox-src");
      openModal("lightboxModal");
    });

    await loadPage();
  });
})();
