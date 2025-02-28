// Main sidepanel script
document.addEventListener('DOMContentLoaded', function() {
  const rootElement = document.getElementById('root');
  let chatCleanup = null;
  let isAuthenticated = false;
  
  // Show loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'loading-indicator';
  loadingIndicator.innerHTML = `
    <div class="loading-dots">
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
    </div>
  `;
  rootElement.appendChild(loadingIndicator);
  
  // Check authentication status
  try {
    chrome.runtime.sendMessage({ type: 'CHECK_AUTH' }, function(response) {
      console.log('Received response from CHECK_AUTH:', response);
      // We don't need to do anything with the response, just ensuring the callback is provided
    });
  } catch (error) {
    console.error('Error sending CHECK_AUTH message:', error);
    showError(rootElement, 'Failed to connect to extension. Please try reloading the page.');
  }
  
  // Listen for authentication status response
  chrome.runtime.onMessage.addListener(function(message) {
    console.log('Sidepanel received message:', message);
    
    if (message.type === 'AUTH_STATUS') {
      // Remove loading indicator
      rootElement.innerHTML = '';
      
      isAuthenticated = message.isAuthenticated;
      console.log('Authentication status:', isAuthenticated);
      
      // Initialize chat interface
      if (chatCleanup) {
        chatCleanup();
      }
      
      chatCleanup = createChatInterface(rootElement, isAuthenticated);
    }
    
    if (message.type === 'STREAM_CHUNK') {
      console.log('Stream chunk received in sidepanel:', message.data);
    }
    
    if (message.type === 'STREAM_DONE') {
      console.log('Stream done received in sidepanel');
    }
  });
  
  // Set a timeout to show an error if we don't get a response
  setTimeout(() => {
    if (rootElement.contains(loadingIndicator)) {
      showError(rootElement, 'Authentication check timed out. Please try reloading the page.');
    }
  }, 10000); // 10 seconds timeout
});

// Helper function to show errors
function showError(rootElement, message) {
  rootElement.innerHTML = '';
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  
  const reloadButton = document.createElement('button');
  reloadButton.textContent = 'Reload';
  reloadButton.addEventListener('click', () => {
    window.location.reload();
  });
  
  errorElement.appendChild(document.createElement('br'));
  errorElement.appendChild(reloadButton);
  
  rootElement.appendChild(errorElement);
} 