/* ==========================================================================
   GameHub — Multi-Page Authentication, Verification & Profile Logic
   Works across index.html (Login), signup.html (Sign Up), and profile.html (Profile)
   ========================================================================== */

(() => {
  "use strict";

  const STORAGE_USERS_KEY = "gamehub_users_v1";
  const STORAGE_SESSION_KEY = "gamehub_session_v1";

  const DEFAULT_REVIEWS = [
    { game: "Minecraft", rating: "9/10", comment: "Amazing survival and creative game." },
    { game: "GTA V", rating: "8/10", comment: "Excellent open-world experience." }
  ];

  // Pre-seeded demo account matching Horizontal Prototype Page 3 ("Player123")
  const DEFAULT_USER = {
    id: "user_player123",
    fullName: "Alex Mercer",
    username: "Player123",
    email: "player123@gamehub.com",
    password: "GameHub@123",
    verified: true,
    newsletter: true,
    tagline: "Gaming enthusiast",
    welcomeNote: "Welcome to your profile!",
    age: "23",
    gender: "Male",
    city: "Islamabad",
    phone: "555-019-2026",
    about: "RPG & open-world fan reviewing PC and console titles on GameHub.",
    totalReviews: 12,
    savedGames: 8,
    reviews: DEFAULT_REVIEWS
  };

  const state = {
    pendingVerificationEmail: null,
    verificationCode: null,
    rememberOnVerify: true,
    pendingResetEmail: null,
    resetCode: null
  };

  // ==================== STORAGE HELPERS ====================

  function getUsers() {
    try {
      const raw = localStorage.getItem(STORAGE_USERS_KEY);
      if (!raw) {
        const initial = [DEFAULT_USER];
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(initial));
        return initial;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : [DEFAULT_USER];
    } catch {
      return [DEFAULT_USER];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  }

  function findUserByIdentifier(identifier) {
    const q = identifier.trim().toLowerCase();
    return getUsers().find(
      (u) => u.email.toLowerCase() === q || u.username.toLowerCase() === q
    );
  }

  function findUserByEmail(email) {
    const q = email.trim().toLowerCase();
    return getUsers().find((u) => u.email.toLowerCase() === q);
  }

  function getCurrentUser() {
    const userId =
      localStorage.getItem(STORAGE_SESSION_KEY) ||
      sessionStorage.getItem(STORAGE_SESSION_KEY);
    if (!userId) return null;
    return getUsers().find((u) => u.id === userId) || null;
  }

  function setSession(userId, remember) {
    clearSession();
    if (remember) {
      localStorage.setItem(STORAGE_SESSION_KEY, userId);
    } else {
      sessionStorage.setItem(STORAGE_SESSION_KEY, userId);
    }
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    sessionStorage.removeItem(STORAGE_SESSION_KEY);
  }

  function buildUserRecord({
    fullName,
    username,
    email,
    password,
    newsletter = false,
    tagline = "GameHub Member",
    about = "Joined GameHub to rate and review games."
  }) {
    return {
      id: `user_${Date.now()}`,
      fullName,
      username,
      email,
      password,
      verified: false,
      newsletter,
      tagline,
      welcomeNote: "Welcome to your profile!",
      age: "",
      gender: "Other",
      city: "",
      phone: "",
      about,
      totalReviews: 0,
      savedGames: 0,
      reviews: []
    };
  }

  function deriveUniqueUsername(users, baseName) {
    const taken = users.some((u) => u.username.toLowerCase() === baseName.toLowerCase());
    return taken ? `${baseName}_${String(Date.now()).slice(-3)}` : baseName;
  }

  // ==================== SHARED UI HELPERS ====================

  const views = document.querySelectorAll(".view");
  const demoToast = document.getElementById("demoToast");
  const demoToastMessage = document.getElementById("demoToastMessage");
  const navAuthLink = document.getElementById("navAuthLink");

  function showView(viewId) {
    views.forEach((v) => v.classList.toggle("active", v.id === viewId));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showDemoToast(htmlMessage) {
    if (!demoToast || !demoToastMessage) return;
    demoToastMessage.innerHTML = htmlMessage;
    demoToast.classList.remove("hidden");
  }

  function hideDemoToast() {
    if (demoToast) demoToast.classList.add("hidden");
  }

  function generateCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function setFieldStatus(inputId, statusId, errorId, stateType, message = "") {
    const input = document.getElementById(inputId);
    const wrapper = input ? input.closest(".input-wrapper") : null;
    const statusEl = document.getElementById(statusId);
    const errorEl = document.getElementById(errorId);

    if (wrapper) {
      wrapper.classList.remove("is-valid", "is-invalid");
      if (stateType === "valid") wrapper.classList.add("is-valid");
      if (stateType === "invalid") wrapper.classList.add("is-invalid");
    }
    if (statusEl) {
      statusEl.textContent =
        stateType === "valid" ? "✓" : stateType === "invalid" ? "✕" : "";
    }
    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  function showAlert(alertId, message, type = "error") {
    const el = document.getElementById(alertId);
    if (!el) return;
    el.textContent = message;
    el.className = `form-alert ${type}`;
  }

  function hideAlert(alertId) {
    const el = document.getElementById(alertId);
    if (el) el.className = "form-alert hidden";
  }

  // ==================== SHARED NAVBAR & TOGGLES ====================

  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const expanded = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(expanded));
    });
  }

  document.querySelectorAll(".nav-link[data-nav]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      if (navLinks) navLinks.classList.remove("open");
      showDemoToast(
        `<strong>${link.dataset.nav}</strong> belongs to another GameHub team module. You can navigate between <a href="index.html" style="color:#93c5fd">Login</a>, <a href="signup.html" style="color:#93c5fd">Sign Up</a>, and <a href="profile.html" style="color:#93c5fd">Profile</a>.`
      );
    });
  });

  const demoToastClose = document.getElementById("demoToastClose");
  if (demoToastClose) {
    demoToastClose.addEventListener("click", hideDemoToast);
  }

  document.querySelectorAll(".toggle-pw").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const isHidden = target.type === "password";
      target.type = isHidden ? "text" : "password";
      btn.textContent = isHidden ? "Hide" : "Show";
      btn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    });
  });

  if (navAuthLink) {
    const loggedInUser = getCurrentUser();
    if (loggedInUser) {
      navAuthLink.textContent = loggedInUser.username;
      navAuthLink.href = "profile.html";
    }
  }

  // ==================== SHARED VERIFICATION HELPER ====================

  function initVerificationHandlers() {
    const verifyForm = document.getElementById("verifyForm");
    const verifyCodeInput = document.getElementById("verifyCodeInput");
    const verifySubmitBtn = document.getElementById("verifySubmitBtn");
    const resendBtn = document.getElementById("resendVerifyCodeBtn");
    const backBtn = document.getElementById("backToLoginFromVerifyBtn");

    if (!verifyForm || !verifyCodeInput || !verifySubmitBtn) return;

    verifyCodeInput.addEventListener("input", () => {
      verifyCodeInput.value = verifyCodeInput.value.replace(/\D/g, "").slice(0, 6);
      hideAlert("verifyAlert");
      setFieldStatus("verifyCodeInput", "verifyCodeStatus", "verifyCodeError", "");
      verifySubmitBtn.disabled = verifyCodeInput.value.length !== 6;
    });

    verifyForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const entered = verifyCodeInput.value.trim();

      if (entered !== state.verificationCode) {
        setFieldStatus(
          "verifyCodeInput",
          "verifyCodeStatus",
          "verifyCodeError",
          "invalid",
          "Invalid activation code. Please check the code and try again."
        );
        showAlert("verifyAlert", "Verification failed. Incorrect 6-digit code.");
        return;
      }

      const users = getUsers();
      const userIndex = users.findIndex(
        (u) => u.email.toLowerCase() === String(state.pendingVerificationEmail).toLowerCase()
      );

      if (userIndex === -1) {
        showAlert("verifyAlert", "Account record not found. Please sign up again.");
        return;
      }

      users[userIndex].verified = true;
      saveUsers(users);
      setSession(users[userIndex].id, state.rememberOnVerify);
      window.location.href = "profile.html";
    });

    if (resendBtn) {
      resendBtn.addEventListener("click", () => {
        if (!state.pendingVerificationEmail) return;
        state.verificationCode = generateCode();
        showDemoToast(
          `New activation code for <strong>${state.pendingVerificationEmail}</strong>: <strong>${state.verificationCode}</strong>`
        );
      });
    }

    if (backBtn) {
      backBtn.addEventListener("click", () => showView("view-login"));
    }
  }

  function startEmailVerification(email) {
    state.pendingVerificationEmail = email;
    state.verificationCode = generateCode();
    const emailDisplay = document.getElementById("verifyEmailDisplay");
    const codeInput = document.getElementById("verifyCodeInput");
    const submitBtn = document.getElementById("verifySubmitBtn");

    if (emailDisplay) emailDisplay.textContent = email;
    if (codeInput) codeInput.value = "";
    if (submitBtn) submitBtn.disabled = true;

    hideAlert("verifyAlert");
    setFieldStatus("verifyCodeInput", "verifyCodeStatus", "verifyCodeError", "");
    showView("view-verify");
    showDemoToast(
      `Activation code sent to <strong>${email}</strong>: <strong>${state.verificationCode}</strong>`
    );
  }

  // ==================== PAGE 1: LOGIN & FORGOT PASSWORD ====================

  function initLoginPage() {
    initVerificationHandlers();

    const loginForm = document.getElementById("loginForm");
    const loginIdentifier = document.getElementById("loginIdentifier");
    const loginPassword = document.getElementById("loginPassword");
    const rememberMe = document.getElementById("rememberMe");
    const loginSubmitBtn = document.getElementById("loginSubmitBtn");

    function syncLoginButtonState() {
      const ready =
        loginIdentifier.value.trim().length > 0 &&
        loginPassword.value.trim().length > 0;
      loginSubmitBtn.disabled = !ready;
    }

    loginIdentifier.addEventListener("input", () => {
      hideAlert("loginAlert");
      setFieldStatus("loginIdentifier", "loginIdentifierStatus", "loginIdentifierError", "");
      syncLoginButtonState();
    });

    loginPassword.addEventListener("input", () => {
      hideAlert("loginAlert");
      setFieldStatus("loginPassword", "loginPasswordStatus", "loginPasswordError", "");
      syncLoginButtonState();
    });

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      hideAlert("loginAlert");

      const identifierVal = loginIdentifier.value.trim();
      const passwordVal = loginPassword.value;
      const user = findUserByIdentifier(identifierVal);
      state.rememberOnVerify = rememberMe.checked;

      if (!user) {
        // Allow any valid email or username (3+ chars) & password (6+ chars) to log in via 6-digit verification
        const looksLikeEmail = identifierVal.includes("@");
        let valid = true;

        if (looksLikeEmail && !isValidEmail(identifierVal)) {
          setFieldStatus(
            "loginIdentifier",
            "loginIdentifierStatus",
            "loginIdentifierError",
            "invalid",
            "Please enter a valid email address."
          );
          valid = false;
        } else if (!looksLikeEmail && (identifierVal.length < 3 || /\s/.test(identifierVal))) {
          setFieldStatus(
            "loginIdentifier",
            "loginIdentifierStatus",
            "loginIdentifierError",
            "invalid",
            "Username must be at least 3 characters with no spaces."
          );
          valid = false;
        } else {
          setFieldStatus("loginIdentifier", "loginIdentifierStatus", "loginIdentifierError", "valid");
        }

        if (passwordVal.length < 6) {
          setFieldStatus(
            "loginPassword",
            "loginPasswordStatus",
            "loginPasswordError",
            "invalid",
            "Password must be at least 6 characters."
          );
          valid = false;
        } else {
          setFieldStatus("loginPassword", "loginPasswordStatus", "loginPasswordError", "valid");
        }

        if (!valid) {
          showAlert("loginAlert", "Please enter a valid email/username and password (6+ characters).");
          return;
        }

        const users = getUsers();
        const baseName = looksLikeEmail ? identifierVal.split("@")[0] : identifierVal;
        const derivedUsername = deriveUniqueUsername(users, baseName);
        const derivedEmail = looksLikeEmail
          ? identifierVal
          : `${identifierVal.toLowerCase()}@gamehub.com`;

        const quickUser = buildUserRecord({
          fullName: baseName,
          username: derivedUsername,
          email: derivedEmail,
          password: passwordVal,
          tagline: "GameHub Member",
          about: "Signed in to GameHub to rate and review games."
        });

        users.push(quickUser);
        saveUsers(users);
        startEmailVerification(quickUser.email);
        return;
      }

      if (user.password !== passwordVal) {
        setFieldStatus(
          "loginPassword",
          "loginPasswordStatus",
          "loginPasswordError",
          "invalid",
          "Incorrect password. Please try again or use Forgot Password."
        );
        showAlert("loginAlert", "Incorrect password for this account.");
        return;
      }

      if (!user.verified) {
        startEmailVerification(user.email);
        showAlert(
          "verifyAlert",
          "Your account is not verified yet. Please enter the 6-digit activation code.",
          "error"
        );
        return;
      }

      setSession(user.id, rememberMe.checked);
      window.location.href = "profile.html";
    });

    document.querySelectorAll(".social-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const user = getUsers()[0];
        setSession(user.id, true);
        window.location.href = "profile.html";
      });
    });

    // Forgot Password flow on Login page
    const forgotEmailForm = document.getElementById("forgotEmailForm");
    const forgotEmail = document.getElementById("forgotEmail");
    const forgotSendBtn = document.getElementById("forgotSendBtn");
    const resetPasswordForm = document.getElementById("resetPasswordForm");
    const resetEmailDisplay = document.getElementById("resetEmailDisplay");
    const resetCodeInput = document.getElementById("resetCodeInput");
    const resetNewPassword = document.getElementById("resetNewPassword");
    const resetConfirmPassword = document.getElementById("resetConfirmPassword");
    const resetSubmitBtn = document.getElementById("resetSubmitBtn");
    const resetSuccessBox = document.getElementById("resetSuccessBox");

    function resetForgotView() {
      forgotEmailForm.classList.remove("hidden");
      resetPasswordForm.classList.add("hidden");
      resetSuccessBox.classList.add("hidden");
      forgotEmailForm.reset();
      resetPasswordForm.reset();
      forgotSendBtn.disabled = true;
      resetSubmitBtn.disabled = true;
      hideAlert("forgotAlert");
      hideAlert("resetAlert");
      setFieldStatus("forgotEmail", "forgotEmailStatus", "forgotEmailError", "");
      document.getElementById("forgotSubtitle").textContent =
        "Enter your email and we will send you an activation code";
    }

    document.getElementById("goToForgotBtn").addEventListener("click", () => {
      hideAlert("loginAlert");
      resetForgotView();
      showView("view-forgot");
    });

    forgotEmail.addEventListener("input", () => {
      hideAlert("forgotAlert");
      setFieldStatus("forgotEmail", "forgotEmailStatus", "forgotEmailError", "");
      forgotSendBtn.disabled = forgotEmail.value.trim().length === 0;
    });

    forgotEmailForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailVal = forgotEmail.value.trim();

      if (!isValidEmail(emailVal)) {
        setFieldStatus(
          "forgotEmail",
          "forgotEmailStatus",
          "forgotEmailError",
          "invalid",
          "Enter a valid email address."
        );
        return;
      }

      const user = findUserByEmail(emailVal);
      const targetEmail = user ? user.email : emailVal;

      state.pendingResetEmail = targetEmail;
      state.resetCode = generateCode();

      forgotEmailForm.classList.add("hidden");
      resetPasswordForm.classList.remove("hidden");
      resetEmailDisplay.textContent = targetEmail;
      document.getElementById("forgotSubtitle").textContent =
        "Verify your code and create a new password";

      showDemoToast(
        `Password reset code for <strong>${targetEmail}</strong>: <strong>${state.resetCode}</strong>`
      );
    });

    function syncResetButtonState() {
      const ready =
        resetCodeInput.value.trim().length === 6 &&
        resetNewPassword.value.length > 0 &&
        resetConfirmPassword.value.length > 0;
      resetSubmitBtn.disabled = !ready;
    }

    resetCodeInput.addEventListener("input", () => {
      resetCodeInput.value = resetCodeInput.value.replace(/\D/g, "").slice(0, 6);
      hideAlert("resetAlert");
      setFieldStatus("resetCodeInput", "resetCodeStatus", "resetCodeError", "");
      syncResetButtonState();
    });

    [resetNewPassword, resetConfirmPassword].forEach((input) => {
      input.addEventListener("input", () => {
        hideAlert("resetAlert");
        syncResetButtonState();
      });
    });

    resetPasswordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      hideAlert("resetAlert");
      let valid = true;

      if (resetCodeInput.value.trim() !== state.resetCode) {
        setFieldStatus("resetCodeInput", "resetCodeStatus", "resetCodeError", "invalid", "Invalid reset code.");
        valid = false;
      } else {
        setFieldStatus("resetCodeInput", "resetCodeStatus", "resetCodeError", "valid");
      }

      if (resetNewPassword.value.length < 6) {
        setFieldStatus(
          "resetNewPassword",
          "resetNewPasswordStatus",
          "resetNewPasswordError",
          "invalid",
          "Password must be at least 6 characters."
        );
        valid = false;
      } else {
        setFieldStatus("resetNewPassword", "resetNewPasswordStatus", "resetNewPasswordError", "valid");
      }

      if (resetConfirmPassword.value !== resetNewPassword.value) {
        setFieldStatus(
          "resetConfirmPassword",
          "resetConfirmPasswordStatus",
          "resetConfirmPasswordError",
          "invalid",
          "Passwords do not match."
        );
        valid = false;
      } else {
        setFieldStatus("resetConfirmPassword", "resetConfirmPasswordStatus", "resetConfirmPasswordError", "valid");
      }

      if (!valid) {
        showAlert("resetAlert", "Please fix the errors above to reset your password.");
        return;
      }

      const users = getUsers();
      const targetEmail = String(state.pendingResetEmail);
      const idx = users.findIndex(
        (u) => u.email.toLowerCase() === targetEmail.toLowerCase()
      );
      if (idx !== -1) {
        users[idx].password = resetNewPassword.value;
        users[idx].verified = true;
      } else {
        const baseName = targetEmail.split("@")[0];
        const created = buildUserRecord({
          fullName: baseName,
          username: deriveUniqueUsername(users, baseName),
          email: targetEmail,
          password: resetNewPassword.value
        });
        created.verified = true;
        users.push(created);
      }
      saveUsers(users);

      hideDemoToast();
      resetPasswordForm.classList.add("hidden");
      resetSuccessBox.classList.remove("hidden");
    });

    document.getElementById("resendResetCodeBtn").addEventListener("click", () => {
      if (!state.pendingResetEmail) return;
      state.resetCode = generateCode();
      showDemoToast(
        `New reset code for <strong>${state.pendingResetEmail}</strong>: <strong>${state.resetCode}</strong>`
      );
    });

    [
      "backToLoginFromForgotBtn",
      "backToLoginFromResetBtn",
      "resetDoneToLoginBtn"
    ].forEach((id) => {
      document.getElementById(id).addEventListener("click", () => showView("view-login"));
    });
  }

  // ==================== PAGE 2: SIGN UP & VERIFICATION ====================

  function initSignupPage() {
    initVerificationHandlers();

    const signupForm = document.getElementById("signupForm");
    const signupFullName = document.getElementById("signupFullName");
    const signupUsername = document.getElementById("signupUsername");
    const signupEmail = document.getElementById("signupEmail");
    const signupConfirmEmail = document.getElementById("signupConfirmEmail");
    const signupPassword = document.getElementById("signupPassword");
    const signupConfirmPassword = document.getElementById("signupConfirmPassword");
    const signupNewsletter = document.getElementById("signupNewsletter");
    const signupTerms = document.getElementById("signupTerms");
    const signupSubmitBtn = document.getElementById("signupSubmitBtn");

    function syncSignupButtonState() {
      const filled =
        signupFullName.value.trim().length > 0 &&
        signupUsername.value.trim().length > 0 &&
        signupEmail.value.trim().length > 0 &&
        signupConfirmEmail.value.trim().length > 0 &&
        signupPassword.value.length > 0 &&
        signupConfirmPassword.value.length > 0 &&
        signupTerms.checked;
      signupSubmitBtn.disabled = !filled;
    }

    [
      signupFullName,
      signupUsername,
      signupEmail,
      signupConfirmEmail,
      signupPassword,
      signupConfirmPassword
    ].forEach((input) => {
      input.addEventListener("input", () => {
        hideAlert("signupAlert");
        syncSignupButtonState();
      });
    });

    signupTerms.addEventListener("change", () => {
      document.getElementById("signupTermsError").textContent = "";
      syncSignupButtonState();
    });

    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      hideAlert("signupAlert");

      let valid = true;
      const fullName = signupFullName.value.trim();
      const username = signupUsername.value.trim();
      const email = signupEmail.value.trim();
      const confirmEmail = signupConfirmEmail.value.trim();
      const password = signupPassword.value;
      const confirmPassword = signupConfirmPassword.value;

      if (fullName.length < 2) {
        setFieldStatus("signupFullName", "signupFullNameStatus", "signupFullNameError", "invalid", "Enter your full name.");
        valid = false;
      } else {
        setFieldStatus("signupFullName", "signupFullNameStatus", "signupFullNameError", "valid");
      }

      const users = getUsers();
      const usernameTaken = users.some((u) => u.username.toLowerCase() === username.toLowerCase());
      if (username.length < 3 || /\s/.test(username)) {
        setFieldStatus(
          "signupUsername",
          "signupUsernameStatus",
          "signupUsernameError",
          "invalid",
          "Username must be at least 3 characters with no spaces."
        );
        valid = false;
      } else if (usernameTaken) {
        setFieldStatus("signupUsername", "signupUsernameStatus", "signupUsernameError", "invalid", "That username is already taken.");
        valid = false;
      } else {
        setFieldStatus("signupUsername", "signupUsernameStatus", "signupUsernameError", "valid");
      }

      const emailTaken = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!isValidEmail(email)) {
        setFieldStatus("signupEmail", "signupEmailStatus", "signupEmailError", "invalid", "Enter a valid email address.");
        valid = false;
      } else if (emailTaken) {
        setFieldStatus("signupEmail", "signupEmailStatus", "signupEmailError", "invalid", "An account with this email already exists.");
        valid = false;
      } else {
        setFieldStatus("signupEmail", "signupEmailStatus", "signupEmailError", "valid");
      }

      if (confirmEmail.toLowerCase() !== email.toLowerCase() || !confirmEmail) {
        setFieldStatus("signupConfirmEmail", "signupConfirmEmailStatus", "signupConfirmEmailError", "invalid", "Emails do not match.");
        valid = false;
      } else {
        setFieldStatus("signupConfirmEmail", "signupConfirmEmailStatus", "signupConfirmEmailError", "valid");
      }

      if (password.length < 6) {
        setFieldStatus(
          "signupPassword",
          "signupPasswordStatus",
          "signupPasswordError",
          "invalid",
          "Password must be at least 6 characters."
        );
        valid = false;
      } else {
        setFieldStatus("signupPassword", "signupPasswordStatus", "signupPasswordError", "valid");
      }

      if (confirmPassword !== password || !confirmPassword) {
        setFieldStatus(
          "signupConfirmPassword",
          "signupConfirmPasswordStatus",
          "signupConfirmPasswordError",
          "invalid",
          "Passwords do not match."
        );
        valid = false;
      } else {
        setFieldStatus("signupConfirmPassword", "signupConfirmPasswordStatus", "signupConfirmPasswordError", "valid");
      }

      if (!signupTerms.checked) {
        document.getElementById("signupTermsError").textContent = "You must agree to the terms to create an account.";
        valid = false;
      }

      if (!valid) {
        showAlert("signupAlert", "Please fix the highlighted fields before continuing.");
        return;
      }

      const newUser = buildUserRecord({
        fullName,
        username,
        email,
        password,
        newsletter: signupNewsletter.checked,
        tagline: "New GameHub Reviewer",
        about: "Just joined GameHub to rate and review games."
      });

      users.push(newUser);
      saveUsers(users);
      startEmailVerification(newUser.email);
    });
  }

  // ==================== PAGE 3: USER PROFILE & EDIT PROFILE ====================

  function initProfilePage() {
    function getActiveOrPreviewUser() {
      return getCurrentUser() || getUsers()[0];
    }

    function renderProfile(user) {
      document.getElementById("profileUsername").textContent = user.username;
      document.getElementById("profileTagline").textContent = user.tagline || "Gaming enthusiast";
      document.getElementById("profileWelcome").textContent = user.welcomeNote || "Welcome to your profile!";

      const metaParts = [user.fullName, user.city, user.email].filter(Boolean);
      document.getElementById("profileMeta").textContent = metaParts.join(" • ");

      const badge = document.getElementById("profileVerifiedBadge");
      badge.textContent = user.verified ? "✓ Verified" : "Unverified";

      document.getElementById("statReviews").textContent = String(user.totalReviews ?? 0).padStart(2, "0");
      document.getElementById("statSaved").textContent = String(user.savedGames ?? 0).padStart(2, "0");

      const listEl = document.getElementById("recentReviewsList");
      listEl.innerHTML = "";
      const reviews = Array.isArray(user.reviews) ? user.reviews : [];

      if (reviews.length === 0) {
        const empty = document.createElement("div");
        empty.className = "review-item";
        empty.innerHTML =
          '<div class="review-item-title">No reviews yet</div><p class="review-item-body">Explore games on GameHub to post your first rating and review.</p>';
        listEl.appendChild(empty);
      } else {
        reviews.forEach((rev) => {
          const card = document.createElement("div");
          card.className = "review-item";

          const title = document.createElement("div");
          title.className = "review-item-title";
          title.textContent = `${rev.game} ⭐ ${rev.rating}`;

          const body = document.createElement("p");
          body.className = "review-item-body";
          body.textContent = rev.comment;

          card.append(title, body);
          listEl.appendChild(card);
        });
      }
    }

    function populateEditForm(user) {
      document.getElementById("editFullName").value = user.fullName || "";
      document.getElementById("editUsername").value = user.username || "";
      document.getElementById("editAge").value = user.age || "";
      document.getElementById("editCity").value = user.city || "";
      document.getElementById("editTagline").value = user.tagline || "";
      document.getElementById("editEmail").value = user.email || "";
      document.getElementById("editPhone").value = user.phone || "";
      document.getElementById("editAbout").value = user.about || "";

      document.querySelectorAll('input[name="editGender"]').forEach((r) => {
        r.checked = r.value === (user.gender || "Other");
      });
      hideAlert("editProfileAlert");
    }

    const activeUser = getActiveOrPreviewUser();
    renderProfile(activeUser);

    if (!getCurrentUser()) {
      showDemoToast(
        'Showing demo profile <strong>Player123</strong>. <a href="index.html" style="color:#93c5fd">Login</a> or <a href="signup.html" style="color:#93c5fd">Create Account</a> to sign into your own profile.'
      );
    }

    document.getElementById("editProfileBtn").addEventListener("click", () => {
      populateEditForm(getActiveOrPreviewUser());
      showView("view-edit-profile");
    });

    document.getElementById("backToProfileBtn").addEventListener("click", () => {
      renderProfile(getActiveOrPreviewUser());
      showView("view-profile");
    });

    document.getElementById("editProfileForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const current = getActiveOrPreviewUser();

      const fullName = document.getElementById("editFullName").value.trim();
      const username = document.getElementById("editUsername").value.trim();
      const email = document.getElementById("editEmail").value.trim();

      if (!fullName || !username || !isValidEmail(email)) {
        showAlert("editProfileAlert", "Please provide a valid full name, username, and email.");
        return;
      }

      const users = getUsers();
      const duplicate = users.some(
        (u) =>
          u.id !== current.id &&
          (u.username.toLowerCase() === username.toLowerCase() ||
            u.email.toLowerCase() === email.toLowerCase())
      );
      if (duplicate) {
        showAlert("editProfileAlert", "That username or email is already used by another account.");
        return;
      }

      const selectedGender =
        document.querySelector('input[name="editGender"]:checked')?.value || "Other";

      const idx = users.findIndex((u) => u.id === current.id);
      if (idx === -1) return;

      users[idx] = {
        ...users[idx],
        fullName,
        username,
        email,
        age: document.getElementById("editAge").value.trim(),
        gender: selectedGender,
        city: document.getElementById("editCity").value.trim(),
        tagline: document.getElementById("editTagline").value.trim() || "Gaming enthusiast",
        phone: document.getElementById("editPhone").value.trim(),
        about: document.getElementById("editAbout").value.trim()
      };

      saveUsers(users);
      if (navAuthLink) navAuthLink.textContent = users[idx].username;
      renderProfile(users[idx]);
      showView("view-profile");
      showDemoToast("Profile changes saved successfully.");
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
      clearSession();
      window.location.href = "index.html";
    });
  }

  // ==================== BOOTSTRAP CURRENT PAGE ====================

  const page = document.body.dataset.page;
  if (page === "login") initLoginPage();
  if (page === "signup") initSignupPage();
  if (page === "profile") initProfilePage();
})();
