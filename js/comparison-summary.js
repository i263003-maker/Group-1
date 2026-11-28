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
  calculatingCard: document.getElementById("calculatingCard"),
  calcStatus: document.getElementById("calcStatus"),
  progressTrack: document.getElementById("progressTrack"),
  progressFill: document.getElementById("progressFill"),
  calcReveal: document.getElementById("calcReveal"),
  bannerWinnerName: document.getElementById("bannerWinnerName"),
  bannerWinsCallout: document.getElementById("bannerWinsCallout"),
  viewSummaryBtn: document.getElementById("viewSummaryBtn"),
  summarySection: document.getElementById("summarySection"),
  winnerCoverBox: document.getElementById("winnerCoverBox"),
  winnerHeading: document.getElementById("winnerHeading"),
  summaryWinnerTitle: document.getElementById("summaryWinnerTitle"),
  summaryWinnerScore: document.getElementById("summaryWinnerScore"),
  summaryWinnerTagline: document.getElementById("summaryWinnerTagline"),
  summaryWinnerMargin: document.getElementById("summaryWinnerMargin"),
  errorCard: document.getElementById("errorCard"),
  errorMessage: document.getElementById("errorMessage")
};

function setupNavigation() {
  elements.menuToggle.addEventListener("click", () => {
    const isOpen = elements.mainNav.classList.toggle("open");
    elements.menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
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
    const [game1, game2] = await Promise.all([
      fetchRawgGameById("58777"),
      fetchRawgGameById("535998")
    ]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ game1, game2 }));
    return { game1, game2 };
  }

  return DEFAULT_DEMO_PAIR;
}

function determineOutcome(game1, game2) {
  if (game1.rating10 === game2.rating10) {
    return {
      isTie: true,
      winner: game1,
      runnerUp: game2
    };
  }

  const winner = game1.rating10 > game2.rating10 ? game1 : game2;
  const runnerUp = winner === game1 ? game2 : game1;

  return {
    isTie: false,
    winner,
    runnerUp
  };
}

function animateProgress() {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress = Math.min(100, progress + 10);
      elements.progressFill.style.width = `${progress}%`;
      elements.progressTrack.setAttribute("aria-valuenow", String(progress));

      if (progress >= 100) {
        clearInterval(interval);
        resolve();
      }
    }, 95);
  });
}

function renderWinnerCover(game) {
  elements.winnerCoverBox.replaceChildren();
  if (game.backgroundImage) {
    const img = document.createElement("img");
    img.src = game.backgroundImage;
    img.alt = `${game.name} cover`;
    elements.winnerCoverBox.appendChild(img);
  } else {
    const title = document.createElement("span");
    title.className = "cover-fallback-title";
    title.textContent = game.name;
    elements.winnerCoverBox.appendChild(title);
  }
}

function populateSummary(outcome) {
  const { isTie, winner, runnerUp } = outcome;

  if (isTie) {
    elements.bannerWinnerName.textContent = `${winner.name} & ${runnerUp.name}`;
    elements.bannerWinsCallout.textContent = "☆ Tie Game! ☆";
    elements.winnerHeading.textContent = "Tied By Rating";
    elements.summaryWinnerTitle.textContent = `${winner.name} vs ${runnerUp.name}`;
    elements.summaryWinnerScore.textContent =
      winner.rating10 > 0 ? `${winner.rating10.toFixed(1)} / 10` : "N/A";
    elements.summaryWinnerTagline.textContent = "Both games earned the exact same rating!";
    elements.summaryWinnerMargin.textContent = "No rating margin separates these titles.";
  } else {
    const diff = (winner.rating10 - runnerUp.rating10).toFixed(1);
    elements.bannerWinnerName.textContent = winner.name;
    elements.bannerWinsCallout.textContent = "☆ Wins! ☆";
    elements.winnerHeading.textContent = "Winner By Rating";
    elements.summaryWinnerTitle.textContent = winner.name;
    elements.summaryWinnerScore.textContent =
      winner.rating10 > 0 ? `${winner.rating10.toFixed(1)} / 10` : "N/A";
    elements.summaryWinnerTagline.textContent = "Highest-rated game!";
    elements.summaryWinnerMargin.textContent =
      `Ahead of ${runnerUp.name} (${runnerUp.rating10.toFixed(1)}/10) by +${diff} points.`;
  }

  renderWinnerCover(winner);
}

async function init() {
  setupNavigation();
  if (!RAWG_API_KEY.trim()) {
    elements.apiNotice.hidden = false;
  }

  elements.viewSummaryBtn.addEventListener("click", () => {
    elements.calculatingCard.hidden = true;
    elements.summarySection.hidden = false;
  });

  try {
    const [pair] = await Promise.all([resolveComparedGames(), animateProgress()]);
    const outcome = determineOutcome(pair.game1, pair.game2);

    populateSummary(outcome);
    elements.calcStatus.textContent = "Winner Calculated!";
    elements.calcReveal.hidden = false;
  } catch (error) {
    elements.calculatingCard.hidden = true;
    elements.errorMessage.textContent = error.message;
    elements.errorCard.hidden = false;
  }
}

init();
