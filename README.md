# Rating Hub

![Rating Hub logo](img/logo.png)

**Play more. Choose better.** Discover community-rated games, read player reviews, build a wishlist, and compare your next picks.

![HTML5](https://img.shields.io/badge/HTML5-ready-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-responsive-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript&logoColor=222)
![Client-side auth](https://img.shields.io/badge/Auth-client--side-orange)
![Responsive UI](https://img.shields.io/badge/UI-responsive-success)

## Overview

Rating Hub is a standalone, static browser application that unifies game discovery, searchable catalog metadata, account flows, player reviews, and three-stage game comparison in the Vareesha-inspired orange-and-charcoal visual theme.

### Features

- Welcome landing page and discovery home with featured and top-rated games.
- Shared responsive navigation, hover-expanding search, quick results, recent-game updates, and redeem/search-rank panel.
- Muted, control-free YouTube trailer previews on game artwork while hovered; the preview search targets the game's trailer and Steam name without downloading video files.
- Search across title, aliases, release year, genres, tags, developer, publisher, platform, and rating, with classic-era filtering and sorting.
- Account creation and login, demo credentials, browser-persisted session, player profile, and account-linked wishlist.
- Game detail pages, a searchable community review hub, and a dedicated review composer with score breakdowns, pros/cons, helpful reactions, and comments.
- Three-stage side-by-side comparison: select two catalog games, inspect the differences, and view a rating-based summary.
- Validated game requests, stored per browser/account, and editable developer contacts centralized in `js/developers.js`.
- Light/dark/system appearance preference and responsive layouts.
- The original hand-drawn prototype is included as `img/prototype.jpeg` and shown on the About page.

## Project structure

```text
unified-game-hub/
├── index.html
├── README.md
├── pages/
│   ├── home.html
│   ├── wishlist.html
│   ├── demand.html
│   ├── search.html
│   ├── activity.html
│   ├── about.html
│   ├── game.html
│   ├── reviews.html
│   ├── write-review.html
│   ├── compare.html
│   ├── comparison-results.html
│   ├── comparison-summary.html
│   ├── login.html
│   ├── signup.html
│   └── profile.html
├── css/
│   ├── tokens.css
│   ├── global.css
│   ├── chrome.css
│   └── app.css
├── js/
│   ├── state.js
│   ├── chrome.js
│   ├── games-data.js
│   ├── search.js
│   ├── auth.js
│   ├── game-page.js
│   ├── compare.js
│   ├── developers.js
│   └── app.js
├── img/
│   └── prototype.jpeg
├── credentials/
│   ├── users.json
│   └── users-db.js
└── vid/ and aud/ are omitted because the app uses no video or audio assets.
```

`pages/` contains exactly **15 pages**, grouped into three routes per teammate below. The root `index.html` remains the shared landing entry and is not included in that page count.

## Who contributed what

| Contributor | Assigned focus in Rating Hub | Three pages |
| --- | --- | --- |
| **Abdullah Bin Niaz** | **Community Reviews & Player Experience** — game-detail context, community feedback, and review composition, informed by Abdullah's review-module design. | [Game detail](pages/game.html) · [Community reviews](pages/reviews.html) · [Write a review](pages/write-review.html) |
| **Syed Mehruban Ali Shah Bukhari** | Search indexing, shared chrome, rewards, and the team directory. | [Search index](pages/search.html) · [Activity & rewards](pages/activity.html) · [About & team directory](pages/about.html) |
| **Muhammad Zain** | Authentication and player profile. | [Login](pages/login.html) · [Sign up](pages/signup.html) · [Player profile](pages/profile.html) |
| **Wajahat** | Game comparison workflow. | [Select games](pages/compare.html) · [Comparison results](pages/comparison-results.html) · [Comparison summary](pages/comparison-summary.html) |
| **Vareesha** | Brand identity, UI/UX, and core hub pages. | [Discovery home](pages/home.html) · [Wishlist](pages/wishlist.html) · [Demand games](pages/demand.html) |

This is a unified student project: the table records module ownership and the pages assigned in this build, not sole authorship of every shared file. Abdullah is explicitly assigned the Community Reviews & Player Experience role in this version.

## Run locally

No build step or package installation is required. Open `index.html` directly in a modern browser, or serve this directory with VS Code Live Server for a more consistent local experience. All app pages, images, catalog data, and styles are contained in this folder.

### Demo accounts

| Username | Password |
| --- | --- |
| `Mario12` | `playmore123` |
| `DemoGamer` | `ratinghub123` |

## Data and security

Catalog data and seed demo accounts are provided by local JavaScript files so the app also works when opened directly from disk. User-created accounts, the current session, wishlists, reviews, helpful votes, comments, requests, and preferences are saved to browser `localStorage`. Seed accounts are merged into the local user store without replacing accounts created in the browser. Hover previews use YouTube's search-style embed rather than vendored video files; the matched result can vary with YouTube's search results and regional availability.

**This is a client-side educational demo, not production authentication.** Passwords are stored in browser-readable files and local storage. Do not use real or reused passwords, and do not enter sensitive personal information. A production service must move authentication and user data to a secure backend.

## Development team

| Developer | Responsibility | Contact |
| --- | --- | --- |
| Abdullah Bin Niaz | Game Details, Reviews & Storage Systems | [Inbox](mailto:i263003@isb.nu.edu.pk) |
| Syed Mehruban Ali Shah Bukhari | Search Indexing, Global Chrome & Account/Redeem Systems | [Inbox](mailto:i263158@isb.nu.edu.pk) |
| Muhammad Zain | Authentication & User Profile Systems | [Inbox](mailto:i263036@isb.nu.edu.pk) |
| Wajahat | Game Comparison Engine | [Inbox](mailto:i26xxxx@isb.nu.edu.pk) |
| Vareesha | Brand Identity, UI/UX Design & Core Pages | [Inbox](mailto:i26xxxx@isb.nu.edu.pk) |
