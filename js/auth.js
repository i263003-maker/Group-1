(function () {
  "use strict";
  const state = window.RatingHubState;

  function showMessage(node, message, kind) {
    if (!node) return;
    node.textContent = message;
    node.hidden = false;
    node.className = `notice ${kind || ""}`;
  }

  function bind() {
    const login = document.getElementById("login-form");
    login?.addEventListener("submit", (event) => {
      event.preventDefault();
      const result = state.login(
        document.getElementById("login-identity").value,
        document.getElementById("login-password").value
      );
      if (!result.ok) {
        showMessage(document.getElementById("login-message"), result.message, "error");
        return;
      }
      showMessage(document.getElementById("login-message"), "Signed in. Taking you to the hub…", "success");
      const requestedPath = new URLSearchParams(window.location.search).get("next") || "";
      const requestedUrl = requestedPath.startsWith("pages/") ? new URL(requestedPath, document.baseURI) : null;
      const destination = requestedUrl && requestedUrl.origin === window.location.origin
        ? requestedUrl
        : new URL("pages/home.html", document.baseURI);
      window.setTimeout(() => { window.location.href = destination.href; }, 250);
    });

    const signup = document.getElementById("signup-form");
    signup?.addEventListener("submit", (event) => {
      event.preventDefault();
      const fullName = document.getElementById("signup-name").value.trim();
      const username = document.getElementById("signup-username").value.trim();
      const email = document.getElementById("signup-email").value.trim();
      const password = document.getElementById("signup-password").value;
      const confirm = document.getElementById("signup-confirm").value;
      const message = document.getElementById("signup-message");
      if (fullName.length < 2 || username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
        showMessage(message, "Enter a name and a username of 3–24 letters, numbers, or underscores.", "error");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage(message, "Enter a valid email address.", "error");
        return;
      }
      if (password.length < 6) {
        showMessage(message, "Choose a password with at least 6 characters.", "error");
        return;
      }
      if (password !== confirm) {
        showMessage(message, "The passwords do not match.", "error");
        return;
      }
      const result = state.register({ fullName, username, email, password });
      if (!result.ok) {
        showMessage(message, result.message, "error");
        return;
      }
      showMessage(message, "Account created. Welcome to Rating Hub!", "success");
      window.setTimeout(() => { window.location.href = new URL("pages/home.html", document.baseURI).href; }, 400);
    });
  }

  function renderProfile() {
    const host = document.getElementById("profile-content");
    if (!host) return;
    const user = state.getCurrentUser();
    if (!user) {
      host.innerHTML = `<p class="eyebrow">// Sign in to continue</p><h2>Your profile lives here</h2><p class="muted">Log in to see your account, activity, and reviews.</p><a class="button" href="pages/login.html">Log in →</a>`;
      return;
    }
    const initials = String(user.fullName || user.username).split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
    const reviews = [];
    (window.GAME_HUB?.games || []).forEach((game) => {
      [...(game.reviews || []), ...state.getReviews(game.id)].forEach((review) => {
        if (review.userId === user.id) reviews.push({ ...review, game });
      });
    });
    host.innerHTML = `
      <div class="profile-top"><div class="profile-avatar-large">${window.RatingHubChrome.escapeHtml(initials)}</div><div><p class="eyebrow">// Rating Hub player</p><h2>${window.RatingHubChrome.escapeHtml(user.fullName || user.username)}</h2><p class="muted">@${window.RatingHubChrome.escapeHtml(user.username)} · ${window.RatingHubChrome.escapeHtml(user.email)}</p></div></div>
      <div class="profile-stat-grid"><div class="profile-stat"><strong>${Number(user.points || 0)}</strong><span>Search points</span></div><div class="profile-stat"><strong>${Math.floor(Number(user.points || 0) / 5) + 1}</strong><span>Current level</span></div><div class="profile-stat"><strong>${reviews.length}</strong><span>Published reviews</span></div></div>
      <p class="muted">Member since ${new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>`;
    const list = document.getElementById("profile-reviews");
    if (list) list.innerHTML = reviews.length ? reviews.map((item) => `<a class="request-item" href="pages/game.html?id=${encodeURIComponent(item.game.id)}"><strong>${window.RatingHubChrome.escapeHtml(item.headline || item.game.title)} · ${Number(item.score).toFixed(1)}/10</strong><small>${window.RatingHubChrome.escapeHtml(item.game.title)}</small></a>`).join("") : `<div class="empty-state">No reviews yet. Visit a game page to share your take.</div>`;
  }

  window.RatingHubAuth = { bind, renderProfile };
})();
