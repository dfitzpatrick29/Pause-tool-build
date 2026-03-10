const blockedSitesKey = 'blockedSites';

// Load blocked sites from local storage
function loadBlockedSites() {
    const blockedSites = JSON.parse(localStorage.getItem(blockedSitesKey)) || [];
    return blockedSites;
}

// Save blocked sites to local storage
function saveBlockedSites(sites) {
    localStorage.setItem(blockedSitesKey, JSON.stringify(sites));
}

// Add a new site to the blocked list
function addBlockedSite(site) {
    const blockedSites = loadBlockedSites();
    if (!blockedSites.includes(site)) {
        blockedSites.push(site);
        saveBlockedSites(blockedSites);
    }
}

// Remove a site from the blocked list
function removeBlockedSite(site) {
    let blockedSites = loadBlockedSites();
    blockedSites = blockedSites.filter(s => s !== site);
    saveBlockedSites(blockedSites);
}

// Display the current list of blocked sites
function displayBlockedSites() {
    const blockedSites = loadBlockedSites();
    const sitesList = document.getElementById('sites-list');
    sitesList.innerHTML = '';

    blockedSites.forEach(site => {
        const listItem = document.createElement('li');
        listItem.textContent = site;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => {
            removeBlockedSite(site);
            displayBlockedSites();
        };

        listItem.appendChild(removeButton);
        sitesList.appendChild(listItem);
    });
}

// Initialize the sites management view
document.addEventListener('DOMContentLoaded', () => {
    displayBlockedSites();

    const addSiteForm = document.getElementById('add-site-form');
    addSiteForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const siteInput = document.getElementById('site-input');
        const site = siteInput.value.trim();
        if (site) {
            addBlockedSite(site);
            siteInput.value = '';
            displayBlockedSites();
        }
    });
});