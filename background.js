// Background service worker — handles tab events in the future
chrome.runtime.onInstalled.addListener(() => {
  console.log('Pause extension installed.');
});