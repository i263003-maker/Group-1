(function () {
  "use strict";
  const esc = (value) => window.RatingHubChrome.escapeHtml(value);
  const games = () => window.GAME_HUB?.games || [];
  const find = (id) => games().find((game) => String(game.id) === String(id));
  const params = () => new URLSearchParams(location.search);
  const setPair = (a, b) => { localStorage.setItem("ratingHub.compare.v1", JSON.stringify([a.id, b.id])); };
  const getPair = () => {
    try { return JSON.parse(localStorage.getItem("ratingHub.compare.v1") || "[]"); } catch (error) { console.warn("Could not read comparison selection.", error); return []; }
  };
  const cover = (game) => esc(game.cover || "");
  const listText = (values) => (values || []).join(", ") || "Not listed";

  function renderPicker() {
    const selected = [null, null];
    const inputs = ["game-a-input", "game-b-input"].map((id) => document.getElementById(id));
    if (!inputs[0] || !inputs[1]) return;
    const renderPreview = (index, game) => {
      selected[index] = game;
      document.getElementById(`game-${index ? "b" : "a"}-preview`).innerHTML = game ? `<div class="compare-preview"><img src="${cover(game)}" alt="" onerror="this.style.display='none'"><div><h3>${esc(game.title)}</h3><span class="muted">★ ${Number(game.rating).toFixed(1)} · ${esc(game.year || "Year TBA")}</span></div></div>` : "";
      const valid = selected[0] && selected[1] && selected[0].id !== selected[1].id;
      document.getElementById("compare-start").disabled = !valid;
      document.getElementById("compare-status").textContent = valid ? "Both picks are ready. Compare the details, then get your verdict." : selected[0] && selected[1] ? "Choose two different titles." : "Choose two different games to start.";
    };
    inputs.forEach((input, index) => {
      const key = index ? "b" : "a";
      const list = document.getElementById(`game-${key}-suggestions`);
      input.addEventListener("input", () => {
        const matches = window.RatingHubSearch.search(input.value, { sort: "relevance" }).slice(0, 7);
        list.innerHTML = matches.map((game) => `<div class="suggestion" role="option" tabindex="0" data-id="${esc(game.id)}"><span>${esc(game.title)}</span><small>★ ${Number(game.rating).toFixed(1)} · ${esc(game.year || "TBA")}</small></div>`).join("") || `<div class="suggestion">No matching games.</div>`;
        list.hidden = false;
        list.querySelectorAll("[data-id]").forEach((option) => {
          const choose = () => { const game = find(option.dataset.id); input.value = game.title; list.hidden = true; renderPreview(index, game); };
          option.addEventListener("click", choose);
          option.addEventListener("keydown", (event) => { if (event.key === "Enter") choose(); });
        });
      });
    });
    const query = params();
    const first = find(query.get("gameA"));
    const second = find(query.get("gameB"));
    if (first) { inputs[0].value = first.title; renderPreview(0, first); }
    if (second) { inputs[1].value = second.title; renderPreview(1, second); }
    document.getElementById("compare-start").addEventListener("click", () => {
      if (!selected[0] || !selected[1] || selected[0].id === selected[1].id) return;
      setPair(selected[0], selected[1]);
      location.href = "pages/comparison-results.html";
    });
  }

  function renderResults() {
    const host = document.getElementById("comparison-results");
    if (!host) return;
    const [a, b] = getPair().map(find);
    if (!a || !b) { host.innerHTML = `<div class="empty-state">Your comparison is missing. <a href="pages/compare.html">Choose two games</a>.</div>`; return; }
    const metrics = [
      ["Rating", Number(a.rating || 0), Number(b.rating || 0), "/ 10"],
      ["Release year", Number(a.year || 0), Number(b.year || 0), ""],
      ["Genres", (a.genres || []).length, (b.genres || []).length, " genres"],
      ["Platforms", (a.platforms || []).length, (b.platforms || []).length, " platforms"]
    ];
    host.innerHTML = `<div class="comparison-grid">${[a, b].map((game) => `<article class="comparison-card"><img src="${cover(game)}" alt="${esc(game.title)} cover" onerror="this.style.display='none'"><div class="comparison-card-body"><p class="eyebrow">${esc(game.year || "Release year TBA")}</p><h2>${esc(game.title)}</h2><p class="muted">${esc(game.summary || "")}</p><div class="chip-row">${(game.genres || []).slice(0, 4).map((genre) => `<span class="chip">${esc(genre)}</span>`).join("")}</div></div></article>`).join("")}</div>
      <section class="panel section"><h2>At a glance</h2><table class="comparison-table"><thead><tr><th>Attribute</th><th>${esc(a.title)}</th><th>${esc(b.title)}</th></tr></thead><tbody>
      <tr><td>Rating</td><td>★ ${Number(a.rating || 0).toFixed(1)} / 10</td><td>★ ${Number(b.rating || 0).toFixed(1)} / 10</td></tr>
      <tr><td>Release</td><td>${esc(a.releaseDate || a.year || "Not listed")}</td><td>${esc(b.releaseDate || b.year || "Not listed")}</td></tr>
      <tr><td>Genres</td><td>${esc(listText(a.genres))}</td><td>${esc(listText(b.genres))}</td></tr>
      <tr><td>Platforms</td><td>${esc(listText(a.platforms))}</td><td>${esc(listText(b.platforms))}</td></tr>
      <tr><td>Developer</td><td>${esc(a.developer || "Not listed")}</td><td>${esc(b.developer || "Not listed")}</td></tr>
      </tbody></table><div class="stat-compare">${metrics.map(([label, av, bv, unit]) => {
        const max = Math.max(av, bv, 1);
        return `<div class="stat-line"><span>${label}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(av / max * 100)}%"></div></div><strong>${av || "—"}${unit}</strong></div><div class="stat-line"><span>${label}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(bv / max * 100)}%"></div></div><strong>${bv || "—"}${unit}</strong></div>`;
      }).join("")}</div></section>`;
    document.getElementById("change-games")?.setAttribute("href", `pages/compare.html?gameA=${encodeURIComponent(a.id)}&gameB=${encodeURIComponent(b.id)}`);
    document.getElementById("calculate-winner")?.addEventListener("click", () => { location.href = "pages/comparison-summary.html"; });
  }

  function renderSummary() {
    const host = document.getElementById("summary-content");
    if (!host) return;
    const [a, b] = getPair().map(find);
    if (!a || !b) { host.innerHTML = `<div class="empty-state">Choose games before viewing a verdict. <a href="pages/compare.html">Start a comparison</a>.</div>`; return; }
    const scoreA = Number(a.rating || 0), scoreB = Number(b.rating || 0);
    const winner = scoreA === scoreB ? null : scoreA > scoreB ? a : b;
    document.getElementById("summary-intro").textContent = winner ? `${winner.title} leads on the catalog score. Your ideal choice still depends on the genres and platforms you prefer.` : "These games are tied on the current catalog rating. Let genre, release era, and platform availability guide your pick.";
    host.innerHTML = `<section class="winner-banner"><p class="eyebrow">// ${winner ? "Highest catalog rating" : "It's a tie"}</p><h2>${esc(winner?.title || `${a.title} & ${b.title}`)}</h2><p>${winner ? `Rating Hub score ${Number(winner.rating || 0).toFixed(1)} / 10, compared with ${Number(winner === a ? b.rating : a.rating).toFixed(1)} for ${esc(winner === a ? b.title : a.title)}.` : `Both titles have a ${scoreA.toFixed(1)} / 10 catalog score.`}</p><p class="muted">Ratings are one useful signal, not a guarantee of personal fit. Check platform support and player reviews before choosing.</p></section>
      <div class="comparison-grid section">${[a, b].map((game) => `<article class="panel"><p class="eyebrow">${esc(game.year || "Year TBA")}</p><h3>${esc(game.title)}</h3><p class="accent">★ ${Number(game.rating || 0).toFixed(1)} / 10</p><p class="muted">${esc(listText(game.genres))}</p><a href="pages/game.html?id=${encodeURIComponent(game.id)}">Read player reviews →</a></article>`).join("")}</div>`;
  }
  window.RatingHubCompare = { renderPicker, renderResults, renderSummary };
})();
