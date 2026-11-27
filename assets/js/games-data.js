/**
 * QuestIndex - Game Catalog, Promo Slides, and Google Form Feedback Config
 * Pure Vanilla JavaScript (ES6)
 */

window.QUEST_INDEX_DATA = {
  brandName: "QuestIndex",
  defaultGoogleFormConfig: {
    // Users can replace these in About -> Google Form Setup or localStorage
    formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfDemoGameReviewForm/viewform",
    publishedCsvUrl: "",
    lastSyncedLabel: "Synced from Google Form Reviews"
  },

  // Initial / fallback review updates simulating Google Form responses
  fallbackFormUpdates: [
    {
      id: "gf-101",
      gameTitle: "Stronghold: Definitive Edition",
      reviewer: "CastleLord99",
      rating: 4.7,
      comment: "New siege campaign & co-op trails indexed cleanly. Castle economy feels crisp!",
      timestamp: "2 mins ago",
      badge: "New Index"
    },
    {
      id: "gf-102",
      gameTitle: "Far of Cry",
      reviewer: "TropicalScout",
      rating: 4.4,
      comment: "Open-world island liberation missions and stealth outposts are super smooth.",
      timestamp: "18 mins ago",
      badge: "Review Update"
    },
    {
      id: "gf-103",
      gameTitle: "Age of Empires IV",
      reviewer: "ImperialTactician",
      rating: 4.8,
      comment: "Advance in technology, lift the siege, and fortify your houses — best RTS pacing.",
      timestamp: "1 hour ago",
      badge: "Top Feedback"
    },
    {
      id: "gf-104",
      gameTitle: "Grandmaster Chess Arena",
      reviewer: "RookGambit",
      rating: 4.6,
      comment: "Ranked team blitz matches and puzzle ladders updated via community poll.",
      timestamp: "3 hours ago",
      badge: "Form Entry"
    }
  ],

  // Hero 5-second rotating slides matching prototype.jpeg
  heroSlides: [
    {
      id: "discover",
      heading: "Discover Your Next Favourite Game",
      hasCursor: true,
      iconType: "none",
      promoTitle: "Age of Empires",
      promoStore: "GOG.com",
      promoText:
        "Welcome to the imperial age, where castle falls, then step forward advance in technology lift the siege and tie your houses."
    },
    {
      id: "chess",
      heading: "Rank on your team play chess,",
      hasCursor: false,
      iconType: "chess",
      promoTitle: "Grandmaster Chess Arena",
      promoStore: "GOG.com",
      promoText:
        "Form your squad, climb seasonal ELO ladders, and unlock tactical endgames with verified community reviews."
    },
    {
      id: "zombies",
      heading: "Shoot Zombies earn rewards,",
      hasCursor: false,
      iconType: "zombie",
      promoTitle: "Deadhold: Zombie Outbreak",
      promoStore: "GOG.com",
      promoText:
        "Survive relentless night waves, upgrade heavy arsenals, and stack redeem badges as you explore top-rated survival shooters."
    }
  ],

  // Core Indexed Games Catalog
  games: [
    {
      id: "far-of-cry",
      title: "Far of Cry",
      genre: "Action",
      platform: "PC",
      year: 2025,
      dateBucket: "2024-2026",
      rating: 4.4,
      featured: true,
      trending: true,
      recent: true,
      newList: true,
      store: "GOG.com",
      trailerTheme: "jungle",
      accent: "#f97316",
      bgStops: ["#1e293b", "#7c2d12"],
      tagline: "Tropical guerrilla action across uncharted archipelagos.",
      description:
        "Liberate island strongholds, master improvised stealth gear, and explore dynamic weather ecosystems in this flagship open-world action review favorite.",
      reviews: [
        { user: "Mario12", score: 4.5, text: "Fluid traversal and gorgeous island vistas." },
        { user: "AlyaK", score: 4.3, text: "Co-op outpost takedowns never get old." }
      ]
    },
    {
      id: "age-of-empires",
      title: "Age of Empires IV",
      genre: "Strategy",
      platform: "PC",
      year: 2024,
      dateBucket: "2024-2026",
      rating: 4.8,
      featured: true,
      trending: true,
      recent: true,
      newList: false,
      store: "GOG.com",
      trailerTheme: "castle",
      accent: "#eab308",
      bgStops: ["#1f2937", "#713f12"],
      tagline: "Welcome to the imperial age, where castles fall and empires rise.",
      description:
        "Command asymmetric civilizations, advance through historical ages, lift massive sieges, and fortify bustling medieval cities.",
      reviews: [
        { user: "ImperialTactician", score: 4.9, text: "Peak RTS sound design and siege warfare." },
        { user: "Mario12", score: 4.7, text: "Campaign documentaries are a joy to play through." }
      ]
    },
    {
      id: "stronghold-definitive",
      title: "Stronghold: Definitive Edition",
      genre: "Strategy",
      platform: "PC",
      year: 2024,
      dateBucket: "2024-2026",
      rating: 4.7,
      featured: true,
      trending: true,
      recent: true,
      newList: true,
      store: "GOG.com",
      trailerTheme: "siege",
      accent: "#ef4444",
      bgStops: ["#1c1917", "#7f1d1d"],
      tagline: "Classic castle sim rebuilt with modern siege physics.",
      description:
        "Build thriving medieval economies, man stone battlements with archers, and defend your keep against ruthless feudal lords.",
      reviews: [
        { user: "CastleLord99", score: 4.8, text: "The Wolf's sieges still make my heart race!" }
      ]
    },
    {
      id: "stronghold-crusader",
      title: "Stronghold Crusader HD",
      genre: "Strategy",
      platform: "PC",
      year: 2012,
      dateBucket: "Classic",
      rating: 4.9,
      featured: false,
      trending: true,
      recent: false,
      newList: false,
      store: "GOG.com",
      trailerTheme: "siege",
      accent: "#f59e0b",
      bgStops: ["#292524", "#92400e"],
      tagline: "Desert fortress warfare and 80+ skirmish trails.",
      description:
        "Manage oasis farms, hire desert mercenaries, and breach towering Arab and Crusader citadels under blazing sun.",
      reviews: [
        { user: "SaladinFan", score: 5.0, text: "Timeless skirmish trail masterpiece." }
      ]
    },
    {
      id: "stronghold-legends",
      title: "Stronghold Legends",
      genre: "Strategy",
      platform: "PC",
      year: 2016,
      dateBucket: "Classic",
      rating: 4.1,
      featured: false,
      trending: false,
      recent: false,
      newList: false,
      store: "GOG.com",
      trailerTheme: "castle",
      accent: "#8b5cf6",
      bgStops: ["#1e1b4b", "#4c1d95"],
      tagline: "Mythical dragons, King Arthur, and ice-forged strongholds.",
      description:
        "Lead Arthurian knights, Count Vlad, or Siegfried with supernatural siege units and enchanted fortifications.",
      reviews: [
        { user: "MythicLord", score: 4.1, text: "Dragons flying over castle walls is pure fun." }
      ]
    },
    {
      id: "stronghold-2",
      title: "Stronghold 2: Steam Edition",
      genre: "Strategy",
      platform: "PC",
      year: 2017,
      dateBucket: "Classic",
      rating: 4.2,
      featured: false,
      trending: false,
      recent: false,
      newList: false,
      store: "Steam",
      trailerTheme: "siege",
      accent: "#10b981",
      bgStops: ["#064e3b", "#1e293b"],
      tagline: "Deep medieval estate governance and honor rankings.",
      description:
        "Balance crime, banquets, jousting tournaments, and multi-layered castle defense in full 3D estates.",
      reviews: [
        { user: "FeudalBuilder", score: 4.2, text: "Best peace-sim castle management in the series." }
      ]
    },
    {
      id: "stronghold-warlords",
      title: "Stronghold: Warlords",
      genre: "Strategy",
      platform: "PC",
      year: 2021,
      dateBucket: "2020-2023",
      rating: 3.9,
      featured: false,
      trending: false,
      recent: true,
      newList: false,
      store: "Steam",
      trailerTheme: "castle",
      accent: "#dc2626",
      bgStops: ["#311010", "#1e293b"],
      tagline: "Command gunpowder siege engines and AI warlords across East Asia.",
      description:
        "Recruit diplomatic warlords on the battlefield, deploy fire lances and rocket carts, and conquer imperial dynasties.",
      reviews: [
        { user: "SiegeCraft", score: 3.9, text: "Warlord diplomacy adds neat tactical layers." }
      ]
    },
    {
      id: "grandmaster-chess",
      title: "Grandmaster Chess Arena",
      genre: "Board & Chess",
      platform: "Web",
      year: 2026,
      dateBucket: "2024-2026",
      rating: 4.6,
      featured: false,
      trending: true,
      recent: true,
      newList: true,
      store: "QuestWeb",
      trailerTheme: "chess",
      accent: "#38bdf8",
      bgStops: ["#0f172a", "#1e3a8a"],
      tagline: "Rank on your team, play chess, and master rapid blitz.",
      description:
        "Team-based competitive chess with live puzzle rushes, post-game blunder heatmaps, and tournament clan rankings.",
      reviews: [
        { user: "RookGambit", score: 4.6, text: "Team relay mode is ridiculously addictive." }
      ]
    },
    {
      id: "deadhold-zombies",
      title: "Deadhold: Zombie Outbreak",
      genre: "Shooter",
      platform: "PlayStation",
      year: 2025,
      dateBucket: "2024-2026",
      rating: 4.5,
      featured: false,
      trending: true,
      recent: true,
      newList: true,
      store: "PS Store",
      trailerTheme: "zombie",
      accent: "#22c55e",
      bgStops: ["#052e16", "#18181b"],
      tagline: "Shoot zombies, earn rewards, and hold the quarantine line.",
      description:
        "Four-player tactical extraction shooter featuring dynamic horde mutations, weapon crafting benches, and bounty challenges.",
      reviews: [
        { user: "NightWatch", score: 4.5, text: "Horde AI flanks you relentlessly on Hardcore." }
      ]
    },
    {
      id: "elden-ring",
      title: "Elden Ring: Shadow Edition",
      genre: "RPG",
      platform: "PlayStation",
      year: 2024,
      dateBucket: "2024-2026",
      rating: 4.9,
      featured: false,
      trending: true,
      recent: false,
      newList: false,
      store: "PS Store",
      trailerTheme: "fantasy",
      accent: "#fbbf24",
      bgStops: ["#27272a", "#78350f"],
      tagline: "Rise, Tarnished, across a vast seamless realm of myth.",
      description:
        "Explore towering legacy dungeons, forge custom builds from hundreds of ashes of war, and topple demigods.",
      reviews: [
        { user: "TarnishedOne", score: 5.0, text: "Unmatched sense of discovery and boss design." }
      ]
    },
    {
      id: "hollow-knight",
      title: "Hollow Knight: Voidheart",
      genre: "Action",
      platform: "Switch",
      year: 2020,
      dateBucket: "2020-2023",
      rating: 4.8,
      featured: false,
      trending: false,
      recent: false,
      newList: true,
      store: "eShop",
      trailerTheme: "cyber",
      accent: "#60a5fa",
      bgStops: ["#090d16", "#1e1b4b"],
      tagline: "Descend into Hallownest's hand-drawn subterranean kingdom.",
      description:
        "Tight precision platforming, interconnected cavern secrets, and unforgettable orchestral boss encounters.",
      reviews: [
        { user: "BugKnight", score: 4.9, text: "Every corner hides a hauntingly good secret." }
      ]
    },
    {
      id: "cyber-drift-2077",
      title: "Neon Runner 2077",
      genre: "RPG",
      platform: "Xbox",
      year: 2025,
      dateBucket: "2024-2026",
      rating: 4.6,
      featured: false,
      trending: true,
      recent: true,
      newList: false,
      store: "Xbox Store",
      trailerTheme: "cyber",
      accent: "#ec4899",
      bgStops: ["#18181b", "#701a75"],
      tagline: "High-octane cybernetic heist RPG in a rain-slicked metropolis.",
      description:
        "Hack corporate networks, customize neural implants, and carve your legend through branching narrative districts.",
      reviews: [
        { user: "ChromeV", score: 4.6, text: "Night-time ray-traced streets look unreal." }
      ]
    }
  ]
};
