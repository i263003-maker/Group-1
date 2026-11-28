/**
 * Shared UI helpers, modals, PNG cover upload processing, account wishlist modal,
 * score formatting, and safe HTML escaping.
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

  /**
   * Reads a user-selected PNG file, validates its type, resizes proportionally
   * within maxWidth x maxHeight on an HTML5 canvas, and returns a compact PNG data URL.
   */
  function processPngCoverUpload(file, { maxWidth = 480, maxHeight = 640 } = {}) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("No file selected."));
        return;
      }
      const isPng =
        file.type === "image/png" || String(file.name || "").toLowerCase().endsWith(".png");
      if (!isPng) {
        reject(new Error("Please choose a .png image file for the cover."));
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Could not read PNG file."));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("Invalid PNG image."));
        img.onload = () => {
          const scale = Math.min(1, maxWidth / img.width, maxHeight / img.height);
          const targetW = Math.max(1, Math.round(img.width * scale));
          const targetH = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, targetW, targetH);
          ctx.drawImage(img, 0, 0, targetW, targetH);
          const dataUrl = canvas.toDataURL("image/png");
          resolve({
            dataUrl,
            width: targetW,
            height: targetH,
            fileName: file.name
          });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function updateNavbarIndicators() {
    const activeAccount = global.GameHubStorage.getCurrentAccount();
    const countEl = document.getElementById("navWishlistCount");
    if (countEl) {
      countEl.textContent = String(global.GameHubStorage.getWishlist(activeAccount).length);
    }

    const acctEl = document.getElementById("navAccountLabel");
    if (acctEl) {
      acctEl.textContent = activeAccount;
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
      .map((s) => {
        const thumb = s.coverImage
          ? `<img class="submission-thumb" src="${escapeHtml(s.coverImage)}" alt="${escapeHtml(
              s.title
            )} cover" />`
          : "";
        return `
          <div class="submission-row">
            <div style="display:flex; align-items:center; gap:0.65rem;">
              ${thumb}
              <div>
                <strong>${escapeHtml(s.title)}</strong>
                <div class="muted">by ${escapeHtml(s.developer || "Unknown Studio")}</div>
              </div>
            </div>
            <span class="muted">${escapeHtml(s.platforms || "Multiplatform")}</span>
          </div>
        `;
      })
      .join("");
  }

  async function renderAccountWishlistModal() {
    const acct = global.GameHubStorage.getCurrentAccount();
    const inputEl = document.getElementById("accountIdInput");
    const listEl = document.getElementById("accountWishlistItems");
    const titleEl = document.getElementById("accountWishlistHeading");
    if (!inputEl || !listEl || !titleEl) return;

    inputEl.value = acct;
    const { data } = await global.GameHubStorage.loadHubData();
    const wishlistIds = global.GameHubStorage.getWishlist(acct);
    titleEl.textContent = `${acct}'s Saved Wishlist (${wishlistIds.length})`;

    if (!wishlistIds.length) {
      listEl.innerHTML = `<p class="helper-text">No games wishlisted for <code>${escapeHtml(
        acct
      )}</code> yet.</p>`;
      return;
    }

    const gamesById = new Map((data.games || []).map((g) => [g.id, g]));
    listEl.innerHTML = wishlistIds
      .map((id) => {
        const game = gamesById.get(id);
        const title = game ? game.title : id;
        return `
          <div class="wishlist-row">
            <a class="wishlist-row-link" href="game.html?id=${encodeURIComponent(id)}">
              ${escapeHtml(title)}
            </a>
            <button
              type="button"
              class="btn btn-ghost btn-sm"
              data-remove-wishlist-id="${escapeHtml(id)}"
            >
              Remove
            </button>
          </div>
        `;
      })
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

    // Submit Game for Review Modal + PNG cover upload
    let pendingCoverDataUrl = "";
    let pendingCoverFileName = "";

    const resetSubCoverPreview = () => {
      pendingCoverDataUrl = "";
      pendingCoverFileName = "";
      const fileInput = document.getElementById("subCoverFile");
      const preview = document.getElementById("subCoverPreview");
      const meta = document.getElementById("subCoverMeta");
      const clearBtn = document.getElementById("subCoverClearBtn");
      if (fileInput) fileInput.value = "";
      if (preview) preview.innerHTML = `<span>PNG Cover</span>`;
      if (meta) meta.textContent = "No PNG selected";
      if (clearBtn) clearBtn.hidden = true;
    };

    const subCoverFile = document.getElementById("subCoverFile");
    if (subCoverFile) {
      subCoverFile.addEventListener("change", async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) {
          resetSubCoverPreview();
          return;
        }
        try {
          const processed = await processPngCoverUpload(file);
          pendingCoverDataUrl = processed.dataUrl;
          pendingCoverFileName = processed.fileName;
          const preview = document.getElementById("subCoverPreview");
          const meta = document.getElementById("subCoverMeta");
          const clearBtn = document.getElementById("subCoverClearBtn");
          if (preview) {
            preview.innerHTML = `<img src="${escapeHtml(processed.dataUrl)}" alt="Cover preview" />`;
          }
          if (meta) {
            meta.textContent = `${processed.fileName} (${processed.width}x${processed.height} PNG)`;
          }
          if (clearBtn) clearBtn.hidden = false;
        } catch (err) {
          resetSubCoverPreview();
          showToast(err.message || "Could not process PNG cover.", "error");
        }
      });
    }

    const subCoverClearBtn = document.getElementById("subCoverClearBtn");
    if (subCoverClearBtn) {
      subCoverClearBtn.addEventListener("click", resetSubCoverPreview);
    }

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
            notes: document.getElementById("subNotes").value,
            coverImage: pendingCoverDataUrl,
            coverFileName: pendingCoverFileName
          });
          submitGameForm.reset();
          resetSubCoverPreview();
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
        const coverNote = pendingCoverFileName
          ? `Attached in local queue: ${pendingCoverFileName} (drag-and-drop PNG into this issue if desired)`
          : "None";

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
            `- **Cover PNG:** ${coverNote}`,
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

    // Account & Per-Account Wishlist Modal
    const openAccountModalBtn = document.getElementById("openAccountModalBtn");
    if (openAccountModalBtn) {
      openAccountModalBtn.addEventListener("click", async () => {
        await renderAccountWishlistModal();
        openModal("accountModal");
      });
    }

    const accountForm = document.getElementById("accountForm");
    if (accountForm) {
      accountForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const acct = global.GameHubStorage.setCurrentAccount(
          document.getElementById("accountIdInput").value
        );
        updateNavbarIndicators();
        await renderAccountWishlistModal();
        showToast(`Switched active wishlist account to "${acct}".`, "success");
        if (typeof onDataRefresh === "function") onDataRefresh();
      });
    }

    const accountWishlistItems = document.getElementById("accountWishlistItems");
    if (accountWishlistItems) {
      accountWishlistItems.addEventListener("click", async (event) => {
        const btn = event.target.closest("[data-remove-wishlist-id]");
        if (!btn) return;
        const gameId = btn.getAttribute("data-remove-wishlist-id");
        await global.GameHubStorage.toggleWishlist(gameId);
        updateNavbarIndicators();
        await renderAccountWishlistModal();
        if (typeof onDataRefresh === "function") onDataRefresh();
      });
    }

    // GitHub Sync Modal
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
          showToast("Pulled latest catalog, reviews & wishlists from GitHub!", "success");
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
    processPngCoverUpload,
    updateNavbarIndicators,
    initSharedChrome
  };
})(window);
