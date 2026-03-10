# Pause

**Break the trance. Ask yourself why before you scroll.**

Pause is a Chrome extension that helps you build more intentional browsing habits. When you click the extension icon, it asks *"Why are you opening this site?"* — giving you a moment to reflect before you dive in.

## Features

- **Mindful prompt** — asks why you're visiting the current site and logs your reason
- **Blocked sites** — add sites to a block list; they'll be redirected to a gentle "paused" page
- **Reason log** — review past reasons to spot patterns in your browsing
- **Synced storage** — your blocked-sites list syncs across Chrome devices

## Installation (Load Unpacked)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked** and select the `pause-extension` folder
5. The Pause icon will appear in your toolbar

## Project Structure

```
pause-extension/
├── manifest.json
├── README.md
└── src/
    ├── background/
    │   └── background.js      ← Service worker: blocked-site detection
    ├── blocked/
    │   ├── blocked.html        ← Page shown when a blocked site is visited
    │   ├── blocked.css
    │   └── blocked.js
    ├── content/
    │   └── content.js          ← Content script (placeholder for future features)
    └── popup/
        ├── popup.html          ← Extension popup UI
        ├── popup.css
        └── popup.js
```

## How It Works

| Component | Role |
|---|---|
| **Popup** | Shows "Why are you opening [site]?", manages blocked sites, and displays the reason log |
| **Background** | Watches tab navigation; redirects blocked sites to the paused page |
| **Blocked page** | Explains the site is paused; offers "Go Back" or "Unblock" |
| **Content script** | Reserved for future page-level features (scroll tracking, timers, overlays) |

## License

MIT
