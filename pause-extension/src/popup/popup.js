/* ─────────────────────────────────────────────────────────────
   Pause — Chrome Extension Popup Logic
   Uses chrome.storage.sync for blocked sites (syncs across devices)
   Uses chrome.storage.local for the reason log (more space)
   ───────────────────────────────────────────────────────────── */

const FADE   = 400;   // view-transition duration (ms)
const ACK_MS = 2000;  // acknowledgement display time (ms)

/* ── Storage helpers ── */
async function loadBlockedSites() {
  const data = await chrome.storage.sync.get({ pause_blocked: [] });
  return data.pause_blocked;
}

async function saveBlockedSites(arr) {
  await chrome.storage.sync.set({ pause_blocked: arr });
}

async function loadLog() {
  const data = await chrome.storage.local.get({ pause_log: [] });
  return data.pause_log;
}

async function saveLog(arr) {
  await chrome.storage.local.set({ pause_log: arr });
}

/* ── Current-site detection via chrome.tabs ── */
async function getCurrentSite() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      return new URL(tab.url).hostname;
    }
  } catch (_) { /* ignore */ }
  return 'this page';
}

/* ── DOM refs ── */
const views = {
  entry:   document.getElementById('view-entry'),
  blocked: document.getElementById('view-blocked'),
  log:     document.getElementById('view-log'),
  ack:     document.getElementById('view-ack'),
};

const currentSiteEl   = document.getElementById('current-site');
const reasonInput     = document.getElementById('reason-input');
const btnSubmit       = document.getElementById('btn-submit');
const btnViewLog      = document.getElementById('btn-view-log');
const btnOpenBlocked  = document.getElementById('btn-open-blocked');
const btnBackBlocked  = document.getElementById('btn-back-from-blocked');
const btnBackLog      = document.getElementById('btn-back-from-log');
const btnClearLog     = document.getElementById('btn-clear-log');
const addSiteInput    = document.getElementById('add-site-input');
const btnAddSite      = document.getElementById('btn-add-site');
const sitesList       = document.getElementById('sites-list');
const logList         = document.getElementById('log-list');
const ackMessage      = document.getElementById('ack-message');

let ackTimeout = null;
let currentSiteHostname = 'this page';

/* ── View transition ── */
function showView(id) {
  const current = document.querySelector('.view.active');
  const next    = views[id];
  if (current === next) return;

  if (current) {
    current.style.opacity = '0';
    current.style.pointerEvents = 'none';
    setTimeout(() => {
      current.classList.remove('active');
      current.style.opacity = '';
    }, FADE);
  }

  setTimeout(() => { next.classList.add('active'); }, FADE * 0.6);
}

/* ── Render blocked-sites list ── */
async function renderBlockedSites() {
  const sites = await loadBlockedSites();
  sitesList.innerHTML = '';

  if (sites.length === 0) {
    sitesList.innerHTML = '<p class="empty-note">No blocked sites yet.</p>';
    return;
  }

  sites.forEach((site, i) => {
    const li  = document.createElement('li');
    li.className = 'site-item';

    const span = document.createElement('span');
    span.textContent = site;

    const btn = document.createElement('button');
    btn.className   = 'remove-btn';
    btn.textContent = '×';
    btn.title       = 'Remove';
    btn.addEventListener('click', async () => {
      const current = await loadBlockedSites();
      const updated = current.filter((_, idx) => idx !== i);
      await saveBlockedSites(updated);
      renderBlockedSites();
    });

    li.appendChild(span);
    li.appendChild(btn);
    sitesList.appendChild(li);
  });
}

/* ── Render reason log ── */
async function renderLog() {
  const entries = await loadLog();
  logList.innerHTML = '';

  if (entries.length === 0) {
    logList.innerHTML = '<p class="empty-note">No reasons recorded yet.</p>';
    return;
  }

  /* Newest first */
  [...entries].reverse().forEach(entry => {
    const li = document.createElement('li');
    li.className = 'log-item';
    li.innerHTML = `
      <div class="log-site">${escapeHtml(entry.site)}</div>
      <div class="log-reason">${escapeHtml(entry.reason)}</div>
      <div class="log-time">${escapeHtml(entry.time)}</div>
    `;
    logList.appendChild(li);
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Add site ── */
async function addSite() {
  let val = addSiteInput.value.trim().toLowerCase();
  // Strip protocol and trailing path
  val = val.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!val) return;

  const sites = await loadBlockedSites();
  if (!sites.includes(val)) {
    sites.push(val);
    await saveBlockedSites(sites);
  }

  addSiteInput.value = '';
  renderBlockedSites();
}

btnAddSite.addEventListener('click', addSite);
addSiteInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addSite(); });

/* ── Submit reason ── */
btnSubmit.addEventListener('click', async () => {
  const reason = reasonInput.value.trim();
  const site   = currentSiteHostname;

  const entries = await loadLog();
  entries.push({
    site,
    reason: reason || '(no reason given)',
    time: new Date().toLocaleString(),
  });
  await saveLog(entries);

  ackMessage.textContent = reason
    ? 'Reason noted. Carry on.'
    : 'No reason given — noted.';

  reasonInput.value = '';
  showView('ack');

  clearTimeout(ackTimeout);
  ackTimeout = setTimeout(() => showView('entry'), ACK_MS);
});

/* ── Navigation buttons ── */
btnViewLog.addEventListener('click', () => {
  renderLog();
  showView('log');
});

btnOpenBlocked.addEventListener('click', () => {
  renderBlockedSites();
  showView('blocked');
});

btnBackBlocked.addEventListener('click', () => showView('entry'));
btnBackLog.addEventListener('click',     () => showView('entry'));

/* ── Clear log ── */
btnClearLog.addEventListener('click', async () => {
  if (confirm('Clear all recorded reasons?')) {
    await saveLog([]);
    renderLog();
  }
});

/* ── Initialise ── */
(async () => {
  currentSiteHostname = await getCurrentSite();
  currentSiteEl.textContent = currentSiteHostname + '?';
})();
