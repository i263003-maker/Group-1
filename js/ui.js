/**
 * Shared UI helpers, modals, score formatting, and safe HTML escaping.
 */
(function (global) {
  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getVerdictLabel(score) {
    const n = Number(score);
    if (!Number.isFinite(n)) return "Unrated";
    if (n >= 10) return "Masterpiece";
    if (n >= 9) return "Amazing";
    if (n >= 8) return "Great";
    if (n >= 7) return "Good";
    if (n >= 6) return "Okay";
    if (n >= 5) return "Mediocre";
    if (n >= 4) return "Bad";
    if (n >= 3) return "Awful";
    return "Unbearable";
  }

  function getScoreClass(score) {
    const n = Number(score);
    if (!Number.isFinite(n)) return "score-poor";
    if (n >= 9.5) return "score-masterpiece";
    if (n >= 8.0) return "score-great";
    if (n >= 6.5) return "score-good";
    if (n >= 5.0) return "score-mixed";
    return "score-poor";
  }

  function formatScore(score) {
    const n = Number(score);
    return Number.isFinite(n) ? n.toFixed(1) : "—";
  }

  function formatDate(dateStr) {
    if (!dateStr) return "TBA";
    const parsed = new Date(dateStr);
    if (Number.isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function showToast(message, variant = "info") {
    const region = document.getElementById("toastRegion");
    if (!region) return;
    const toast = document.createElement("div");
    toast.className = `toast ${variant}`;
    toast.textContent = message;
    region.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 4200);
  }

  function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.hidden = false;
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
  }

  function updateNavbarIndicators() {
    const countEl = document.getElementById("navWishlistCount");
    if (countEl) {
      countEl.textContent = String(global.GameHubStorage.getWishlist().length);
    }

    const dot = document.getElementById("githubSyncDot");
    const text = document.getElementById("githubSyncStatusText");
    const cfg = global.GameHubStorage.getGitHubConfig();
    if (dot && text) {
      dot.classList.remove("connected", "readonly");
      if (global.GameHubStorage.isGitHubWriteConfigured(cfg)) {
        dot.classList.add("connected");
        text.textContent = `GitHub: ${cfg.owner}/${cfg.repo}`;
      } else if (global.GameHubStorage.isGitHubReadConfigured(cfg)) {
        dot.classList.add("readonly");
        text.textContent = `GitHub (Read-Only)`;
      } else {
        text.textContent = "GitHub Sync";
      }
    }
  }

  async function renderSubmissionsList() {
    const listEl = document.getElementById("pendingSubmissionsList");
    const countEl = document.getElementById("submissionsCount");
    if (!listEl || !countEl) return;

    const { data } = await global.GameHubStorage.loadHubData();
    const subs = data.submissions || [];
    countEl.textContent = String(subs.length);

    if (!subs.length) {
      listEl.innerHTML = `<p class="helper-text">No pending submissions yet.</p>`;
      return;
    }

    listEl.innerHTML = subs
      .slice(0, 6)
      .map(
        (s) => `
      <div class="submission-row">
        <div>
          <strong>${escapeHtml(s.title)}</strong>
          <span class="muted">by ${escapeHtml(s.developer || "Unknown Studio")}</span>
        </div>
        <span class="muted">${escapeHtml(s.platforms || "Multiplatform")}</span>
      </div>
    `
      )
      .join("");
  }

  function initSharedChrome({ onDataRefresh } = {}) {
    updateNavbarIndicators();

    document.querySelectorAll("[data-close-modal]").forEach((btn) => {
      btn.addEventListener("click", () => closeModal(btn.getAttribute("data-close-modal")));
    });

    document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
      backdrop.addEventListener("click", (event) => {
        if (event.target === backdrop) {
          backdrop.hidden = true;
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        document.querySelectorAll(".modal-backdrop").forEach((m) => {
          m.hidden = true;
        });
      }
    });

    const openSubmitBtn = document.getElementById("openSubmitGameBtn");
    if (openSubmitBtn) {
      openSubmitBtn.addEventListener("click", async () => {
        await renderSubmissionsList();
        openModal("submitGameModal");
      });
    }

    const submitGameForm = document.getElementById("submitGameForm");
    if (submitGameForm) {
      submitGameForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        try {
          const { submission, persistResult } = await global.GameHubStorage.submitGameForReview({
            title: document.getElementById("subTitle").value,
            developer: document.getElementById("subDeveloper").value,
            platforms: document.getElementById("subPlatforms").value,
            releaseWindow: document.getElementById("subReleaseWindow").value,
            officialUrl: document.getElementById("subOfficialUrl").value,
            submittedBy: document.getElementById("subSubmittedBy").value,
            notes: document.getElementById("subNotes").value
          });
          submitGameForm.reset();
          await renderSubmissionsList();
          showToast(
            persistResult.syncedGitHub
              ? `"${submission.title}" queued and committed to GitHub!`
              : `"${submission.title}" queued locally (connect GitHub Sync to commit).`,
            "success"
          );
        } catch (err) {
          showToast(err.message || "Failed to queue submission.", "error");
        }
      });
    }

    const submitViaIssueBtn = document.getElementById("submitViaIssueBtn");
    if (submitViaIssueBtn) {
      submitViaIssueBtn.addEventListener("click", () => {
        const titleVal = document.getElementById("subTitle").value.trim() || "New Game";
        const devVal = document.getElementById("subDeveloper").value.trim() || "TBD";
        const platVal = document.getElementById("subPlatforms").value.trim() || "TBD";
        const windowVal = document.getElementById("subReleaseWindow").value.trim() || "TBD";
        const urlVal = document.getElementById("subOfficialUrl").value.trim() || "N/A";
        const notesVal = document.getElementById("subNotes").value.trim() || "N/A";

        const issueUrl = global.GameHubStorage.buildGitHubIssueUrl({
          title: `[Game Submission] ${titleVal}`,
          labels: ["game-submission"],
          body: [
            `### Game Review Submission`,
            `- **Title:** ${titleVal}`,
            `- **Developer:** ${devVal}`,
            `- **Platforms:** ${platVal}`,
            `- **Release Window:** ${windowVal}`,
            `- **Official Link:** ${urlVal}`,
            ``,
            `### Pitch / Notes`,
            notesVal
          ].join("\n")
        });

        if (!issueUrl) {
          showToast("Set GitHub Owner & Repo in GitHub Sync first to open an Issue.", "error");
          openModal("githubSyncModal");
          return;
        }
        window.open(issueUrl, "_blank", "noopener,noreferrer");
      });
    }

    const openGitHubSyncBtn = document.getElementById("openGitHubSyncBtn");
    if (openGitHubSyncBtn) {
      openGitHubSyncBtn.addEventListener("click", () => {
        const cfg = global.GameHubStorage.getGitHubConfig();
        document.getElementById("ghOwner").value = cfg.owner;
        document.getElementById("ghRepo").value = cfg.repo;
        document.getElementById("ghBranch").value = cfg.branch;
        document.getElementById("ghPath").value = cfg.path;
        document.getElementById("ghToken").value = cfg.token;
        openModal("githubSyncModal");
      });
    }

    const githubSyncForm = document.getElementById("githubSyncForm");
    if (githubSyncForm) {
      githubSyncForm.addEventListener("submit", (event) => {
        event.preventDefault();
        global.GameHubStorage.saveGitHubConfig({
          owner: document.getElementById("ghOwner").value,
          repo: document.getElementById("ghRepo").value,
          branch: document.getElementById("ghBranch").value,
          path: document.getElementById("ghPath").value,
          token: document.getElementById("ghToken").value
        });
        updateNavbarIndicators();
        closeModal("githubSyncModal");
        showToast("GitHub Sync settings saved to this browser.", "success");
      });
    }

    const pullFromGitHubBtn = document.getElementById("pullFromGitHubBtn");
    if (pullFromGitHubBtn) {
      pullFromGitHubBtn.addEventListener("click", async () => {
        global.GameHubStorage.saveGitHubConfig({
          owner: document.getElementById("ghOwner").value,
          repo: document.getElementById("ghRepo").value,
          branch: document.getElementById("ghBranch").value,
          path: document.getElementById("ghPath").value,
          token: document.getElementById("ghToken").value
        });
        updateNavbarIndicators();
        if (!global.GameHubStorage.isGitHubReadConfigured()) {
          showToast("Enter GitHub Owner and Repository Name first.", "error");
          return;
        }
        try {
          await global.GameHubStorage.loadHubData({ forceRemote: true });
          closeModal("githubSyncModal");
          showToast("Pulled latest catalog & reviews from GitHub!", "success");
          if (typeof onDataRefresh === "function") onDataRefresh();
        } catch (err) {
          showToast(err.message || "Unable to pull from GitHub.", "error");
        }
      });
    }

    const exportJsonBtn = document.getElementById("exportJsonBtn");
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener("click", async () => {
        await global.GameHubStorage.exportGamesJson();
        showToast("Downloaded updated games.json.", "success");
      });
    }

    const resetLocalCacheBtn = document.getElementById("resetLocalCacheBtn");
    if (resetLocalCacheBtn) {
      resetLocalCacheBtn.addEventListener("click", async () => {
        await global.GameHubStorage.resetLocalCacheToSeed();
        closeModal("githubSyncModal");
        showToast("Local browser cache reset to source data.", "info");
        if (typeof onDataRefresh === "function") onDataRefresh();
      });
    }
  }

  global.GameHubUI = {
    escapeHtml,
    getVerdictLabel,
    getScoreClass,
    formatScore,
    formatDate,
    showToast,
    openModal,
    closeModal,
    updateNavbarIndicators,
    initSharedChrome
  };
})(window);
