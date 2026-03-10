/* ─────────────────────────────────────────────────────────────
   Pause — Background Service Worker (Manifest V3)
   • Initialises default storage on install
   • Monitors tab navigation and redirects blocked sites
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

/* ── Tab navigation watcher ── */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return;

  // Ignore internal pages
  if (
    tab.url.startsWith('chrome://') ||
    tab.url.startsWith('chrome-extension://') ||
    tab.url.startsWith('about:')
  ) {
    return;
  }

  try {
    const hostname = new URL(tab.url).hostname;

    chrome.storage.sync.get({ [STORAGE_KEY_BLOCKED]: [] }, (data) => {
      const blocked = data[STORAGE_KEY_BLOCKED];
      const isBlocked = blocked.some(
        (site) => hostname === site || hostname.endsWith('.' + site)
      );

      if (isBlocked) {
        const redirectUrl = chrome.runtime.getURL(
          'src/blocked/blocked.html?site=' + encodeURIComponent(hostname)
        );
        chrome.tabs.update(tabId, { url: redirectUrl });
      }
    });
  } catch (_) {
    // Invalid URL — ignore
  }
});
