(function () {
  "use strict";

  const keys = {
    users: "ratingHub.users.v1",
    session: "ratingHub.session.v1",
    wishlist: "ratingHub.wishlist.v1",
    reviews: "ratingHub.reviews.v1",
    helpful: "ratingHub.helpful.v1",
    comments: "ratingHub.comments.v1",
    requests: "ratingHub.requests.v1",
    theme: "ratingHub.theme.v1"
  };

  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      console.warn(`Rating Hub could not read local storage key "${key}".`, error);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Rating Hub could not save local storage key "${key}".`, error);
      return false;
    }
  }

  function normalizeIdentity(value) {
    return String(value || "").trim().toLowerCase();
  }

  function getUsers() {
    const stored = read(keys.users, []);
    const users = Array.isArray(stored) ? stored : [];
    const seeds = Array.isArray(window.SEED_USERS) ? window.SEED_USERS : [];
    let changed = false;
    seeds.forEach((seed) => {
      const exists = users.some((user) =>
        normalizeIdentity(user.email) === normalizeIdentity(seed.email) ||
        normalizeIdentity(user.username) === normalizeIdentity(seed.username)
      );
      if (!exists) {
        users.push({ ...seed });
        changed = true;
      }
    });
    if (changed || stored === null) write(keys.users, users);
    return users;
  }

  function getCurrentUser() {
    const sessionId = read(keys.session, "");
    if (!sessionId) return null;
    return getUsers().find((user) => user.id === sessionId) || null;
  }

  function updateUser(updated) {
    const users = getUsers();
    const index = users.findIndex((user) => user.id === updated.id);
    if (index < 0) return false;
    users[index] = { ...users[index], ...updated };
    const saved = write(keys.users, users);
    if (saved && read(keys.session, "") === updated.id) write(keys.session, updated.id);
    return saved;
  }

  function register(details) {
    const users = getUsers();
    const email = normalizeIdentity(details.email);
    const username = normalizeIdentity(details.username);
    if (users.some((user) => normalizeIdentity(user.email) === email)) {
      return { ok: false, message: "An account with this email already exists." };
    }
    if (users.some((user) => normalizeIdentity(user.username) === username)) {
      return { ok: false, message: "This username is already taken." };
    }
    const user = {
      id: `player-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      fullName: String(details.fullName || "").trim(),
      username: String(details.username || "").trim(),
      email: String(details.email || "").trim(),
      password: String(details.password || ""),
      points: 0,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    if (!write(keys.users, users)) {
      return { ok: false, message: "Your account could not be saved in this browser. Check storage settings and retry." };
    }
    write(keys.session, user.id);
    return { ok: true, user };
  }

  function login(identity, password) {
    const users = getUsers();
    const value = normalizeIdentity(identity);
    const user = users.find((item) =>
      normalizeIdentity(item.email) === value || normalizeIdentity(item.username) === value
    );
    if (!user) return { ok: false, reason: "missing", message: "Account not found. Create an account to join Rating Hub." };
    if (user.password !== String(password || "")) {
      return { ok: false, reason: "password", message: "That password doesn't match this account." };
    }
    write(keys.session, user.id);
    return { ok: true, user };
  }

  function logout() {
    try {
      localStorage.removeItem(keys.session);
    } catch (error) {
      console.error("Rating Hub could not clear the active session.", error);
    }
  }

  function userKey() {
    const user = getCurrentUser();
    return user ? user.id : "guest";
  }

  function getWishlist() {
    const all = read(keys.wishlist, {});
    const list = all && Array.isArray(all[userKey()]) ? all[userKey()] : [];
    return list;
  }

  function toggleWishlist(gameId) {
    const all = read(keys.wishlist, {});
    const list = new Set(Array.isArray(all[userKey()]) ? all[userKey()] : []);
    const isSaved = list.has(String(gameId));
    if (isSaved) list.delete(String(gameId));
    else list.add(String(gameId));
    all[userKey()] = [...list];
    write(keys.wishlist, all);
    return !isSaved;
  }

  function getReviews(gameId) {
    const local = read(keys.reviews, {});
    const extras = local[String(gameId)];
    return Array.isArray(extras) ? extras : [];
  }

  function addReview(gameId, input) {
    const user = getCurrentUser();
    if (!user) return { ok: false, message: "Sign in to share a review." };
    const all = read(keys.reviews, {});
    const reviews = Array.isArray(all[String(gameId)]) ? all[String(gameId)] : [];
    if (reviews.some((review) => review.userId === user.id)) {
      return { ok: false, message: "You have already reviewed this game. Update your existing review instead." };
    }
    reviews.unshift({
      id: `review-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      userId: user.id,
      author: user.username,
      score: Number(input.score),
      platform: String(input.platform || "PC"),
      headline: String(input.headline || "").trim(),
      body: String(input.body || "").trim(),
      createdAt: new Date().toISOString(),
      helpfulBy: [],
      comments: []
    });
    all[String(gameId)] = reviews;
    return write(keys.reviews, all)
      ? { ok: true, review: reviews[0] }
      : { ok: false, message: "Your review could not be saved in this browser." };
  }

  function toggleHelpful(gameId, reviewId) {
    const user = getCurrentUser();
    if (!user) return { ok: false, message: "Sign in to mark reviews helpful." };
    const all = read(keys.helpful, {});
    const key = `${gameId}:${reviewId}`;
    const voters = Array.isArray(all[key]) ? all[key] : [];
    const index = voters.indexOf(user.id);
    if (index >= 0) voters.splice(index, 1);
    else voters.push(user.id);
    all[key] = voters;
    write(keys.helpful, all);
    return { ok: true };
  }

  function getHelpful(gameId, reviewId) {
    const user = getCurrentUser();
    const voters = read(keys.helpful, {})[`${gameId}:${reviewId}`] || [];
    return { count: voters.length, active: Boolean(user && voters.includes(user.id)) };
  }

  function getComments(gameId, review) {
    const all = read(keys.comments, {});
    const extras = all[`${gameId}:${review.id}`];
    return [...(Array.isArray(review.comments) ? review.comments : []), ...(Array.isArray(extras) ? extras : [])];
  }

  function addComment(gameId, reviewId, text) {
    const user = getCurrentUser();
    if (!user) return { ok: false, message: "Sign in to join the conversation." };
    const all = read(keys.comments, {});
    const key = `${gameId}:${reviewId}`;
    const comments = Array.isArray(all[key]) ? all[key] : [];
    comments.push({
      id: `comment-${Date.now().toString(36)}`,
      userId: user.id,
      author: user.username,
      body: String(text || "").trim(),
      createdAt: new Date().toISOString()
    });
    all[key] = comments;
    write(keys.comments, all);
    return { ok: true };
  }

  function getRequests() {
    const all = read(keys.requests, {});
    return Array.isArray(all[userKey()]) ? all[userKey()] : [];
  }

  function addRequest(request) {
    const all = read(keys.requests, {});
    const list = Array.isArray(all[userKey()]) ? all[userKey()] : [];
    list.unshift({ ...request, id: `request-${Date.now().toString(36)}`, createdAt: new Date().toISOString() });
    all[userKey()] = list;
    return write(keys.requests, all);
  }

  function awardSearchPoint() {
    const user = getCurrentUser();
    if (!user) return { points: 0, level: 1 };
    const updated = { ...user, points: Number(user.points || 0) + 1 };
    updateUser(updated);
    return { points: updated.points, level: Math.floor(updated.points / 5) + 1 };
  }

  window.RatingHubState = {
    getUsers, getCurrentUser, updateUser, register, login, logout,
    getWishlist, toggleWishlist, getReviews, addReview, toggleHelpful,
    addComment, getComments, getHelpful, getRequests, addRequest, awardSearchPoint,
    getTheme: () => read(keys.theme, "system"),
    setTheme: (theme) => write(keys.theme, theme)
  };
})();
