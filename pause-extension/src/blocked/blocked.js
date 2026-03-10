const blockedSitesKey = 'blockedSites';

// Function to load blocked sites from local storage
function loadBlockedSites() {
    const blockedSites = JSON.parse(localStorage.getItem(blockedSitesKey)) || [];
    displayBlockedSites(blockedSites);
}

// Function to display blocked sites in the UI
function displayBlockedSites(blockedSites) {
    const blockedList = document.getElementById('blocked-list');
    blockedList.innerHTML = ''; // Clear existing list

    blockedSites.forEach(site => {
        const listItem = document.createElement('li');
        listItem.textContent = site;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => {
            removeBlockedSite(site);
        };

        listItem.appendChild(removeButton);
        blockedList.appendChild(listItem);
    });
}

// Function to remove a site from the blocked list
function removeBlockedSite(site) {
    let blockedSites = JSON.parse(localStorage.getItem(blockedSitesKey)) || [];
    blockedSites = blockedSites.filter(s => s !== site);
    localStorage.setItem(blockedSitesKey, JSON.stringify(blockedSites));
    displayBlockedSites(blockedSites);
}

// Function to initialize the blocked sites view
function initBlockedSitesView() {
    loadBlockedSites();
}

// Event listener for DOMContentLoaded to initialize the view
document.addEventListener('DOMContentLoaded', initBlockedSitesView);