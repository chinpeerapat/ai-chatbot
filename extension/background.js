// Background script for handling API calls
const API_BASE_URL = 'https://web.goodboy.chat';

// Handle authentication and API calls
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CHAT_REQUEST') {
    // Call the chat API endpoint
    fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: request.id,
        messages: request.messages,
        selectedChatModel: request.selectedChatModel
      }),
      credentials: 'include' // Include cookies for authentication
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      function readStream() {
        reader.read().then(({ done, value }) => {
          if (done) {
            chrome.runtime.sendMessage({ 
              type: 'STREAM_DONE'
            });
            return;
          }
          
          const chunk = decoder.decode(value, { stream: true });
          chrome.runtime.sendMessage({ 
            type: 'STREAM_CHUNK', 
            data: chunk 
          });
          
          readStream();
        });
      }
      
      readStream();
    })
    .catch(error => {
      console.error('API error:', error);
      chrome.runtime.sendMessage({ 
        type: 'API_ERROR', 
        error: error.message 
      });
    });
    
    // This keeps the message channel open for the streaming response
    return true;
  }
  
  if (request.type === 'CHECK_AUTH') {
    fetch(`${API_BASE_URL}/api/auth/session`, {
      credentials: 'include' // Include cookies for authentication
    })
    .then(response => {
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      } else {
        // If not JSON, assume not authenticated
        throw new Error('Not authenticated');
      }
    })
    .then(data => {
      if (data && data.user) {
        chrome.runtime.sendMessage({ 
          type: 'AUTH_STATUS', 
          isAuthenticated: true,
          user: data.user
        });
      } else {
        chrome.runtime.sendMessage({ 
          type: 'AUTH_STATUS', 
          isAuthenticated: false
        });
      }
    })
    .catch(error => {
      console.error('Auth check error:', error);
      chrome.runtime.sendMessage({ 
        type: 'AUTH_STATUS', 
        isAuthenticated: false,
        error: error.message
      });
    });
    
    return true;
  }
  
  if (request.type === 'OPEN_LOGIN_PAGE') {
    chrome.tabs.create({ url: `${API_BASE_URL}/login?extension=true` });
    return true;
  }
});

// Open the side panel when the extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

// Initialize the extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Chatbot extension installed');
}); 