# QuestIndex — Game Review & Search Index Web Service

Pure **HTML5 + CSS3 + Vanilla JavaScript** game review portal and search index built from `prototype.jpeg`.

## Project Structure

```text
.
├── index.html                  # Primary Home page (5s animated hero, Feature Games, Search Bubble)
├── home.html                   # Clone of index.html linked by header logo hover (⌂)
├── explore.html                # Explore Games grid (tilted Sort Navigator, 3 filters, 2 Ad Panels)
├── search.html                 # Search Results page (Result Count, ⊙ View hover 800×800 trailer PiP)
├── top-rate.html               # Top Rated community leaderboard
├── about.html                  # Project overview & Google Form / Sheet CSV configuration
├── prototype.jpeg              # Original hand-drawn design prototype
├── synch_prompt_agy.txt        # Synchronized user prompt log
└── assets/
    ├── css/
    │   └── styles.css          # Theme variables, components, animations & responsive rules
    └── js/
        ├── games-data.js       # Game catalog, hero slides, Google Form defaults & fallback reviews
        ├── state.js            # Auth/form persistence, recursive 5-pt badge leveling, CSV fetcher
        ├── chrome.js           # Shared header, search bubble, notification dot, login/badge, footer
        ├── pages.js            # Page-specific controllers (Home, Explore, Search, Top Rate, About)
        └── app.js              # Application entry point
```

## Key Features

- **Nav Icon Compression**: Hovering **Home**, **Explore Games**, **Top Rate**, or **About** compresses the tab into a House, Controller, Star, or Portfolio icon.
- **Search Bubble & Google Form Dot**:
  - Hovering the rounded search bubble expands it into a curled, rounded search bar; typing displays matching favorites in the adjacent right-corner box panel.
  - Clicking the upper green notification dot fetches recent feedback updates from a configured Google Form / published Google Sheets CSV feed.
- **Login & Recursive Search Rank Badge**:
  - Sign in as `Mario12` from the upper-right panel (`Username | Badge`).
  - Every committed search awards `+1` Redeem Point and recursively levels up every 5 points (`5`, `10`, `15`, `20`, ...).
- **Explore Games Radial & Sort Navigator**:
  - Hovering/clicking the glowing dot next to **Explore Games** opens a circular sort ring (`Sort top`, `Recent sort`, `Trending`, `New sort`).
  - On `explore.html`, hovering near the search icon tilts the sort arrow and toggles the **General**, **Platform**, and **Date** filters.
- **Hover Trailer PiP Preview**:
  - On `search.html`, hovering a result row / `⊙ View` button previews an autoplaying `800×800` canvas trailer with a YouTube-style scrub bar that disappears on cursor leave.
- **Bottom-Right System / Dark / Light Theme Dock**:
  - Floating bottom-right theme toggle defaults to **System** theme on arrival and sign-in, with manual **Dark** and **Light** overrides.

## Preview Locally

Open `index.html` directly in a browser, or run a local static server:

```powershell
python -m http.server 8000
```
