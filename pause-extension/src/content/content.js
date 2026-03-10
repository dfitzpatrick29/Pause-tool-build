/* ─────────────────────────────────────────────────────────────
   Pause — Content Script
   Runs at document_start on every http/https page.
   If the site is blocked, the page is kept black and the
   extension popup is opened automatically to prompt for a reason.
   Once the user submits their reason the popup signals back and
   the page is revealed.
   ───────────────────────────────────────────────────────────── */

(function pauseContentScript() {
  'use strict';

  /* ── Immediately hide the page to prevent any flash of blocked content ── */
  const hideStyle = document.createElement('style');
  hideStyle.id = '__pause_hide__';
  hideStyle.textContent = 'html { visibility: hidden !important; }';
  document.documentElement.appendChild(hideStyle);

  function restorePage() {
    document.getElementById('__pause_hide__')?.remove();
  }

  /* ── Skip non-real URLs ── */
  const hostname = window.location.hostname;
  if (!hostname) { restorePage(); return; }

  /* ── Listen for proceed signal forwarded by the background ── */
  chrome.runtime.onMessage.addListener(function handler(msg) {
    if (msg.type === 'PAUSE_PROCEED') {
      restorePage();
      chrome.runtime.onMessage.removeListener(handler);
    }
  });

  /* ── Check if this hostname is blocked ── */
  try {
    chrome.storage.sync.get({ pause_blocked: [] }, (data) => {
      const isBlocked = (data.pause_blocked || []).some(
        (s) => hostname === s || hostname.endsWith('.' + s)
      );
      if (!isBlocked) { restorePage(); return; }

      /* Signal the background to open the popup */
      chrome.runtime.sendMessage({ type: 'PAUSE_BLOCKED', site: hostname });

      /* Safety fallback: restore after 60 s in case popup never responds */
      setTimeout(restorePage, 60_000);
    });
  } catch (_) {
    restorePage();
  }
})();

