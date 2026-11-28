(function () {
  "use strict";

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\bii\b/g, "2")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  function distance(left, right) {
    const rows = Array.from({ length: left.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= right.length; j += 1) rows[0][j] = j;
    for (let i = 1; i <= left.length; i += 1) {
      for (let j = 1; j <= right.length; j += 1) {
        rows[i][j] = Math.min(
          rows[i - 1][j] + 1,
          rows[i][j - 1] + 1,
          rows[i - 1][j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1)
        );
      }
    }
    return rows[left.length][right.length];
  }

  function values(game) {
    return [
      game.title, game.year, game.releaseDate, game.developer, game.publisher,
      ...(game.aliases || []), ...(game.genres || []), ...(game.tags || []),
      ...(game.platforms || []), game.rating
    ].filter((value) => value !== null && value !== undefined).map(normalize);
  }

  function score(game, query) {
    const q = normalize(query);
    if (!q) return 1;
    const title = normalize(game.title);
    const fields = values(game);
    if (title === q) return 120;
    if (title.startsWith(q)) return 105;
    if (title.includes(q)) return 90;
    const words = q.split(" ");
    const titleWords = title.split(" ");
    if (words.every((word) => titleWords.some((part) => part.includes(word)))) return 75;
    if (fields.some((field) => field.includes(q))) return 55;
    const qTokens = q.split(" ");
    const titleDistance = Math.min(...titleWords.map((word) => distance(q, word)));
    if (q.length >= 4 && titleDistance <= Math.max(1, Math.floor(q.length * 0.22))) return 35 - titleDistance;
    if (qTokens.length > 1 && qTokens.every((word) => fields.some((field) => field.split(" ").some((part) => distance(word, part) <= 1)))) return 25;
    return 0;
  }

  function search(query, options) {
    const opts = options || {};
    let results = (window.GAME_HUB?.games || [])
      .map((game) => ({ game, relevance: score(game, query) }))
      .filter((entry) => entry.relevance > 0)
      .filter(({ game }) => !opts.genre || opts.genre === "all" || game.genres.includes(opts.genre))
      .filter(({ game }) => !opts.platform || opts.platform === "all" || game.platforms.includes(opts.platform))
      .filter(({ game }) => !opts.era || opts.era === "all" || (
        opts.era === "classic" ? game.year && game.year < 2015 :
          opts.era === "recent" ? game.year && game.year >= 2020 :
            opts.era === "2015-2019" ? game.year >= 2015 && game.year <= 2019 :
              opts.era === "unknown" ? !game.year : true
      ));

    switch (opts.sort) {
      case "rating-asc": results.sort((a, b) => a.game.rating - b.game.rating); break;
      case "year-asc": results.sort((a, b) => (a.game.year || 9999) - (b.game.year || 9999)); break;
      case "year-desc": results.sort((a, b) => (b.game.year || 0) - (a.game.year || 0)); break;
      case "title": results.sort((a, b) => a.game.title.localeCompare(b.game.title)); break;
      case "relevance": results.sort((a, b) => b.relevance - a.relevance || b.game.rating - a.game.rating); break;
      default: results.sort((a, b) => b.game.rating - a.game.rating);
    }
    return results.map(({ game }) => game);
  }

  window.RatingHubSearch = { normalize, score, search };
})();
