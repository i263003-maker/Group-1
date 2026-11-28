const RAWG_API_KEY = "4f0a7ba27aa645ceb69cee641ef5924d"; // Paste your RAWG API key here (free at https://rawg.io/apidocs)

const STORAGE_KEY = "gamehub_selected_comparison";

// Fallback sample games used only while RAWG_API_KEY is empty
const DEMO_GAMES = [
  {
    id: "demo-dead-space",
    name: "Dead Space (Remake)",
    rating10: 9.0,
    platforms: ["PS5", "PC", "Xbox Series S/X"],
    genres: ["Horror", "Action"],
    released: "2023-01-27",
    backgroundImage: ""
  },
  {
    id: "demo-callisto-protocol",
    name: "The Callisto Protocol",
    rating10: 6.9,
    platforms: ["PS5", "PC", "Xbox Series S/X"],
    genres: ["Horror", "Survival"],
    released: "2022-12-02",
    backgroundImage: ""
  },
  {
    id: "demo-elden-ring",
    name: "Elden Ring",
    rating10: 9.4,
    platforms: ["PC", "PS5", "PS4", "Xbox Series S/X"],
    genres: ["Action", "RPG"],
    released: "2022-02-25",
    backgroundImage: ""
  },
  {
    id: "demo-re4-remake",
    name: "Resident Evil 4 (Remake)",
    rating10: 9.1,
    platforms: ["PC", "PS5", "PS4", "Xbox Series S/X"],
    genres: ["Horror", "Action"],
    released: "2023-03-24",
    backgroundImage: ""
  },
  {
    id: "demo-gow-ragnarok",
    name: "God of War Ragnarök",
    rating10: 9.2,
    platforms: ["PS5", "PS4", "PC"],
    genres: ["Action", "Adventure"],
    released: "2022-11-09",
    backgroundImage: ""
  },
  {
    id: "demo-cyberpunk-2077",
    name: "Cyberpunk 2077",
    rating10: 8.6,
    platforms: ["PC", "PS5", "Xbox Series S/X"],
    genres: ["RPG", "Action"],
    released: "2020-12-10",
    backgroundImage: ""
  }
];

const state = {
  game1: null,
  game2: null
};

const elements = {
  menuToggle: document.getElementById("menuToggle"),
  mainNav: document.getElementById("mainNav"),
  apiNotice: document.getElementById("apiNotice"),
  searchGame1: document.getElementById("searchGame1"),
  searchGame2: document.getElementById("searchGame2"),
  clearGame1: document.getElementById("clearGame1"),
  clearGame2: document.getElementById("clearGame2"),
  suggestions1: document.getElementById("suggestions1"),
  suggestions2: document.getElementById("suggestions2"),
  previewGame1: document.getElementById("previewGame1"),
  previewGame2: document.getElementById("previewGame2"),
  validationPill: document.getElementById("validationPill"),
  statusIcon: document.getElementById("statusIcon"),
  statusText: document.getElementById("statusText"),
  compareBtn: document.getElementById("compareBtn")
};

