(function () {
  const USERS_KEY = "gamehubUsers";
  const CURRENT_KEY = "gamehubCurrentUser";
  let pendingAccount = null;
  let generatedCode = "";

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    } catch (_) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(CURRENT_KEY) || "null");
    } catch (_) {
      return null;
    }
  }

  function setCurrentUser(user) {
    if (user) {
      localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_KEY);
    }
  }

  function showToast(message) {
    const toast = document.getElementById("demoToast");
    const msg = document.getElementById("demoToastMessage");
    if (!toast || !msg) return;
    msg.textContent = message;
    toast.classList.remove("hidden");
  }

  const toastClose = document.getElementById("demoToastClose");
  if (toastClose) {
    toastClose.addEventListener("click", function () {
      document.getElementById("demoToast").classList.add("hidden");
    });
  }

  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      const open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
  }

  document.querySelectorAll(".toggle-pw").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const isPassword = target.type === "password";
      target.type = isPassword ? "text" : "password";
      btn.textContent = isPassword ? "Hide" : "Show";
    });
  });

  const page = document.body.dataset.page;

  if (page === "signup") {
    const form = document.getElementById("signupForm");
    const fullName = document.getElementById("signupFullName");
    const username = document.getElementById("signupUsername");
    const email = document.getElementById("signupEmail");
    const confirmEmail = document.getElementById("signupConfirmEmail");
    const password = document.getElementById("signupPassword");
    const confirmPassword = document.getElementById("signupConfirmPassword");
    const terms = document.getElementById("signupTerms");
    const submitBtn = document.getElementById("signupSubmitBtn");
    const alertBox = document.getElementById("signupAlert");

    function validateSignup(showErrors) {
      let valid = true;

      const checks = [
        {
          ok: fullName.value.trim().length >= 2,
          errId: "signupFullNameError",
          msg: "Please enter your full name."
        },
        {
          ok: username.value.trim().length >= 3,
          errId: "signupUsernameError",
          msg: "Username must be at least 3 characters."
        },
        {
          ok: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()),
          errId: "signupEmailError",
          msg: "Enter a valid email address."
        },
        {
          ok: confirmEmail.value.trim().toLowerCase() === email.value.trim().toLowerCase() && confirmEmail.value.trim() !== "",
          errId: "signupConfirmEmailError",
          msg: "Email addresses do not match."
        },
        {
          ok: password.value.length >= 6,
          errId: "signupPasswordError",
          msg: "Password must be at least 6 characters."
        },
        {
          ok: confirmPassword.value === password.value && confirmPassword.value !== "",
          errId: "signupConfirmPasswordError",
          msg: "Passwords do not match."
        },
        {
          ok: terms.checked,
          errId: "signupTermsError",
          msg: "You must agree to the Terms & Community Guidelines."
        }
      ];

      checks.forEach(function (item) {
        const el = document.getElementById(item.errId);
        if (!item.ok) {
          valid = false;
          if (el) el.textContent = showErrors ? item.msg : "";
        } else if (el) {
          el.textContent = "";
        }
      });

      submitBtn.disabled = !valid;
      return valid;
    }

    [fullName, username, email, confirmEmail, password, confirmPassword, terms].forEach(function (field) {
      field.addEventListener("input", function () { validateSignup(true); });
      field.addEventListener("change", function () { validateSignup(true); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateSignup(true)) return;

      const users = getUsers();
      const exists = users.some(function (u) {
        return u.email.toLowerCase() === email.value.trim().toLowerCase() ||
               u.username.toLowerCase() === username.value.trim().toLowerCase();
      });

      if (exists) {
        alertBox.textContent = "An account with that email or username already exists.";
        alertBox.classList.remove("hidden");
        return;
      }

      alertBox.classList.add("hidden");
      pendingAccount = {
        fullName: fullName.value.trim(),
        username: username.value.trim(),
        email: email.value.trim(),
        password: password.value,
        newsletter: document.getElementById("signupNewsletter").checked,
        tagline: "Gaming enthusiast",
        verified: true
      };

      generatedCode = String(Math.floor(100000 + Math.random() * 900000));
      document.getElementById("verifyEmailDisplay").textContent = pendingAccount.email;
      document.getElementById("view-signup").classList.remove("active");
      document.getElementById("view-verify").classList.add("active");
      showToast("Your verification code is: " + generatedCode);
    });

    const verifyInput = document.getElementById("verifyCodeInput");
    const verifyBtn = document.getElementById("verifySubmitBtn");
    const verifyAlert = document.getElementById("verifyAlert");

    verifyInput.addEventListener("input", function () {
      verifyInput.value = verifyInput.value.replace(/\D/g, "").slice(0, 6);
      verifyBtn.disabled = verifyInput.value.length !== 6;
    });

    document.getElementById("resendVerifyCodeBtn").addEventListener("click", function () {
      generatedCode = String(Math.floor(100000 + Math.random() * 900000));
      showToast("New verification code sent: " + generatedCode);
    });

    document.getElementById("verifyForm").addEventListener("submit", function (e) {
      e.preventDefault();
      if (!pendingAccount) return;
      if (verifyInput.value !== generatedCode) {
        verifyAlert.textContent = "Invalid 6-digit code. Check the notification banner above.";
        verifyAlert.classList.remove("hidden");
        return;
      }
      const users = getUsers();
      users.push(pendingAccount);
      saveUsers(users);
      setCurrentUser(pendingAccount);
      window.location.href = "profile.html";
    });
  }

  if (page === "profile") {
    let user = getCurrentUser() || {
      fullName: "Player123",
      username: "Player123",
      email: "player123@gamehub.example",
      tagline: "Gaming enthusiast",
      city: "",
      age: "",
      gender: "",
      phone: "",
      about: "",
      verified: true
    };

    const defaultReviews = [
      { title: "Minecraft ⭐ 9/10", body: "Amazing survival and creative game." },
      { title: "GTA V ⭐ 8/10", body: "Excellent open-world experience." }
    ];

    function renderProfile() {
      document.getElementById("profileUsername").textContent = user.username || user.fullName;
      document.getElementById("navAuthLink").textContent = user.username || user.fullName;
      document.getElementById("profileTagline").textContent = user.tagline || "Gaming enthusiast";
      const metaParts = [user.city, user.age ? user.age + " yrs" : "", user.gender].filter(Boolean);
      document.getElementById("profileMeta").textContent = metaParts.join(" • ");

      const list = document.getElementById("recentReviewsList");
      list.innerHTML = "";
      defaultReviews.forEach(function (rev) {
        const card = document.createElement("div");
        card.className = "review-item";
        card.innerHTML = "<h4>" + rev.title + "</h4><p>" + rev.body + "</p>";
        list.appendChild(card);
      });
    }

    renderProfile();

    document.getElementById("editProfileBtn").addEventListener("click", function () {
      document.getElementById("editFullName").value = user.fullName || "";
      document.getElementById("editUsername").value = user.username || "";
      document.getElementById("editAge").value = user.age || "";
      document.getElementById("editCity").value = user.city || "";
      document.getElementById("editTagline").value = user.tagline || "Gaming enthusiast";
      document.getElementById("editEmail").value = user.email || "";
      document.getElementById("editPhone").value = user.phone || "";
      document.getElementById("editAbout").value = user.about || "";

      document.querySelectorAll('input[name="editGender"]').forEach(function (radio) {
        radio.checked = radio.value === user.gender;
      });

      document.getElementById("view-profile").classList.remove("active");
      document.getElementById("view-edit-profile").classList.add("active");
    });

    document.getElementById("backToProfileBtn").addEventListener("click", function () {
      document.getElementById("view-edit-profile").classList.remove("active");
      document.getElementById("view-profile").classList.add("active");
    });

    document.getElementById("editProfileForm").addEventListener("submit", function (e) {
      e.preventDefault();
      const selectedGender = document.querySelector('input[name="editGender"]:checked');
      user.fullName = document.getElementById("editFullName").value.trim() || user.fullName;
      user.username = document.getElementById("editUsername").value.trim() || user.username;
      user.age = document.getElementById("editAge").value.trim();
      user.gender = selectedGender ? selectedGender.value : "";
      user.city = document.getElementById("editCity").value.trim();
      user.tagline = document.getElementById("editTagline").value.trim() || "Gaming enthusiast";
      user.email = document.getElementById("editEmail").value.trim() || user.email;
      user.phone = document.getElementById("editPhone").value.trim();
      user.about = document.getElementById("editAbout").value.trim();

      const users = getUsers();
      const idx = users.findIndex(function (u) {
        return u.email.toLowerCase() === user.email.toLowerCase();
      });
      if (idx !== -1) {
        users[idx] = user;
        saveUsers(users);
      }
      setCurrentUser(user);
      renderProfile();

      document.getElementById("view-edit-profile").classList.remove("active");
      document.getElementById("view-profile").classList.add("active");
      showToast("Profile updated successfully.");
    });

    document.getElementById("logoutBtn").addEventListener("click", function () {
      setCurrentUser(null);
      window.location.href = "../index.html";
    });
  }
})();
