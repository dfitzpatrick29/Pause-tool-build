const blockedSitesKey = 'blockedSites';

// Initialize blocked sites from storage
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ [blockedSitesKey]: [] });
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        chrome.storage.sync.get(blockedSitesKey, (data) => {
            const blockedSites = data[blockedSitesKey];
            const currentUrl = new URL(tab.url).hostname;

            if (blockedSites.includes(currentUrl)) {
                chrome.tabs.update(tabId, { url: chrome.runtime.getURL('blocked.html') });
            } else {
                chrome.tabs.executeScript(tabId, { file: 'content/content.js' });
            }
        });
    }
});

// Function to add a site to the blocked list
function addBlockedSite(site) {
    chrome.storage.sync.get(blockedSitesKey, (data) => {
        const blockedSites = data[blockedSitesKey];
        if (!blockedSites.includes(site)) {
            blockedSites.push(site);
            chrome.storage.sync.set({ [blockedSitesKey]: blockedSites });
        }
    });
}

// Function to remove a site from the blocked list
function removeBlockedSite(site) {
    chrome.storage.sync.get(blockedSitesKey, (data) => {
        const blockedSites = data[blockedSitesKey];
        const updatedSites = blockedSites.filter(s => s !== site);
        chrome.storage.sync.set({ [blockedSitesKey]: updatedSites });
    });
}

// Expose functions to other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'addBlockedSite') {
        addBlockedSite(request.site);
        sendResponse({ status: 'success' });
    } else if (request.action === 'removeBlockedSite') {
        removeBlockedSite(request.site);
        sendResponse({ status: 'success' });
    } else if (request.action === 'getBlockedSites') {
        chrome.storage.sync.get(blockedSitesKey, (data) => {
            sendResponse({ sites: data[blockedSitesKey] });
        });
        return true; // Indicates that the response will be sent asynchronously
    }
});