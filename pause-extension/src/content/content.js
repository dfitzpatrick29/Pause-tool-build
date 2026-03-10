/* ─────────────────────────────────────────────────────────────
   Pause — Content Script
   Runs at document_start on every http/https page.
   If the site is blocked, the page is hidden and a full-screen
   shadow-DOM overlay (matching the popup UI) is shown instead.
   ───────────────────────────────────────────────────────────── */

(function pauseContentScript() {
  'use strict';

  /* ── CSS injected into the shadow root ── */
  const OVERLAY_CSS = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :host {
      --bg:               #f0ede8;
      --surface:          #e8e4de;
      --text-primary:     #2c2b29;
      --text-secondary:   #7a776f;
      --text-muted:       #a8a49c;
      --border:           #d4cfc8;
      --btn-bg:           #2c2b29;
      --btn-text:         #f0ede8;
      --btn-ghost-border: #b0aba2;
      --btn-ghost-text:   #5a5750;
      --danger:           #8b3a3a;
      --radius:           3px;
      --font:             "Palatino Linotype","Book Antiqua",Palatino,Georgia,serif;
      --font-ui:          -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
    }
    .overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.94);
      display: flex; align-items: center; justify-content: center;
    }
    .modal {
      background: var(--bg); border-radius: 6px;
      padding: 2rem; width: 440px; max-width: 95vw; max-height: 88vh;
      overflow-y: auto; text-align: center;
      display: flex; flex-direction: column; align-items: center;
    }
    .top-bar { display: flex; justify-content: flex-end; width: 100%; margin-bottom: 1.5rem; }
    .wordmark { font-size: .8rem; letter-spacing: .25em; text-transform: uppercase; color: var(--text-muted); font-family: var(--font-ui); margin-bottom: .6rem; font-weight: 400; }
    .divider { width: 2rem; height: 1px; background: var(--border); margin: 0 auto 1.8rem; }
    .headline { font-size: 1.25rem; font-weight: 400; color: var(--text-primary); line-height: 1.55; margin-bottom: .6rem; font-style: italic; font-family: var(--font); }
    .site-name { font-size: .95rem; font-family: var(--font-ui); color: var(--text-secondary); margin-bottom: 1.5rem; word-break: break-all; }
    .reason-input { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); font-family: var(--font); font-size: 1rem; color: var(--text-primary); padding: .85rem 1rem; resize: vertical; min-height: 90px; outline: none; transition: border-color 200ms ease; line-height: 1.5; }
    .reason-input:focus { border-color: var(--text-muted); }
    .reason-input::placeholder { color: var(--text-muted); font-style: italic; }
    .btn { display: inline-block; cursor: pointer; border: 1px solid transparent; border-radius: var(--radius); font-family: var(--font-ui); font-size: .85rem; letter-spacing: .06em; padding: .65rem 1.8rem; transition: opacity 200ms ease, background 200ms ease; -webkit-font-smoothing: antialiased; outline: none; line-height: 1; }
    .btn:focus-visible { outline: 2px solid var(--text-muted); outline-offset: 3px; }
    .btn-primary { background: var(--btn-bg); color: var(--btn-text); border-color: var(--btn-bg); }
    .btn-primary:hover { opacity: .82; }
    .btn-ghost { background: transparent; color: var(--btn-ghost-text); border-color: var(--btn-ghost-border); }
    .btn-ghost:hover { background: var(--surface); }
    .btn-sm { padding: .4rem 1rem; font-size: .78rem; }
    .btn-row { display: flex; gap: .75rem; justify-content: center; flex-wrap: wrap; margin-top: 1.5rem; width: 100%; }
    .log-section { width: 100%; margin-top: 1.5rem; border-top: 1px solid var(--border); padding-top: 1rem; text-align: left; }
    .log-label { font-size: .75rem; letter-spacing: .15em; text-transform: uppercase; color: var(--text-muted); font-family: var(--font-ui); margin-bottom: .75rem; text-align: center; }
    .log-scroll { max-height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: .6rem; }
    .log-item { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: .65rem .9rem; }
    .log-site { font-family: var(--font-ui); font-size: .72rem; color: var(--text-muted); margin-bottom: .25rem; }
    .log-reason { font-size: .9rem; color: var(--text-primary); font-family: var(--font); line-height: 1.4; }
    .log-time { font-family: var(--font-ui); font-size: .68rem; color: var(--text-muted); margin-top: .3rem; }
    .empty-note { font-size: .82rem; color: var(--text-muted); font-family: var(--font-ui); text-align: center; padding: .75rem 0; }
    .panel-title { font-size: .8rem; letter-spacing: .2em; text-transform: uppercase; font-family: var(--font-ui); color: var(--text-muted); margin-bottom: 1.4rem; }
    .add-site-row { display: flex; gap: .5rem; margin-bottom: 1.4rem; width: 100%; }
    .add-site-input { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); font-family: var(--font-ui); font-size: .85rem; color: var(--text-primary); padding: .55rem .8rem; outline: none; transition: border-color 200ms ease; }
    .add-site-input:focus { border-color: var(--text-muted); }
    .add-site-input::placeholder { color: var(--text-muted); }
    .sites-list { list-style: none; display: flex; flex-direction: column; gap: .5rem; max-height: 260px; overflow-y: auto; width: 100%; margin-bottom: 1rem; padding-right: 2px; text-align: left; }
    .site-item { display: flex; align-items: center; justify-content: space-between; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: .55rem .8rem; font-family: var(--font-ui); font-size: .85rem; color: var(--text-secondary); }
    .site-item span { word-break: break-all; flex: 1; padding-right: .5rem; }
    .remove-btn { background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 1rem; line-height: 1; padding: 0 .2rem; transition: color 200ms ease; flex-shrink: 0; }
    .remove-btn:hover { color: var(--danger); }
  `;

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

  /* ── Check if this hostname is blocked ── */
  try {
    chrome.storage.sync.get({ pause_blocked: [] }, (data) => {
      const isBlocked = (data.pause_blocked || []).some(
        (s) => hostname === s || hostname.endsWith('.' + s)
      );
      if (!isBlocked) { restorePage(); return; }
      buildOverlay(hostname);
    });
  } catch (_) {
    restorePage();
  }

  /* ── Build and inject the shadow-DOM overlay ── */
  async function buildOverlay(site) {
    if (!document.body) {
      await new Promise((r) =>
        document.addEventListener('DOMContentLoaded', r, { once: true })
      );
    }

    const host = document.createElement('div');
    host.id = '__pause_host__';
    Object.assign(host.style, {
      position: 'fixed', top: '0', left: '0',
      width: '100vw', height: '100vh',
      zIndex: '2147483647',
    });
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });
    const styleEl = document.createElement('style');
    styleEl.textContent = OVERLAY_CSS;
    shadow.appendChild(styleEl);

    showMainView(shadow, site);
  }

  /* ── Helpers ── */
  function removeOverlay() {
    document.getElementById('__pause_host__')?.remove();
    restorePage();
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function setCard(shadow, html) {
    shadow.getElementById('pause-card')?.remove();
    const div = document.createElement('div');
    div.id = 'pause-card';
    div.innerHTML = html;
    shadow.appendChild(div);
    return div;
  }

  async function getLog()      { return (await chrome.storage.local.get({ pause_log: [] })).pause_log; }
  async function setLog(arr)   { await chrome.storage.local.set({ pause_log: arr }); }
  async function getSites()    { return (await chrome.storage.sync.get({ pause_blocked: [] })).pause_blocked; }
  async function setSites(arr) { await chrome.storage.sync.set({ pause_blocked: arr }); }

  /* ── Main view: reason prompt + past entries ── */
  async function showMainView(shadow, site) {
    const entries = await getLog();
    const logHTML = entries.length === 0
      ? '<p class="empty-note">No entries yet.</p>'
      : [...entries].reverse().map((e) => `
          <div class="log-item">
            <div class="log-site">${esc(e.site)}</div>
            <div class="log-reason">${esc(e.reason)}</div>
            <div class="log-time">${esc(e.time)}</div>
          </div>`).join('');

    const card = setCard(shadow, `
      <div class="overlay">
        <div class="modal">
          <div class="top-bar">
            <button class="btn btn-ghost btn-sm" id="btn-view-blocked">View Blocked Sites</button>
          </div>
          <p class="wordmark">Pause</p>
          <div class="divider"></div>
          <p class="headline">Why are you opening</p>
          <p class="site-name">${esc(site)}?</p>
          <textarea class="reason-input" id="reason-input" placeholder="Write your reason here\u2026"></textarea>
          <div class="btn-row">
            <button class="btn btn-primary" id="btn-submit">Submit &amp; Continue</button>
            <button class="btn btn-ghost"   id="btn-go-back">Go Back</button>
          </div>
          <div class="log-section">
            <p class="log-label">Past Entries</p>
            <div class="log-scroll">${logHTML}</div>
          </div>
        </div>
      </div>
    `);

    card.querySelector('#btn-go-back').addEventListener('click', () => {
      window.location.href = 'https://www.google.com';
    });

    card.querySelector('#btn-submit').addEventListener('click', async () => {
      const reason = (card.querySelector('#reason-input').value || '').trim();
      const log = await getLog();
      log.push({ site, reason: reason || '(no reason given)', time: new Date().toLocaleString() });
      await setLog(log);
      removeOverlay();
    });

    card.querySelector('#btn-view-blocked').addEventListener('click', () => {
      showBlockedView(shadow, site);
    });
  }

  /* ── Blocked sites management view ── */
  async function showBlockedView(shadow, site) {
    const sites = await getSites();

    const listHTML = sites.length === 0
      ? '<p class="empty-note">No blocked sites yet.</p>'
      : sites.map((s, i) => `
          <li class="site-item">
            <span>${esc(s)}</span>
            <button class="remove-btn" data-i="${i}">\u00d7</button>
          </li>`).join('');

    const card = setCard(shadow, `
      <div class="overlay">
        <div class="modal">
          <p class="panel-title">Blocked Sites</p>
          <div class="add-site-row">
            <input class="add-site-input" id="add-input" type="text" placeholder="e.g. reddit.com" />
            <button class="btn btn-primary btn-sm" id="btn-add">Add</button>
          </div>
          <ul class="sites-list">${listHTML}</ul>
          <div class="btn-row">
            <button class="btn btn-ghost btn-sm" id="btn-back">\u2190 Back</button>
          </div>
        </div>
      </div>
    `);

    card.querySelector('#btn-back').addEventListener('click', () =>
      showMainView(shadow, site)
    );

    card.querySelectorAll('.remove-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const idx = parseInt(btn.dataset.i, 10);
        const cur = await getSites();
        await setSites(cur.filter((_, i) => i !== idx));
        showBlockedView(shadow, site);
      });
    });

    async function addSite() {
      let val = (card.querySelector('#add-input').value || '').trim().toLowerCase()
        .replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      if (!val) return;
      const cur = await getSites();
      if (!cur.includes(val)) { cur.push(val); await setSites(cur); }
      showBlockedView(shadow, site);
    }

    card.querySelector('#btn-add').addEventListener('click', addSite);
    card.querySelector('#add-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addSite();
    });
  }

})();
