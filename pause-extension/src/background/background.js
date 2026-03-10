/* ─────────────────────────────────────────────────────────────
   Pause — Background Service Worker (Manifest V3)
   • Initialises default storage on install
   • Listens for PAUSE_BLOCKED from the content script,
     stores pending {site, tabId}, then opens the popup
   • Listens for PAUSE_PROCEED from the popup and forwards
     it to the waiting content script tab
   ───────────────────────────────────────────────────────────── */

const STORAGE_KEY_BLOCKED = 'pause_blocked';
const STORAGE_KEY_PENDING = 'pause_pending';

/* ── Install / update ── */
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get({ [STORAGE_KEY_BLOCKED]: null }, (data) => {
    if (data[STORAGE_KEY_BLOCKED] === null) {
      chrome.storage.sync.set({ [STORAGE_KEY_BLOCKED]: [] });
    }
  });
  console.log('Pause extension installed.');
});

/* ── Message handler ── */
chrome.runtime.onMessage.addListener((msg, sender) => {
  /* Content script detected a blocked site — store state and open popup */
  if (msg.type === 'PAUSE_BLOCKED') {
    chrome.storage.local.set(
      { [STORAGE_KEY_PENDING]: { site: msg.site, tabId: sender.tab.id } },
      () => { chrome.action.openPopup(); }
    );
  }

  /* Popup submitted a reason — forward the proceed signal to the waiting tab */
  if (msg.type === 'PAUSE_PROCEED') {
    chrome.storage.local.get({ [STORAGE_KEY_PENDING]: null }, (data) => {
      const pending = data[STORAGE_KEY_PENDING];
      if (pending) {
        chrome.tabs.sendMessage(pending.tabId, { type: 'PAUSE_PROCEED' });
        chrome.storage.local.remove(STORAGE_KEY_PENDING);
      }
    });
  }
});
