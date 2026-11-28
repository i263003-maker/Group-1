const RAWG_API_KEY = "4f0a7ba27aa645ceb69cee641ef5924d"; // Paste your RAWG API key here (free at https://rawg.io/apidocs)

const STORAGE_KEY = "gamehub_selected_comparison";

// Default demo pair if opened without an API key or query parameters
const DEFAULT_DEMO_PAIR = {
  game1: {
    id: "demo-dead-space",
    name: "Dead Space (Remake)",
    rating10: 9.0,
    platforms: ["PS5", "PC", "Xbox Series S/X"],
    genres: ["Horror", "Action"],
    released: "2023-01-27",
    backgroundImage: ""
  },
  game2: {
    id: "demo-callisto-protocol",
    name: "The Callisto Protocol",
    rating10: 6.9,
    platforms: ["PS5", "PC", "Xbox Series S/X"],
    genres: ["Horror", "Survival"],
    released: "2022-12-02",
    backgroundImage: ""
  }
};

const elements = {
  menuToggle: document.getElementById("menuToggle"),
  mainNav: document.getElementById("mainNav"),
  apiNotice: document.getElementById("apiNotice"),
  processingCard: document.getElementById("processingCard"),
  stepFetching: document.getElementById("stepFetching"),
  stepComparing: document.getElementById("stepComparing"),
  stepComplete: document.getElementById("stepComplete"),
  resultsSection: document.getElementById("resultsSection"),
  errorCard: document.getElementById("errorCard"),
  errorMessage: document.getElementById("errorMessage"),
  game1Cover: document.getElementById("game1Cover"),
  game2Cover: document.getElementById("game2Cover"),
  game1Title: document.getElementById("game1Title"),
  game2Title: document.getElementById("game2Title"),
  thGame1: document.getElementById("thGame1"),
  thGame2: document.getElementById("thGame2"),
  cellRating1: document.getElementById("cellRating1"),
  cellRating2: document.getElementById("cellRating2"),
  cellPlatform1: document.getElementById("cellPlatform1"),
  cellPlatform2: document.getElementById("cellPlatform2"),
  cellGenre1: document.getElementById("cellGenre1"),
  cellGenre2: document.getElementById("cellGenre2"),
  cellRelease1: document.getElementById("cellRelease1"),
  cellRelease2: document.getElementById("cellRelease2"),
  calculateWinnerBtn: document.getElementById("calculateWinnerBtn")
};

let resolvedGames = null;

function setupNavigation() {
  elements.menuToggle.addEventListener("click", () => {
    const isOpen = elements.mainNav.classList.toggle("open");
    elements.menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeRawgDetails(raw) {
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

async function fetchRawgGameById(id) {
  const apiKey = RAWG_API_KEY.trim();
  const url = `https://api.rawg.io/api/games/${encodeURIComponent(id)}?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch game ${id} from RAWG (${response.status})`);
  }
  const data = await response.json();
  return normalizeRawgDetails(data);
}

function readStoredPair() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.game1 && parsed.game2) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

async function resolveComparedGames() {
  const params = new URLSearchParams(window.location.search);
  const id1 = params.get("game1");
  const id2 = params.get("game2");
  const stored = readStoredPair();
  const apiKey = RAWG_API_KEY.trim();

  if (apiKey && id1 && id2 && !id1.startsWith("demo-") && !id2.startsWith("demo-")) {
    const [game1, game2] = await Promise.all([fetchRawgGameById(id1), fetchRawgGameById(id2)]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ game1, game2 }));
    return { game1, game2 };
  }

  if (stored) {
    return stored;
  }

  if (apiKey && (!id1 || !id2)) {
    // Default live RAWG lookup for Dead Space (2023) vs The Callisto Protocol if opened directly
    const [game1, game2] = await Promise.all([
      fetchRawgGameById("58777"),
      fetchRawgGameById("535998")
    ]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ game1, game2 }));
    return { game1, game2 };
  }

  return DEFAULT_DEMO_PAIR;
}

function renderCover(containerEl, game) {
  containerEl.replaceChildren();
  if (game.backgroundImage) {
    const img = document.createElement("img");
    img.src = game.backgroundImage;
    img.alt = `${game.name} cover`;
    containerEl.appendChild(img);
  } else {
    const title = document.createElement("span");
    title.className = "cover-fallback-title";
    title.textContent = game.name;
    containerEl.appendChild(title);
  }
}

function renderResults(game1, game2) {
  renderCover(elements.game1Cover, game1);
  renderCover(elements.game2Cover, game2);

  elements.game1Title.textContent = game1.name;
  elements.game2Title.textContent = game2.name;
  elements.thGame1.textContent = game1.name;
  elements.thGame2.textContent = game2.name;

  elements.cellRating1.textContent = game1.rating10 > 0 ? `${game1.rating10.toFixed(1)} / 10` : "N/A";
  elements.cellRating2.textContent = game2.rating10 > 0 ? `${game2.rating10.toFixed(1)} / 10` : "N/A";

  elements.cellRating1.classList.toggle("rating-highlight", game1.rating10 > game2.rating10);
  elements.cellRating2.classList.toggle("rating-highlight", game2.rating10 > game1.rating10);

  elements.cellPlatform1.textContent = game1.platforms.slice(0, 4).join(", ");
  elements.cellPlatform2.textContent = game2.platforms.slice(0, 4).join(", ");

  elements.cellGenre1.textContent = game1.genres.slice(0, 3).join(", ");
  elements.cellGenre2.textContent = game2.genres.slice(0, 3).join(", ");

  elements.cellRelease1.textContent = game1.released;
  elements.cellRelease2.textContent = game2.released;
}

function goToSummary() {
  if (!resolvedGames) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resolvedGames));
  const params = new URLSearchParams({
    game1: resolvedGames.game1.id,
    game2: resolvedGames.game2.id
  });
  window.location.href = `comparison-summary.html?${params.toString()}`;
}

async function init() {
  setupNavigation();
  if (!RAWG_API_KEY.trim()) {
    elements.apiNotice.hidden = false;
  }

  elements.calculateWinnerBtn.addEventListener("click", goToSummary);

  try {
    const [pair] = await Promise.all([resolveComparedGames(), wait(550)]);
    resolvedGames = pair;

    elements.stepFetching.classList.remove("active");
    elements.stepFetching.classList.add("done");
    elements.stepComparing.classList.add("active");
    await wait(550);

    elements.stepComparing.classList.remove("active");
    elements.stepComparing.classList.add("done");
    elements.stepComplete.classList.add("done");
    await wait(350);

    renderResults(pair.game1, pair.game2);
    elements.processingCard.hidden = true;
    elements.resultsSection.hidden = false;
  } catch (error) {
    elements.processingCard.hidden = true;
    elements.errorMessage.textContent = error.message;
    elements.errorCard.hidden = false;
  }
}

init();
