
const games = [

    {
        id: 1,
        name: "Among Us",
        genre: "Multiplayer",
        rating: 8.2,
        image: "images/amongus.jpg"
    },

    {
        id: 2,
        name: "Call of Duty",
        genre: "Action / Shooter",
        rating: 8.8,
        image: "images/callofduty.jpg"
    },

    {
        id: 3,
        name: "Cyberpunk 2077",
        genre: "RPG / Action",
        rating: 9.0,
        image: "images/cyberpunk.jpg"
    },

    {
        id: 4,
        name: "EA Sports FC 25",
        genre: "Sports",
        rating: 8.1,
        image: "images/fifa25.avif"
    },

    {
        id: 5,
        name: "Forza Horizon",
        genre: "Racing",
        rating: 8.9,
        image: "images/froza.jpg"
    },

    {
        id: 6,
        name: "God of War Ragnarök",
        genre: "Action / Adventure",
        rating: 9.5,
        image: "images/God_of_War_Ragnarök_cover.jpg"
    },

    {
        id: 7,
        name: "Grand Theft Auto V",
        genre: "Open World",
        rating: 9.2,
        image: "images/gtav.jpg"
    },

    {
        id: 8,
        name: "The Last of Us",
        genre: "Adventure",
        rating: 9.3,
        image: "images/lastofus.jpg"
    },

    {
        id: 9,
        name: "Marvel's Spider-Man 2",
        genre: "Action",
        rating: 9.1,
        image: "images/marvelspiderman.png"
    },

    {
        id: 10,
        name: "Minecraft",
        genre: "Sandbox",
        rating: 9.4,
        image: "images/Minecraft_game_cover.jpeg"
    },

    {
        id: 11,
        name: "Red Dead Redemption II",
        genre: "Adventure",
        rating: 9.7,
        image: "images/Red_Dead_Redemption_II.jpg"
    },

    {
        id: 12,
        name: "Rocket League",
        genre: "Sports / Racing",
        rating: 8.6,
        image: "images/rocket league.jpg"
    },

    {
        id: 13,
        name: "Valorant",
        genre: "Shooter",
        rating: 8.7,
        image: "images/valorant.jpg"
    },

    {
        id: 14,
        name: "The Witcher 3",
        genre: "RPG / Adventure",
        rating: 9.6,
        image: "images/witcher3.jpg"
    }

];


// PAGE NAVIGATION

function showHome() {
    document.getElementById("landingPage").classList.add("hidden");
    document.getElementById("homePage").classList.remove("hidden");

    window.scrollTo(0, 0);
}

function showLanding() {
    document.getElementById("homePage").classList.add("hidden");
    document.getElementById("landingPage").classList.remove("hidden");

    closeMenu();
    window.scrollTo(0, 0);
}


// THREE DOT MENU

function openMenu() {
    document.getElementById("sideMenu").classList.add("open");
    document.getElementById("menuOverlay").classList.add("open");
}

function closeMenu() {
    document.getElementById("sideMenu").classList.remove("open");
    document.getElementById("menuOverlay").classList.remove("open");
}

function goToSection(id) {
    event.preventDefault();

    showHome();
    closeMenu();

    setTimeout(() => {
        document.getElementById(id).scrollIntoView({
            behavior: "smooth"
        });
    }, 100);
}


// THEME

function toggleTheme() {
    document.body.classList.toggle("light-mode");

    const theme = document.body.classList.contains("light-mode")
        ? "light"
        : "dark";

    localStorage.setItem("ratingHubTheme", theme);
}

if (localStorage.getItem("ratingHubTheme") === "light") {
    document.body.classList.add("light-mode");
}


// GAME CARDS

