/**
 * Rating Hub - Game Catalog, Promo Slides, and Google Form Feedback Config
 * Pure Vanilla JavaScript (ES6)
 */

window.QUEST_INDEX_DATA = {
  brandName: "Rating Hub",
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
      "id": "cs2",
      "title": "Counter-Strike 2",
      "genre": "Shooter",
      "platform": "PC (Steam)",
      "year": 2023,
      "dateBucket": "2024-2026",
      "rating": 4.8,
      "featured": true,
      "trending": true,
      "recent": true,
      "newList": false,
      "store": "Steam Store",
      "steamAppId": "730",
      "steamUrl": "https://store.steampowered.com/app/730/CounterStrike_2/",
      "trailerTheme": "zombie",
      "accent": "#f97316",
      "bgStops": [
        "#1e293b",
        "#0f172a"
      ],
      "tagline": "For over two decades, the worldwide premier competitive shooter experience.",
      "description": "Counter-Strike 2 is the largest technical leap forward in Counter-Strike history, powering responsive smoke, sub-tick updates, and overhauled visual maps.",
      "reviews": [
        {
          "user": "GlobalElite",
          "score": 4.9,
          "text": "Sub-tick hit registration and smoke physics feel unbelievable."
        },
        {
          "user": "TacticalSniper",
          "score": 4.7,
          "text": "Premier mode competitive matchmaking is crisp."
        }
      ]
    },
    {
      "id": "dota2",
      "title": "Dota 2",
      "genre": "Strategy",
      "platform": "PC (Steam)",
      "year": 2023,
      "dateBucket": "2024-2026",
      "rating": 4.7,
      "featured": true,
      "trending": true,
      "recent": false,
      "newList": false,
      "store": "Steam Store",
      "steamAppId": "570",
      "steamUrl": "https://store.steampowered.com/app/570/Dota_2/",
      "trailerTheme": "fantasy",
      "accent": "#ef4444",
      "bgStops": [
        "#1c1917",
        "#7f1d1d"
      ],
      "tagline": "Every day, millions of players worldwide enter battle as one of over a hundred heroes.",
      "description": "The most-played game in Steam history. With regular updates that ensure a constant evolution of gameplay, features, and heroes, Dota 2 has truly taken on a life of its own.",
      "reviews": [
        {
          "user": "InvokerMid",
          "score": 4.8,
          "text": "Infinite strategic depth and hero combos."
        },
        {
          "user": "AncientDefender",
          "score": 4.6,
          "text": "Best competitive esport ever built."
        }
      ]
    },
    {
      "id": "baldurs-gate-3",
      "title": "Baldur's Gate 3",
      "genre": "RPG",
      "platform": "PC (Steam)",
      "year": 2023,
      "dateBucket": "2024-2026",
      "rating": 4.9,
      "featured": true,
      "trending": true,
      "recent": true,
      "newList": true,
      "store": "Steam Store",
      "steamAppId": "1086940",
      "steamUrl": "https://store.steampowered.com/app/1086940/Baldurs_Gate_3/",
      "trailerTheme": "castle",
      "accent": "#fbbf24",
      "bgStops": [
        "#292524",
        "#78350f"
      ],
      "tagline": "Gather your party, and return to the Forgotten Realms in a tale of fellowship and betrayal.",
      "description": "Winner of Game of the Year. A next-generation RPG set in the world of Dungeons & Dragons, offering unprecedented player freedom, rich tactical combat, and cinematic storytelling.",
      "reviews": [
        {
          "user": "TavAdventurer",
          "score": 5,
          "text": "The gold standard of modern RPG narrative and roleplay."
        },
        {
          "user": "MindFlayerSlayer",
          "score": 4.9,
          "text": "Turn-based tactical combat with unmatched choice variety."
        }
      ]
    },
    {
      "id": "black-myth-wukong",
      "title": "Black Myth: Wukong",
      "genre": "Action",
      "platform": "PC (Steam)",
      "year": 2024,
      "dateBucket": "2024-2026",
      "rating": 4.9,
      "featured": true,
      "trending": true,
      "recent": true,
      "newList": true,
      "store": "Steam Store",
      "steamAppId": "2358720",
      "steamUrl": "https://store.steampowered.com/app/2358720/Black_Myth_Wukong/",
      "trailerTheme": "fantasy",
      "accent": "#f59e0b",
      "bgStops": [
        "#1c1917",
        "#451a03"
      ],
      "tagline": "Set out as the Destined One into Journey to the West.",
      "description": "An action RPG rooted in Chinese mythology. Face powerful foes and rival mythical beings as the Destined One, mastering staves, spells, and transformations.",
      "reviews": [
        {
          "user": "MonkeyKingFan",
          "score": 5,
          "text": "Breathtaking visual bosses and martial arts combat!"
        },
        {
          "user": "StaffMaster",
          "score": 4.8,
          "text": "Epic transformations and fluid dodge mechanics."
        }
      ]
    },
    {
      "id": "helldivers-2",
      "title": "HELLDIVERS 2",
      "genre": "Shooter",
      "platform": "PC (Steam)",
      "year": 2024,
      "dateBucket": "2024-2026",
      "rating": 4.7,
      "featured": true,
      "trending": true,
      "recent": true,
      "newList": true,
      "store": "Steam Store",
      "steamAppId": "553850",
      "steamUrl": "https://store.steampowered.com/app/553850/HELLDIVERS_2/",
      "trailerTheme": "zombie",
      "accent": "#eab308",
      "bgStops": [
        "#18181b",
        "#713f12"
      ],
      "tagline": "The Galaxy's Last Line of Offence. Enlist in the Helldivers and fight for Freedom.",
      "description": "Join up to four friends and wreak havoc on an alien scourge threatening the safety of your home planet, Super Earth, in this multiplayer co-op shooter.",
      "reviews": [
        {
          "user": "SuperEarthPatriot",
          "score": 4.8,
          "text": "For democracy! The orbital strikes are sheer cinema."
        },
        {
          "user": "Cadet44",
          "score": 4.6,
          "text": "Pure co-op chaos against endless bug and bot hordes."
        }
      ]
    },
    {
      "id": "apex-legends",
      "title": "Apex Legends",
      "genre": "Action",
      "platform": "PC (Steam)",
      "year": 2023,
      "dateBucket": "2024-2026",
      "rating": 4.5,
      "featured": false,
      "trending": true,
      "recent": false,
      "newList": false,
      "store": "Steam Store",
      "steamAppId": "1172470",
      "steamUrl": "https://store.steampowered.com/app/1172470/Apex_Legends/",
      "trailerTheme": "cyber",
      "accent": "#ef4444",
      "bgStops": [
        "#18181b",
        "#7f1d1d"
      ],
      "tagline": "Master an expanding roster of diverse legends with powerful abilities.",
      "description": "The award-winning hero shooter where legendary competitors battle for glory, fame, and fortune on the fringes of the Frontier.",
      "reviews": [
        {
          "user": "WraithMain",
          "score": 4.6,
          "text": "Fastest movement shooter with responsive gunplay."
        }
      ]
    },
    {
      "id": "pubg",
      "title": "PUBG: BATTLEGROUNDS",
      "genre": "Shooter",
      "platform": "PC (Steam)",
      "year": 2023,
      "dateBucket": "2024-2026",
      "rating": 4.4,
      "featured": false,
      "trending": true,
      "recent": false,
      "newList": false,
      "store": "Steam Store",
      "steamAppId": "578080",
      "steamUrl": "https://store.steampowered.com/app/578080/PUBG_BATTLEGROUNDS/",
      "trailerTheme": "zombie",
      "accent": "#f59e0b",
      "bgStops": [
        "#171a21",
        "#78350f"
      ],
      "tagline": "Land, loot, survive, and be the last team standing.",
      "description": "Drop into strategic locations, loot weapons and supplies, and survive to become the last squad standing across diverse Battlegrounds.",
      "reviews": [
        {
          "user": "ChickenDinner",
          "score": 4.5,
          "text": "Heart-pounding final circle tactical engagements."
        }
      ]
    },
    {
      "id": "gta-v",
      "title": "Grand Theft Auto V",
      "genre": "Action",
      "platform": "PC (Steam)",
      "year": 2022,
      "dateBucket": "2020-2023",
      "rating": 4.8,
      "featured": true,
      "trending": true,
      "recent": false,
      "newList": false,
      "store": "Steam Store",
      "steamAppId": "271590",
      "steamUrl": "https://store.steampowered.com/app/271590/Grand_Theft_Auto_V/",
      "trailerTheme": "jungle",
      "accent": "#22c55e",
      "bgStops": [
        "#052e16",
        "#1e293b"
      ],
      "tagline": "Explore the bustling sprawling city of Los Santos and Blaine County.",
      "description": "Play across the interconnected lives of Franklin, Michael, and Trevor as they conduct daring heists across Southern California.",
      "reviews": [
        {
          "user": "LosSantosBoss",
          "score": 4.9,
          "text": "Endless sandbox exploration, racing, and heists."
        }
      ]
    },
    {
      "id": "red-dead-redemption-2",
      "title": "Red Dead Redemption 2",
      "genre": "RPG",
      "platform": "PC (Steam)",
      "year": 2022,
      "dateBucket": "2020-2023",
      "rating": 4.9,
      "featured": true,
      "trending": true,
      "recent": false,
      "newList": false,
      "store": "Steam Store",
      "steamAppId": "1174180",
      "steamUrl": "https://store.steampowered.com/app/1174180/Red_Dead_Redemption_2/",
      "trailerTheme": "castle",
      "accent": "#ef4444",
      "bgStops": [
        "#450a0a",
        "#1c1917"
      ],
      "tagline": "Winner of over 175 Game of the Year Awards and recipient of over 250 perfect scores.",
      "description": "America, 1899. Arthur Morgan and the Van der Linde gang are outlaws on the run in an epic tale of life in America at the dawn of the modern age.",
      "reviews": [
        {
          "user": "ArthurMorganFan",
          "score": 5,
          "text": "The greatest open-world frontier game ever created."
        }
      ]
    },
    {
      "id": "rust",
      "title": "Rust",
      "genre": "Action",
      "platform": "PC (Steam)",
      "year": 2023,
      "dateBucket": "2024-2026",
      "rating": 4.6,
      "featured": false,
      "trending": true,
      "recent": true,
      "newList": false,
      "store": "Steam Store",
      "steamAppId": "252490",
      "steamUrl": "https://store.steampowered.com/app/252490/Rust/",
      "trailerTheme": "zombie",
      "accent": "#ea580c",
      "bgStops": [
        "#292524",
        "#431407"
      ],
      "tagline": "The only aim in Rust is to survive. Overcome hunger, thirst and cold.",
      "description": "Build a fire. Build a shelter. Kill animals for meat. Protect yourself from other players and form clans to conquer the island.",
      "reviews": [
        {
          "user": "BaseBuilder99",
          "score": 4.7,
          "text": "Unforgiving survival and raid defense PvP."
        }
      ]
    },
    {
      "id": "monster-hunter-wilds",
      "title": "Monster Hunter: World",
      "genre": "Action",
      "platform": "PC (Steam)",
      "year": 2023,
      "dateBucket": "2024-2026",
      "rating": 4.8,
      "featured": false,
      "trending": true,
      "recent": true,
      "newList": false,
      "store": "Steam Store",
      "steamAppId": "582010",
      "steamUrl": "https://store.steampowered.com/app/582010/Monster_Hunter_World/",
      "trailerTheme": "fantasy",
      "accent": "#38bdf8",
      "bgStops": [
        "#082f49",
        "#0f172a"
      ],
      "tagline": "Battle gigantic monsters in epic landscapes.",
      "description": "Welcome to a new world! In Monster Hunter: World, the latest installment in the series, you can enjoy the ultimate hunting experience.",
      "reviews": [
        {
          "user": "HunterGuild",
          "score": 4.9,
          "text": "Mastering monster behaviors and weapon trees is pure bliss."
        }
      ]
    },
    {
      "id": "stardew-valley",
      "title": "Stardew Valley",
      "genre": "RPG",
      "platform": "PC (Steam)",
      "year": 2024,
      "dateBucket": "2024-2026",
      "rating": 4.9,
      "featured": false,
      "trending": true,
      "recent": true,
      "newList": true,
      "store": "Steam Store",
      "steamAppId": "413150",
      "steamUrl": "https://store.steampowered.com/app/413150/Stardew_Valley/",
      "trailerTheme": "castle",
      "accent": "#22c55e",
      "bgStops": [
        "#052e16",
        "#14532d"
      ],
      "tagline": "You've inherited your grandfather's old farm plot in Stardew Valley.",
      "description": "Armed with hand-me-down tools and a few coins, set out to begin your new life! Turn overgrown fields into a thriving pastoral home.",
      "reviews": [
        {
          "user": "PelicanFarmer",
          "score": 5,
          "text": "Cozy masterpiece with endless charm and relaxing music."
        }
      ]
    },
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
      steamAppId: "13520",
      steamUrl: "https://store.steampowered.com/app/13520/Far_Cry/",
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
      steamAppId: "1466860",
      steamUrl: "https://store.steampowered.com/app/1466860/Age_of_Empires_IV_Anniversary_Edition/",
      steamAppId: "1466860",
      steamUrl: "https://store.steampowered.com/app/1466860/Age_of_Empires_IV_Anniversary_Edition/",
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
      steamAppId: "2140020",
      steamUrl: "https://store.steampowered.com/app/2140020/Stronghold_Definitive_Edition/",
      steamAppId: "2140020",
      steamUrl: "https://store.steampowered.com/app/2140020/Stronghold_Definitive_Edition/",
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
      steamAppId: "40970",
      steamUrl: "https://store.steampowered.com/app/40970/Stronghold_Crusader_HD/",
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
      steamAppId: "40980",
      steamUrl: "https://store.steampowered.com/app/40980/Stronghold_Legends_Steam_Edition/",
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
      steamAppId: "40960",
      steamUrl: "https://store.steampowered.com/app/40960/Stronghold_2_Steam_Edition/",
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
      steamAppId: "907650",
      steamUrl: "https://store.steampowered.com/app/907650/Stronghold_Warlords/",
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
      steamAppId: "518060",
      steamUrl: "https://store.steampowered.com/app/518060/Chess_Ultra/",
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
      steamAppId: "552520",
      steamUrl: "https://store.steampowered.com/app/552520/Far_Cry_5/",
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
      store: "Steam",
      steamAppId: "1245620",
      steamUrl: "https://store.steampowered.com/app/1245620/ELDEN_RING/",
      steamAppId: "1245620",
      steamUrl: "https://store.steampowered.com/app/1245620/ELDEN_RING/",
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
      steamAppId: "367520",
      steamUrl: "https://store.steampowered.com/app/367520/Hollow_Knight/",
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
      steamAppId: "1091500",
      steamUrl: "https://store.steampowered.com/app/1091500/Cyberpunk_2077/",
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
