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
  chrome.runtime.sendMessage({ type: 'CHECK_AUTH' });
  
  // Listen for authentication status response
  chrome.runtime.onMessage.addListener(function(message) {
    if (message.type === 'AUTH_STATUS') {
      // Remove loading indicator
      rootElement.innerHTML = '';
      
      isAuthenticated = message.isAuthenticated;
      
      // Initialize chat interface
      if (chatCleanup) {
        chatCleanup();
      }
      
      chatCleanup = createChatInterface(rootElement, isAuthenticated);
    }
  });
}); 