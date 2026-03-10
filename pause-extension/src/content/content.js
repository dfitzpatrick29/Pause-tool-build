const questionPrompt = "Why are you opening this website?";
const responseKey = "userResponse";
const blockedSitesKey = "blockedSites";

// Create and inject the prompt elements
function createPrompt() {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';

    const promptBox = document.createElement('div');
    promptBox.style.backgroundColor = 'white';
    promptBox.style.padding = '20px';
    promptBox.style.borderRadius = '8px';
    promptBox.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    promptBox.style.textAlign = 'center';

    const question = document.createElement('p');
    question.textContent = questionPrompt;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Your response...';
    input.style.width = '100%';
    input.style.marginBottom = '10px';
    input.style.padding = '10px';
    input.style.border = '1px solid #ccc';
    input.style.borderRadius = '4px';

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.style.padding = '10px 20px';
    submitButton.style.border = 'none';
    submitButton.style.borderRadius = '4px';
    submitButton.style.backgroundColor = '#007bff';
    submitButton.style.color = 'white';
    submitButton.style.cursor = 'pointer';

    submitButton.addEventListener('click', () => {
        const response = input.value;
        if (response) {
            localStorage.setItem(responseKey, response);
            overlay.remove();
            showBlockedSitesButton();
        }
    });

    promptBox.appendChild(question);
    promptBox.appendChild(input);
    promptBox.appendChild(submitButton);
    overlay.appendChild(promptBox);
    document.body.appendChild(overlay);
}

// Show button to manage blocked sites
function showBlockedSitesButton() {
    const button = document.createElement('button');
    button.textContent = 'Manage Blocked Sites';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.padding = '10px 20px';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.backgroundColor = '#dc3545';
    button.style.color = 'white';
    button.style.cursor = 'pointer';
    button.style.zIndex = '9999';

    button.addEventListener('click', () => {
        const blockedSites = JSON.parse(localStorage.getItem(blockedSitesKey)) || [];
        alert(`Blocked Sites:\n${blockedSites.join('\n')}`);
    });

    document.body.appendChild(button);
}

// Initialize the content script
createPrompt();