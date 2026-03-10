/* ─────────────────────────────────────────────────────────────
   Pause — Background Service Worker (Manifest V3)
   • Initialises default storage on install
   Note: Blocked-site interception is handled entirely by the
   content script (content.js), which checks storage at
   document_start and injects an overlay when needed.
   ───────────────────────────────────────────────────────────── */

const STORAGE_KEY_BLOCKED = 'pause_blocked';

/* ── Install / update ── */
chrome.runtime.onInstalled.addListener(() => {
  // Seed with an empty blocked list if nothing is stored yet
  chrome.storage.sync.get({ [STORAGE_KEY_BLOCKED]: null }, (data) => {
    if (data[STORAGE_KEY_BLOCKED] === null) {
      chrome.storage.sync.set({ [STORAGE_KEY_BLOCKED]: [] });
    }
  });
  console.log('Pause extension installed.');
});