function setupNavigation() {
  elements.menuToggle.addEventListener("click", () => {
    const isOpen = elements.mainNav.classList.toggle("open");
    elements.menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function normalizeRawgGame(raw) {
  const ratingTop = raw.rating_top || 5;
  let rating10 = 0;
  if (typeof raw.rating === "number" && raw.rating > 0) {
    rating10 = Number(((raw.rating / ratingTop) * 10).toFixed(1));
  } else if (typeof raw.metacritic === "number" && raw.metacritic > 0) {
    rating10 = Number((raw.metacritic / 10).toFixed(1));
  }

  const platforms = Array.isArray(raw.platforms)
    ? raw.platforms.map((entry) => entry.platform && entry.platform.name).filter(Boolean)
    : [];

  const genres = Array.isArray(raw.genres)
    ? raw.genres.map((genre) => genre.name).filter(Boolean)
    : [];

  return {
    id: String(raw.id),
    name: raw.name || "Unknown Game",
    rating10,
    platforms: platforms.length ? platforms : ["N/A"],
    genres: genres.length ? genres : ["N/A"],
    released: raw.released || "TBA",
    backgroundImage: raw.background_image || ""
  };
}

async function searchGames(query) {
  const trimmed = query.trim();
  const apiKey = RAWG_API_KEY.trim();

  if (!apiKey) {
    const lower = trimmed.toLowerCase();
    return DEMO_GAMES.filter((game) => game.name.toLowerCase().includes(lower));
  }

  const url = `https://api.rawg.io/api/games?key=${encodeURIComponent(apiKey)}&search=${encodeURIComponent(trimmed)}&page_size=6`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`RAWG API error (${response.status})`);
  }
  const data = await response.json();
  return (data.results || []).map(normalizeRawgGame);
}

function renderSuggestions(listEl, games, onSelect) {
  listEl.replaceChildren();

  if (!games.length) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "suggestion-message";
    emptyItem.textContent = "No matching games found.";
    listEl.appendChild(emptyItem);
    listEl.hidden = false;
    return;
  }

  games.forEach((game) => {
    const item = document.createElement("li");
    item.className = "suggestion-item";
    item.setAttribute("role", "option");

    if (game.backgroundImage) {
      const img = document.createElement("img");
      img.className = "suggestion-thumb";
      img.src = game.backgroundImage;
      img.alt = game.name;
      item.appendChild(img);
    } else {
      const fallback = document.createElement("div");
      fallback.className = "suggestion-thumb-fallback";
      fallback.textContent = game.name.slice(0, 3).toUpperCase();
      item.appendChild(fallback);
    }

    const meta = document.createElement("div");
    meta.className = "suggestion-meta";

    const nameEl = document.createElement("span");
    nameEl.className = "suggestion-name";
    nameEl.textContent = game.name;

    const subEl = document.createElement("span");
    subEl.className = "suggestion-sub";
    const year = game.released && game.released !== "TBA" ? game.released.slice(0, 4) : "TBA";
    const ratingText = game.rating10 > 0 ? `${game.rating10.toFixed(1)}/10` : "Unrated";
    subEl.textContent = `${year} • ${ratingText}`;

    meta.append(nameEl, subEl);
    item.appendChild(meta);

    item.addEventListener("mousedown", (event) => {
      event.preventDefault();
      onSelect(game);
    });

    listEl.appendChild(item);
  });

  listEl.hidden = false;
}

function renderSelectedPreview(previewEl, game) {
  previewEl.replaceChildren();

  if (!game) {
    previewEl.classList.remove("filled");
    previewEl.classList.add("empty");
    const placeholder = document.createElement("p");
    placeholder.className = "preview-placeholder";
    placeholder.textContent = "No game selected yet. Start typing to search.";
    previewEl.appendChild(placeholder);
    return;
  }

  previewEl.classList.remove("empty");
  previewEl.classList.add("filled");

  if (game.backgroundImage) {
    const img = document.createElement("img");
    img.className = "preview-cover";
    img.src = game.backgroundImage;
    img.alt = `${game.name} cover`;
    previewEl.appendChild(img);
  } else {
    const coverText = document.createElement("div");
    coverText.className = "preview-cover-text";
    coverText.textContent = game.name;
    previewEl.appendChild(coverText);
  }

  const info = document.createElement("div");
  info.className = "preview-info";

  const title = document.createElement("h3");
  title.className = "preview-title";
  title.textContent = game.name;

  const details = document.createElement("p");
  details.className = "preview-details";
  details.textContent = `${game.genres.slice(0, 2).join(", ")} • ${game.released}`;

  const rating = document.createElement("span");
  rating.className = "preview-rating";
  rating.textContent = game.rating10 > 0 ? `Rating: ${game.rating10.toFixed(1)} / 10` : "Rating: N/A";

  info.append(title, details, rating);
  previewEl.appendChild(info);
}

