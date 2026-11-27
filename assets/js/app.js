/**
 * QuestIndex - Application Bootstrapper
 * Pure Vanilla JavaScript (ES6)
 */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    window.QuestIndex.chrome.mount();
    window.QuestIndex.pages.init();
  });
})();
