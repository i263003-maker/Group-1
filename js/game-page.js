(function () {
  "use strict";
  const state = window.RatingHubState;
  const esc = (value) => window.RatingHubChrome.escapeHtml(value);
  const games = () => window.GAME_HUB?.games || [];
  const byId = (id) => games().find((game) => String(game.id) === String(id));

  function reviewsFor(game) {
    const seeded = (game.reviews || []).map((review) => ({ ...review, seeded: true }));
    return [...state.getReviews(game.id), ...seeded];
  }

  function renderGame() {
    const id = new URLSearchParams(location.search).get("id");
    const game = byId(id);
    const content = document.getElementById("game-content");
    const missing = document.getElementById("game-not-found");
    if (!content || !missing) return;
    if (!game) { missing.hidden = false; return; }
    content.hidden = false;
    document.title = `${game.title} — Rating Hub`;
    const banner = document.getElementById("game-banner");
    banner.src = game.banner || game.cover || "";
    banner.alt = `${game.title} artwork`;
    banner.onerror = () => { banner.style.display = "none"; };
    document.getElementById("game-title").textContent = game.title;
    document.getElementById("game-tagline").textContent = game.tagline || `${(game.genres || []).join(" · ")} · ${game.year || "Release year not listed"}`;
    document.getElementById("game-summary").textContent = game.summary || "A community-selected title in the Rating Hub catalog.";
    document.getElementById("game-kicker").textContent = `// ${game.year || "Year TBA"} · ${(game.genres || []).slice(0, 3).join(" / ")}`;
    document.getElementById("editor-score").textContent = Number(game.editorScore || game.rating || 0).toFixed(1);
    document.getElementById("game-meta").innerHTML = [
      ["Release", game.releaseDate || game.year || "Not listed"],
      ["Developer", game.developer || "Not listed"],
      ["Publisher", game.publisher || "Not listed"],
      ["Platforms", (game.platforms || []).join(", ") || "Not listed"]
    ].map(([label, value]) => `<div class="meta-item"><small>${esc(label)}</small><strong>${esc(value)}</strong></div>`).join("");
    const pros = game.pros || [];
    const cons = game.cons || [];
    document.getElementById("game-pros").innerHTML = pros.length ? pros.map((text) => `<li>${esc(text)}</li>`).join("") : `<li>Players value its ${esc((game.genres || ["gameplay"]).slice(0, 2).join(" and "))} experience.</li>`;
    document.getElementById("game-cons").innerHTML = cons.length ? cons.map((text) => `<li>${esc(text)}</li>`).join("") : `<li>Check platform availability and current store details before purchasing.</li>`;
    const compare = document.getElementById("compare-game");
    compare.href = `pages/compare.html?gameA=${encodeURIComponent(game.id)}`;
    document.getElementById("all-reviews-link").href = `pages/reviews.html?id=${encodeURIComponent(game.id)}`;
    document.getElementById("write-review-link").href = `pages/write-review.html?id=${encodeURIComponent(game.id)}`;
    const wishlistButton = document.getElementById("wishlist-toggle");
    const updateWishlistButton = () => {
      const saved = state.getWishlist().includes(String(game.id));
      wishlistButton.textContent = saved ? "♥ In your wishlist" : "♡ Add to wishlist";
    };
    updateWishlistButton();
    wishlistButton.onclick = () => {
      if (!state.getCurrentUser()) { window.location.href = "pages/login.html"; return; }
      state.toggleWishlist(game.id);
      updateWishlistButton();
      window.RatingHubChrome.renderAuthPanel();
      window.RatingHubChrome.toast("Wishlist updated.");
    };
    const platform = document.getElementById("review-platform");
    platform.innerHTML = (game.platforms?.length ? game.platforms : ["PC"]).map((item) => `<option>${esc(item)}</option>`).join("");
    const slider = document.getElementById("review-score");
    slider.addEventListener("input", () => { document.getElementById("review-score-value").textContent = `${Number(slider.value).toFixed(1)} / 10`; });
    document.getElementById("review-sort").addEventListener("change", renderReviews);
    document.getElementById("review-filter").addEventListener("change", renderReviews);
    document.getElementById("review-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const message = document.getElementById("review-message");
      if (!state.getCurrentUser()) {
        window.location.href = `pages/login.html?next=${encodeURIComponent(`pages/game.html?id=${game.id}#community-reviews`)}`;
        return;
      }
      const result = state.addReview(game.id, {
        score: slider.value,
        platform: platform.value,
        headline: document.getElementById("review-headline").value,
        body: document.getElementById("review-body").value
      });
      message.textContent = result.message || "Review published.";
      message.className = result.ok ? "accent" : "muted";
      if (result.ok) {
        event.currentTarget.reset();
        slider.value = "8.5";
        document.getElementById("review-score-value").textContent = "8.5 / 10";
        renderReviews();
      }
    });
    const related = games().filter((item) => item.id !== game.id && item.genres?.some((genre) => game.genres?.includes(genre))).slice(0, 4);
    document.getElementById("related-games").innerHTML = related.map((item) => `<a class="related-item" href="pages/game.html?id=${encodeURIComponent(item.id)}"><img src="${esc(item.cover || "")}" alt="" loading="lazy"><span><strong>${esc(item.title)}</strong><small>★ ${Number(item.rating).toFixed(1)} · ${esc(item.year || "Year TBA")}</small></span></a>`).join("") || `<p class="muted">More titles are being added.</p>`;
    renderReviews();
  }

  function renderReviews() {
    const game = byId(new URLSearchParams(location.search).get("id"));
    if (!game) return;
    const allReviews = reviewsFor(game);
    let reviews = allReviews.slice();
    const filter = document.getElementById("review-filter")?.value || "all";
    if (filter === "positive") reviews = reviews.filter((review) => Number(review.score) >= 7);
    if (filter === "mixed") reviews = reviews.filter((review) => Number(review.score) >= 5 && Number(review.score) < 7);
    if (filter === "critical") reviews = reviews.filter((review) => Number(review.score) < 5);
    const sort = document.getElementById("review-sort")?.value || "recent";
    if (sort === "helpful") reviews.sort((a, b) => getHelpfulCount(game.id, b) - getHelpfulCount(game.id, a));
    if (sort === "high") reviews.sort((a, b) => Number(b.score) - Number(a.score));
    if (sort === "low") reviews.sort((a, b) => Number(a.score) - Number(b.score));
    const count = allReviews.length;
    const average = count ? allReviews.reduce((sum, review) => sum + Number(review.score || 0), 0) / count : null;
    document.getElementById("community-score").textContent = average === null ? "—" : average.toFixed(1);
    document.getElementById("community-verdict").textContent = average === null ? "No player reviews yet" : average >= 8.5 ? "A community favourite" : average >= 7 ? "A strong pick" : "Community score";
    document.getElementById("community-caption").textContent = count ? `Based on ${count} player review${count === 1 ? "" : "s"}.` : "Be the first player to review this title.";
    document.getElementById("review-count").textContent = `(${count})`;
    const bins = [
      { label: "9–10", min: 9, max: 10.01 },
      { label: "7–8.9", min: 7, max: 9 },
      { label: "5–6.9", min: 5, max: 7 },
      { label: "3–4.9", min: 3, max: 5 },
      { label: "1–2.9", min: 1, max: 3 }
    ];
    document.getElementById("rating-breakdown").innerHTML = bins.map((bin) => {
      const number = allReviews.filter((review) => Number(review.score) >= bin.min && Number(review.score) < bin.max).length;
      const pct = count ? Math.round(number / count * 100) : 0;
      return `<div class="bar-row"><span>${bin.label}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><span>${number}</span></div>`;
    }).join("");
    document.getElementById("review-list").innerHTML = reviews.map((review) => {
      const helpful = state.getHelpful(game.id, review.id);
      const comments = state.getComments(game.id, review);
      const date = review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Community pick";
      return `<article class="review-card">
        <div class="review-card-head"><div class="review-author"><span class="review-avatar">${esc((review.author || "P").slice(0, 1).toUpperCase())}</span><span><strong>${esc(review.author || "Rating Hub player")}</strong><small>${esc(review.platform || "PC")} · ${esc(date)}</small></span></div><span class="review-score">★ ${Number(review.score || 0).toFixed(1)}</span></div>
        <h3 class="review-headline">${esc(review.headline || "Player review")}</h3><p class="review-body">${esc(review.body || "")}</p>
        <div class="review-actions"><button type="button" data-helpful="${esc(review.id)}" class="${helpful.active ? "is-active" : ""}">Helpful · ${getHelpfulCount(game.id, review)}</button><span class="muted">${comments.length} comment${comments.length === 1 ? "" : "s"}</span></div>
        <div class="comment-list">${comments.map((comment) => `<div class="comment"><strong>${esc(comment.author)}:</strong> ${esc(comment.body)}</div>`).join("")}</div>
        <form class="comment-form" data-comment="${esc(review.id)}"><label class="sr-only" for="comment-${esc(review.id)}">Add a comment</label><input id="comment-${esc(review.id)}" maxlength="400" required placeholder="Add a thoughtful comment…"><button class="button-secondary" type="submit">Reply</button></form>
      </article>`;
    }).join("") || `<div class="empty-state">${filter === "all" ? "No written reviews yet. Be the first player to share a thoughtful review." : "No reviews match this rating filter."}</div>`;
    document.getElementById("review-list").querySelectorAll("[data-helpful]").forEach((button) => {
      button.addEventListener("click", () => {
        const result = state.toggleHelpful(game.id, button.dataset.helpful);
        if (!result.ok) { window.location.href = "pages/login.html"; return; }
        renderReviews();
      });
    });
    document.getElementById("review-list").querySelectorAll("[data-comment]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = form.querySelector("input");
        const result = state.addComment(game.id, form.dataset.comment, input.value);
        if (!result.ok) { window.location.href = "pages/login.html"; return; }
        renderReviews();
      });
    });
  }

  function getHelpfulCount(gameId, review) {
    return Number(review.helpful || 0) + state.getHelpful(gameId, review.id).count;
  }

  function renderDedicatedComposer() {
    const id = new URLSearchParams(location.search).get("id");
    const game = byId(id);
    const content = document.getElementById("write-review-content");
    const missing = document.getElementById("write-review-missing");
    if (!content || !missing) return;
    if (!game) { missing.hidden = false; return; }
    content.hidden = false;
    document.title = `Write a review for ${game.title} — Rating Hub`;
    const cover = document.getElementById("write-review-cover");
    cover.src = game.cover || "";
    cover.alt = `${game.title} cover`;
    cover.onerror = () => { cover.style.display = "none"; };
    document.getElementById("write-review-title").textContent = game.title;
    document.getElementById("write-review-meta").textContent = `// ${game.year || "Year TBA"} · ${(game.genres || []).slice(0, 3).join(" / ")}`;
    document.getElementById("write-review-intro").textContent = `Tell other players what makes ${game.title} worth their time.`;
    const gameUrl = `pages/game.html?id=${encodeURIComponent(game.id)}`;
    document.getElementById("write-review-back").href = gameUrl;
    document.getElementById("write-review-cancel").href = gameUrl;
    document.getElementById("write-review-platform").innerHTML = (game.platforms?.length ? game.platforms : ["PC"]).map((platform) => `<option>${esc(platform)}</option>`).join("");
    const form = document.getElementById("write-review-form");
    const authMessage = document.getElementById("write-review-auth-message");
    const ownReview = state.getReviews(game.id).find((review) => review.userId === state.getCurrentUser()?.id);
    if (!state.getCurrentUser()) {
      const next = `pages/write-review.html?id=${encodeURIComponent(game.id)}`;
      authMessage.hidden = false;
      authMessage.innerHTML = `Sign in before publishing. <a href="pages/login.html?next=${encodeURIComponent(next)}">Log in and return to this form →</a>`;
      form.querySelectorAll("input, textarea, select, button").forEach((control) => { control.disabled = true; });
      return;
    }
    if (ownReview) {
      authMessage.hidden = false;
      authMessage.textContent = "You have already reviewed this game from this account. You can update or discuss your review on the game page.";
      form.querySelectorAll("input, textarea, select, button").forEach((control) => { control.disabled = true; });
      return;
    }
    const score = document.getElementById("write-review-score");
    score.addEventListener("input", () => { document.getElementById("write-review-score-value").textContent = `${Number(score.value).toFixed(1)} / 10`; });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const result = state.addReview(game.id, {
        score: score.value,
        platform: document.getElementById("write-review-platform").value,
        headline: document.getElementById("write-review-headline").value,
        body: document.getElementById("write-review-body").value,
        pros: document.getElementById("write-review-pros").value,
        cons: document.getElementById("write-review-cons").value
      });
      const message = document.getElementById("write-review-message");
      message.hidden = false;
      message.textContent = result.message || (result.ok ? "Your review is published." : "Your review could not be published.");
      message.classList.toggle("is-success", result.ok);
      if (result.ok) {
        form.reset();
        form.querySelectorAll("input, textarea, select, button").forEach((control) => { control.disabled = true; });
        authMessage.hidden = false;
        authMessage.textContent = "Your review is now part of the community. Thank you for sharing your experience.";
      }
    });
  }

  window.RatingHubGamePage = { renderGame, renderDedicatedComposer };
})();