function updateValidationState() {
  const { game1, game2 } = state;
  const pill = elements.validationPill;

  pill.classList.remove("pending", "warning", "valid");

  if (!game1 || !game2) {
    pill.classList.add("pending");
    elements.statusIcon.textContent = "•";
    elements.statusText.textContent = "Choose two games above to enable comparison.";
    elements.compareBtn.disabled = true;
    return;
  }

  if (game1.id === game2.id) {
    pill.classList.add("warning");
    elements.statusIcon.textContent = "!";
    elements.statusText.textContent = "Please select two different games to compare.";
    elements.compareBtn.disabled = true;
    return;
  }

  pill.classList.add("valid");
  elements.statusIcon.textContent = "✓";
  elements.statusText.textContent = "Both games selected!";
  elements.compareBtn.disabled = false;
}

function bindSlot(slotKey, inputEl, clearEl, listEl, previewEl) {
  let debounceTimer = null;

  const selectGame = (game) => {
    state[slotKey] = game;
    inputEl.value = game.name;
    clearEl.hidden = false;
    listEl.hidden = true;
    renderSelectedPreview(previewEl, game);
    updateValidationState();
  };

  const clearSelection = () => {
    state[slotKey] = null;
    inputEl.value = "";
    clearEl.hidden = true;
    listEl.hidden = true;
    renderSelectedPreview(previewEl, null);
    updateValidationState();
    inputEl.focus();
  };

  const runSearch = async (query) => {
    listEl.replaceChildren();
    const loading = document.createElement("li");
    loading.className = "suggestion-message";
    loading.textContent = "Searching games...";
    listEl.appendChild(loading);
    listEl.hidden = false;

    try {
      const results = await searchGames(query);
      renderSuggestions(listEl, results, selectGame);
    } catch (error) {
      listEl.replaceChildren();
      const errItem = document.createElement("li");
      errItem.className = "suggestion-message";
      errItem.textContent = `${error.message}. Check your RAWG API key.`;
      listEl.appendChild(errItem);
      listEl.hidden = false;
    }
  };

  inputEl.addEventListener("input", () => {
    const query = inputEl.value.trim();
    clearEl.hidden = query.length === 0;

    if (state[slotKey] && state[slotKey].name !== inputEl.value) {
      state[slotKey] = null;
      renderSelectedPreview(previewEl, null);
      updateValidationState();
    }

    clearTimeout(debounceTimer);
    if (!query && RAWG_API_KEY.trim()) {
      listEl.hidden = true;
      return;
    }

    debounceTimer = setTimeout(() => {
      runSearch(query);
    }, 260);
  });

  inputEl.addEventListener("focus", () => {
    if (!RAWG_API_KEY.trim() && !state[slotKey]) {
      renderSuggestions(listEl, DEMO_GAMES, selectGame);
    }
  });

  inputEl.addEventListener("blur", () => {
    setTimeout(() => {
      listEl.hidden = true;
    }, 150);
  });

  clearEl.addEventListener("click", clearSelection);
}

function handleCompareClick() {
  if (!state.game1 || !state.game2 || state.game1.id === state.game2.id) {
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      game1: state.game1,
      game2: state.game2
    })
  );

  const params = new URLSearchParams({
    game1: state.game1.id,
    game2: state.game2.id
  });
  window.location.href = `comparison-results.html?${params.toString()}`;
}

function init() {
  setupNavigation();
  if (!RAWG_API_KEY.trim()) {
    elements.apiNotice.hidden = false;
  }

  bindSlot("game1", elements.searchGame1, elements.clearGame1, elements.suggestions1, elements.previewGame1);
  bindSlot("game2", elements.searchGame2, elements.clearGame2, elements.suggestions2, elements.previewGame2);

  elements.compareBtn.addEventListener("click", handleCompareClick);
  updateValidationState();
}

init();