function createGameCard(game) {
    const card = document.createElement("div");
    card.className = "game-card";

    const imageBox = document.createElement("div");
    imageBox.className = "game-image";

    const image = document.createElement("img");
    image.src = game.image;
    image.alt = game.name;

    image.onerror = function () {
        this.alt = "Image not found: " + game.image;
        this.style.display = "none";

        const error = document.createElement("p");
        error.textContent = "Image not found";
        imageBox.appendChild(error);
    };

    imageBox.appendChild(image);

    const info = document.createElement("div");
    info.className = "game-info";

    const title = document.createElement("h3");
    title.textContent = game.name;

    const genre = document.createElement("p");
    genre.textContent = game.genre;

    const rating = document.createElement("p");
    rating.className = "rating";
    rating.textContent = "★ " + game.rating.toFixed(1) + " / 10";

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const wishlistButton = document.createElement("button");
    wishlistButton.className = "wishlist-btn";

    wishlistButton.textContent = getWishlist().includes(game.id)
        ? "♥ Saved"
        : "♡ Wishlist";

    wishlistButton.onclick = function () {
        toggleWishlist(game.id);
    };

    actions.appendChild(wishlistButton);

    info.append(title, genre, rating, actions);
    card.append(imageBox, info);

    return card;
}


// DISPLAY TOP RATED AND ALL GAMES

function displayGames() {

    const topContainer = document.getElementById("topRatedGames");
    const allContainer = document.getElementById("gameList");

    topContainer.innerHTML = "";
    allContainer.innerHTML = "";

    const sortedGames = [...games].sort(
        (a, b) => b.rating - a.rating
    );

    // Show four highest-rated games
    sortedGames.slice(0, 4).forEach(game => {
        topContainer.appendChild(createGameCard(game));
    });

    // Show full catalogue
    games.forEach(game => {
        allContainer.appendChild(createGameCard(game));
    });

    displayWishlist();
}


// SEARCH

document.getElementById("searchInput").addEventListener("input", function () {

    const search = this.value.toLowerCase();

    const results = games.filter(game =>
        game.name.toLowerCase().includes(search) ||
        game.genre.toLowerCase().includes(search)
    );

    const container = document.getElementById("gameList");

    container.innerHTML = "";

    results.forEach(game => {
        container.appendChild(createGameCard(game));
    });

    document.getElementById("noResults").classList.toggle(
        "hidden",
        results.length !== 0
    );

});

function showAllGames() {
    document.getElementById("allGames").scrollIntoView({
        behavior: "smooth"
    });
}


// WISHLIST

function getWishlist() {
    return JSON.parse(localStorage.getItem("ratingHubWishlist") || "[]");
}

function toggleWishlist(id) {

    let wishlist = getWishlist();

    if (wishlist.includes(id)) {
        wishlist = wishlist.filter(gameId => gameId !== id);
    } else {
        wishlist.push(id);
    }

    localStorage.setItem(
        "ratingHubWishlist",
        JSON.stringify(wishlist)
    );

    displayGames();
}

function displayWishlist() {

    const container = document.getElementById("wishlistGames");
    container.innerHTML = "";

    const wishlist = getWishlist();

    const savedGames = games.filter(game =>
        wishlist.includes(game.id)
    );

    if (savedGames.length === 0) {
        container.textContent = "Your wishlist is empty.";
        return;
    }

    savedGames.forEach(game => {

        const row = document.createElement("div");
        row.className = "wishlist-row";

        const name = document.createElement("span");
        name.textContent = game.name;

        const remove = document.createElement("button");
        remove.textContent = "Remove";
        remove.className = "wishlist-btn";

        remove.onclick = function () {
            toggleWishlist(game.id);
        };

        row.append(name, remove);
        container.appendChild(row);

    });
}


// DEMAND MORE GAMES

document.getElementById("requestForm").addEventListener("submit", function (event) {

    event.preventDefault();

    const name = document.getElementById("requestName").value.trim();
    const platform = document.getElementById("requestPlatform").value.trim();

    if (name === "") {
        return;
    }

    let requests = JSON.parse(
        localStorage.getItem("ratingHubRequests") || "[]"
    );

    requests.push({
        name: name,
        platform: platform
    });

    localStorage.setItem(
        "ratingHubRequests",
        JSON.stringify(requests)
    );

    document.getElementById("requestMessage").textContent =
        "Thank you! Your game suggestion has been saved.";

    this.reset();

});


// INITIALIZE

displayGames();
