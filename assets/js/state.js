/**
 * QuestIndex - State, Recursive Badge Leveling & Google Form Feed Service
 * Pure Vanilla JavaScript (ES6)
 */

(function () {
  "use strict";

  const DATA = window.QUEST_INDEX_DATA;
  const STORAGE_KEYS = {
    auth: "questindex_auth_v1",
    formCfg: "questindex_form_cfg_v1",
    cachedUpdates: "questindex_cached_updates_v1",
    theme: "questindex_theme_v1"
  };

  function getThemePreference() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.theme);
      if (saved === "system" || saved === "dark" || saved === "light") return saved;
    } catch (_) {
      /* ignore */
    }
    return "system";
  }

  function resolveEffectiveTheme(pref) {
    if (pref === "dark" || pref === "light") return pref;
    const prefersDark =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }

  function applyTheme(pref = getThemePreference(), persist = false) {
    const effective = resolveEffectiveTheme(pref);
    document.documentElement.setAttribute("data-theme", effective);
    document.documentElement.setAttribute("data-theme-mode", pref);
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEYS.theme, pref);
      } catch (_) {
        /* ignore */
      }
    }
    return { pref, effective };
  }

  function initThemeListener(onChange) {
    applyTheme(getThemePreference(), false);
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", () => {
      if (getThemePreference() === "system") {
        const res = applyTheme("system", false);
        if (typeof onChange === "function") onChange(res);
      }
    });
  }

  function getRankTitle(level) {
    const titles = [
      "Index Scout",
      "Lore Seeker",
      "Vault Explorer",
      "Quest Pathfinder",
      "Master Archivist",
      "Grand Curate"
    ];
    if (level <= titles.length) return titles[level - 1];
    return `Mythic Curator Lv.${level}`;
  }

  /**
   * Recursive leveling: Level 2 at 5 pts, Level 3 at 10 pts, Level 4 at 15 pts, etc.
   */
  function calculateBadgeProgress(points, level = 1, nextThreshold = 5) {
    if (points < nextThreshold) {
      return {
        level,
        points,
        nextThreshold,
        prevThreshold: nextThreshold - 5,
        pointsToNext: nextThreshold - points,
        rankTitle: getRankTitle(level)
      };
    }
    return calculateBadgeProgress(points, level + 1, nextThreshold + 5);
  }

  function loadAuthState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.auth);
      if (raw) return JSON.parse(raw);
    } catch (_) {
      /* ignore storage errors */
    }
    return { loggedIn: false, username: "Mario12", points: 0 };
  }

  function saveAuthState(state) {
    try {
      localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(state));
    } catch (_) {
      /* ignore */
    }
  }

  function loadFormConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.formCfg);
      if (raw) return { ...DATA.defaultGoogleFormConfig, ...JSON.parse(raw) };
    } catch (_) {
      /* ignore */
    }
    return { ...DATA.defaultGoogleFormConfig };
  }

  function saveFormConfig(cfg) {
    try {
      localStorage.setItem(STORAGE_KEYS.formCfg, JSON.stringify(cfg));
    } catch (_) {
      /* ignore */
    }
  }

  function showToast(message) {
    let container = document.getElementById("qi-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "qi-toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    const item = document.createElement("div");
    item.className = "toast-item";
    item.textContent = message;
    container.appendChild(item);
    setTimeout(() => {
      item.style.opacity = "0";
      item.style.transform = "translateY(-6px)";
      item.style.transition = "all 220ms ease";
      setTimeout(() => item.remove(), 240);
    }, 3400);
  }

  function parseCsvRows(csvText) {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    return lines.slice(1).map((line, idx) => {
      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const getCol = (keywords, fallbackIdx) => {
        const found = headers.findIndex((h) => keywords.some((k) => h.includes(k)));
        return cols[found >= 0 ? found : fallbackIdx] || "";
      };
      return {
        id: `live-gf-${idx}`,
        gameTitle: getCol(["game", "title"], 1) || "Community Game Review",
        reviewer: getCol(["name", "user", "author"], 2) || "Form Contributor",
        rating: parseFloat(getCol(["rate", "score", "star"], 3)) || 4.5,
        comment:
          getCol(["review", "feedback", "comment"], 4) ||
          cols[cols.length - 1] ||
          "New Google Form submission.",
        timestamp: getCol(["time", "date"], 0) || "Just now",
        badge: "Live Google Form"
      };
    });
  }

  async function fetchGoogleFormUpdates() {
    const cfg = loadFormConfig();
    if (!cfg.publishedCsvUrl) {
      return { source: "sample", items: DATA.fallbackFormUpdates };
    }
    try {
      const res = await fetch(cfg.publishedCsvUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const parsed = parseCsvRows(text);
      if (parsed.length > 0) {
        try {
          localStorage.setItem(STORAGE_KEYS.cachedUpdates, JSON.stringify(parsed));
        } catch (_) {}
        return { source: "live", items: parsed.slice(0, 8) };
      }
      return { source: "sample", items: DATA.fallbackFormUpdates };
    } catch (_) {
      return { source: "fallback", items: DATA.fallbackFormUpdates };
    }
  }


  /**
   * Live Steam Store Engine Search & Indexer
   * Queries Steam store API or jsonp/CORS proxy to mimic all Steam games dynamically
   */
  async function searchSteamStoreEngine(term) {
    const q = (term || "").trim();
    if (!q) return [];

    // Fallback known catalog matching
    const localMatches = DATA.games.filter(g => 
      g.title.toLowerCase().includes(q.toLowerCase()) || 
      g.genre.toLowerCase().includes(q.toLowerCase())
    );

    try {
      // Query Steam storesearch API via lightweight open proxy or direct fetch
      const steamApiUrl = "https://store.steampowered.com/api/storesearch/?term=" + encodeURIComponent(q) + "&l=english&cc=US";
      const proxyUrl = "https://api.allorigins.win/get?url=" + encodeURIComponent(steamApiUrl);
      
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const parsed = JSON.parse(data.contents);
        if (parsed && parsed.items && parsed.items.length > 0) {
          const liveSteamGames = parsed.items.map((item) => {
            const appId = String(item.id);
            const title = item.name;
            const price = item.price ? (item.price.final ? "$" + (item.price.final / 100).toFixed(2) : "Free") : "Free to Play";
            
            // Check if already in local index
            const existing = DATA.games.find(g => String(g.steamAppId) === appId);
            if (existing) return existing;

            // Generate synthetic indexed game object for dynamically discovered Steam game
            const newSteamGame = {
              id: "steam-" + appId,
              title: title,
              genre: "Steam Game",
              platform: "PC (Steam)",
              year: 2024,
              dateBucket: "2024-2026",
              rating: 4.8,
              featured: false,
              trending: true,
              recent: true,
              newList: true,
              store: "Steam Store",
              steamAppId: appId,
              steamUrl: "https://store.steampowered.com/app/" + appId + "/",
              thumbnailUrl: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/" + appId + "/header.jpg",
              trailerTheme: "castle",
              accent: "#f97316",
              bgStops: ["#171a21", "#1b2838"],
              tagline: title + " - Available on Steam (" + price + ")",
              description: title + " is indexed directly from the Steam Store engine. Click 'Play on Steam' to launch or explore the full Steam store page and community hub.",
              reviews: [
                { user: "SteamCommunity", score: 5.0, text: "Very Positive reviews on Steam Store." },
                { user: "ValveCurator", score: 4.8, text: "Seamless Steam Deck & PC controller support." }
              ]
            };

            // Dynamically register into DATA.games catalog for full app access
            DATA.games.push(newSteamGame);
            return newSteamGame;
          });

          return liveSteamGames;
        }
      }
    } catch (_) {
      // If network offline or proxy restricted, rely on local games
    }

    return localMatches;
  }

  window.QuestIndex = window.QuestIndex || {};
  window.QuestIndex.state = {
    calculateBadgeProgress,
    loadAuthState,
    saveAuthState,
    loadFormConfig,
    saveFormConfig,
    showToast,
    fetchGoogleFormUpdates,
    getThemePreference,
    resolveEffectiveTheme,
    applyTheme,
    initThemeListener,
    searchSteamStoreEngine
  };
})();
