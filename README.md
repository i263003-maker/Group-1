# Rating Hub — Game Review & Search Index Web Service

Pure **HTML5 + CSS3 + Vanilla JavaScript** game review portal and search index built faithfully from `prototype.jpeg` with vibrant **Orange theme**, **Play on Steam** frameset integration, and **Interactive PlayStore-style review scoring**.

## Project Structure

```text
.
├── index.html                  # Sign In & Security Verification Gate (Gmail OTP verification -> redirects to home)
├── home.html                   # Primary Home page (5s animated hero, Feature Games, Search Bubble)
├── explore.html                # Explore Games grid (tilted Sort Navigator, 3 filters, 2 Ad Panels)
├── search.html                 # Search Results page (Result Count, direct game detail access)
├── top-rate.html               # Top Rated community leaderboard
├── about.html                  # Project overview & Google Form / Sheet CSV configuration
├── logo.png                    # Brand logo asset for Rating Hub
├── prototype.jpeg              # Original hand-drawn design prototype
├── synch_prompt_agy.txt        # Synchronized user prompt log
└── assets/
    ├── css/
    │   └── styles.css          # Orange theme variables, frameset modals, PlayStore star review styling
    ├── media/
    │   ├── trailers/           # Directory for game video trailers
    │   └── thumbnails/         # Directory for video thumbnails used across feature games tabs
    └── js/
        ├── games-data.js       # Game catalog with Steam store links, hero slides, Google Form defaults
        ├── state.js            # Auth/form persistence, recursive 5-pt badge leveling, CSV fetcher
        ├── chrome.js           # Shared header, search bubble, Steam frameset, modal close engine
        ├── pages.js            # Page-specific controllers & email verification gate logic
        └── app.js              # Application entry point
```

## Key Implementations & Enhancements

1. **Brand & Logo (`logo.png`)**:
   - Replaced brand name across all files and headings with **"Rating Hub"**.
   - Integrated `logo.png` into the brand logo container with seamless fallback SVG.
2. **Orange Theme**:
   - Converted the visual palette from blue (`#38bdf8` / `#0284c7`) to a vivid and modern **Orange** primary accent (`#f97316` / `#ea580c`) with warm amber gradients and soft glowing box shadows.
3. **Dedicated Video Trailer & Thumbnail Directories**:
   - Created `assets/media/trailers/` and `assets/media/thumbnails/` for storing video clips and thumbnails across the Feature Games tab and throughout the platform.
4. **Debloating & Trailer PiP Removal**:
   - Removed the hovering YouTube-style PiP canvas preview overlay from search results to eliminate visual clutter and avoid redundant playback.
5. **Mandatory Sign-In & Email OTP Verification Gate (`index.html`)**:
   - When users visit `index.html`, a dedicated sign-in panel requires their Gmail and password.
   - If the user is already signed in, they are immediately redirected to `home.html`.
   - Sends a 5-digit verification code (e.g. `64433` or random 5-digit code) formatted with topic **"Rating Hub Request Sign in"** and authentic security details.
   - Upon entering the code, the user is authenticated and redirected to `home.html`.
6. **Reliable Modal Close Engine**:
   - Fixed the modal close bug: both the top-right `&times;` button, the bottom `Close` button, and backdrop clicks now reliably close modal dialogs.
7. **PlayStore-style Star Review System with Strikethrough for Guests**:
   - In the game details modal, users can click **"Write a Review"** to open an interactive star rating panel (1 to 5 stars) with a comment box.
   - Hovering and clicking stars dynamically highlights them up to the selected score (e.g., clicking 5th star selects 5.0 / 5 stars).
   - If the user is **not signed in**, the review button is struck through (`line-through`) with a notice requiring sign-in to prevent conflicts.
8. **"Play on Steam" Frameset Integration**:
   - Added a **"Play on Steam"** button for indexed games (e.g., *Stronghold: Definitive Edition*, *Age of Empires IV*, *Elden Ring*).
   - Clicking opens a high-fidelity Steam frameset viewer with a prominent **"Close Steam button"** at the top and bottom.

## Preview Locally

```powershell
python -m http.server 8000
```
Open `http://localhost:8000` in your web browser.
