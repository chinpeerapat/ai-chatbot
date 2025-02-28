document.addEventListener('DOMContentLoaded', function() {
  const openSidePanelButton = document.getElementById('open-sidepanel');
  const authStatusElement = document.getElementById('auth-status');
  
  // Open side panel when button is clicked
  openSidePanelButton.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]) {
        try {
          chrome.sidePanel.open({ tabId: tabs[0].id });
          window.close(); // Close the popup
        } catch (error) {
          console.error('Error opening side panel:', error);
          showError('Failed to open side panel. Please try again.');
        }
      }
    });
  });
  
  // Check authentication status
  try {
    chrome.runtime.sendMessage({ type: 'CHECK_AUTH' }, function(response) {
      console.log('Received response from CHECK_AUTH:', response);
      // We don't need to do anything with the response, just ensuring the callback is provided
    });
  } catch (error) {
    console.error('Error sending CHECK_AUTH message:', error);
    showError('Failed to connect to extension. Please try reloading.');
  }
  
  // Listen for authentication status response
  chrome.runtime.onMessage.addListener(function(message) {
    console.log('Popup received message:', message);
    
    if (message.type === 'AUTH_STATUS') {
      if (message.isAuthenticated) {
        authStatusElement.className = 'auth-status authenticated';
        authStatusElement.innerHTML = `
          <p>Authenticated as: ${message.user.email || message.user.name || 'User'}</p>
          <button id="open-sidepanel-btn" class="action-button">Open Chatbot</button>
        `;
        
        // Add event listener to the new open button
        setTimeout(() => {
          const openButton = document.getElementById('open-sidepanel-btn');
          if (openButton) {
            openButton.addEventListener('click', function() {
              chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                if (tabs[0]) {
                  chrome.sidePanel.open({ tabId: tabs[0].id });
                  window.close();
                }
              });
            });
          }
        }, 0);
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
              try {
                chrome.runtime.sendMessage({ type: 'OPEN_LOGIN_PAGE' }, function(response) {
                  console.log('Received response from OPEN_LOGIN_PAGE:', response);
                  window.close(); // Close the popup
                });
              } catch (error) {
                console.error('Error sending OPEN_LOGIN_PAGE message:', error);
                showError('Failed to open login page. Please try again.');
              }
            });
          }
        }, 0);
      }
    }
  });
  
  // Set a timeout to show an error if we don't get a response
  setTimeout(() => {
    if (authStatusElement.textContent.includes('Checking authentication status')) {
      showError('Authentication check timed out. Please try reloading.');
    }
  }, 10000); // 10 seconds timeout
  
  // Helper function to show errors
  function showError(message) {
    authStatusElement.className = 'auth-status error';
    authStatusElement.innerHTML = `
      <p>${message}</p>
      <button id="reload-button">Reload</button>
    `;
    
    setTimeout(() => {
      const reloadButton = document.getElementById('reload-button');
      if (reloadButton) {
        reloadButton.addEventListener('click', function() {
          window.location.reload();
        });
      }
    }, 0);
  }
});