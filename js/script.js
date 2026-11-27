const loginSection = document.getElementById("login");
const signupSection = document.getElementById("signup");
const forgotSection = document.getElementById("forgot");
const profileSection = document.getElementById("profile");

function showPage(page) {
    loginSection.classList.remove("active");
    signupSection.classList.remove("active");
    forgotSection.classList.remove("active");
    profileSection.classList.remove("active");

    page.classList.add("active");
    clearMessages();
}

function showLogin() {
    showPage(loginSection);
}

function showSignup() {
    showPage(signupSection);
}

function showForgotPassword() {
    showPage(forgotSection);
}

function clearMessages() {
    document.getElementById("loginMessage").textContent = "";
    document.getElementById("signupMessage").textContent = "";
    document.getElementById("forgotMessage").textContent = "";
}

document.getElementById("navHome").addEventListener("click", function(event) {
    event.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem("gamehubCurrentUser") || "null");
    if (currentUser) {
        document.getElementById("profileName").textContent = currentUser.username || currentUser.fullName;
        showPage(profileSection);
    } else {
        showLogin();
    }
});

document.getElementById("signupLink").addEventListener("click", function(event) {
    event.preventDefault();
    showSignup();
});

document.getElementById("loginLink").addEventListener("click", function(event) {
    event.preventDefault();
    showLogin();
});

document.getElementById("forgotLink").addEventListener("click", function(event) {
    event.preventDefault();
    showForgotPassword();
});

document.getElementById("backToLogin").addEventListener("click", function(event) {
    event.preventDefault();
    showLogin();
});

document.getElementById("signupForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        document.getElementById("signupMessage").textContent = "Passwords do not match.";
        return;
    }

    const users = JSON.parse(localStorage.getItem("gamehubUsers") || "[]");

    const alreadyExists = users.some(function(user) {
        return user.email.toLowerCase() === email.toLowerCase()
            || user.username.toLowerCase() === username.toLowerCase();
    });

    if (alreadyExists) {
        document.getElementById("signupMessage").textContent = "Email or username already exists.";
        return;
    }

    users.push({
        fullName: fullName,
        username: username,
        email: email,
        password: password
    });

    localStorage.setItem("gamehubUsers", JSON.stringify(users));

    document.getElementById("signupMessage").textContent =
        "Account created successfully. You can now login.";

    document.getElementById("signupForm").reset();
});

document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const loginValue = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    const users = JSON.parse(localStorage.getItem("gamehubUsers") || "[]");

    const user = users.find(function(account) {
        return (
            account.email.toLowerCase() === loginValue ||
            account.username.toLowerCase() === loginValue
        ) && account.password === password;
    });

    if (user) {
        localStorage.setItem("gamehubCurrentUser", JSON.stringify(user));

        document.getElementById("profileName").textContent =
            user.username || user.fullName;

        showPage(profileSection);
    } else {
        document.getElementById("loginMessage").textContent =
            "Incorrect email/username or password. Please try again.";
    }
});

document.getElementById("forgotForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("forgotEmail").value.trim().toLowerCase();

    const users = JSON.parse(localStorage.getItem("gamehubUsers") || "[]");

    const userExists = users.some(function(user) {
        return user.email.toLowerCase() === email;
    });

    if (userExists) {
        document.getElementById("forgotMessage").textContent =
            "Your email is registered. Real activation-code delivery requires an email service.";
    } else {
        document.getElementById("forgotMessage").textContent =
            "No account was found with this email address.";
    }
});

document.getElementById("logoutButton").addEventListener("click", function() {
    localStorage.removeItem("gamehubCurrentUser");
    document.getElementById("loginForm").reset();
    showLogin();
});

document.getElementById("editProfileButton").addEventListener("click", function() {
    const currentUser = JSON.parse(
        localStorage.getItem("gamehubCurrentUser") || "null"
    );

    if (currentUser) {
        const newName = prompt(
            "Enter your display name:",
            currentUser.username || currentUser.fullName
        );

        if (newName && newName.trim() !== "") {
            currentUser.username = newName.trim();

            const users = JSON.parse(
                localStorage.getItem("gamehubUsers") || "[]"
            );

            const userIndex = users.findIndex(function(user) {
                return user.email.toLowerCase() === currentUser.email.toLowerCase();
            });

            if (userIndex !== -1) {
                users[userIndex] = currentUser;
                localStorage.setItem("gamehubUsers", JSON.stringify(users));
            }

            localStorage.setItem(
                "gamehubCurrentUser",
                JSON.stringify(currentUser)
            );

            document.getElementById("profileName").textContent =
                currentUser.username;
        }
    }
});

window.addEventListener("DOMContentLoaded", function() {
    const currentUser = JSON.parse(localStorage.getItem("gamehubCurrentUser") || "null");
    if (currentUser) {
        document.getElementById("profileName").textContent =
            currentUser.username || currentUser.fullName;
        showPage(profileSection);
    }
});
