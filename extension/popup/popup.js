document.addEventListener('DOMContentLoaded', function() {
  const openSidePanelButton = document.getElementById('open-sidepanel');
  const authStatusElement = document.getElementById('auth-status');
  
  // Open side panel when button is clicked
  openSidePanelButton.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]) {
        chrome.sidePanel.open({ tabId: tabs[0].id });
        window.close(); // Close the popup
      }
    });
  });
  
  // Check authentication status
  chrome.runtime.sendMessage({ type: 'CHECK_AUTH' });
  
  // Listen for authentication status response
  chrome.runtime.onMessage.addListener(function(message) {
    if (message.type === 'AUTH_STATUS') {
      if (message.isAuthenticated) {
        authStatusElement.className = 'auth-status authenticated';
        authStatusElement.innerHTML = `
          <p>Authenticated as: ${message.user.email || message.user.name || 'User'}</p>
        `;
      } else {
        authStatusElement.className = 'auth-status unauthenticated';
        authStatusElement.innerHTML = `
          <p>Not authenticated. Please log in to the main app first.</p>
          <button id="login-button">Log in</button>
        `;
        
        // Add event listener to login button
        setTimeout(() => {
          const loginButton = document.getElementById('login-button');
          if (loginButton) {
            loginButton.addEventListener('click', function() {
              chrome.runtime.sendMessage({ type: 'OPEN_LOGIN_PAGE' });
              window.close(); // Close the popup
            });
          }
        }, 0);
      }
    }
  });
}); 