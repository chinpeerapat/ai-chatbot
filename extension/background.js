// Background script for handling API calls
const API_BASE_URL = 'https://web.goodboy.chat';

// Handle authentication and API calls
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CHAT_REQUEST') {
    console.log('Sending chat request:', request);
    
    // Start the API call but don't keep the message channel open
    handleChatRequest(request);
    
    // Immediately respond to close the message channel
    sendResponse({ status: 'Processing chat request' });
    return false; // Don't keep the channel open
  }
  
  if (request.type === 'CHECK_AUTH') {
    console.log('Checking authentication status');
    
    // Start the auth check but don't keep the message channel open
    handleAuthCheck();
    
    // Immediately respond to close the message channel
    sendResponse({ status: 'Checking authentication' });
    return false; // Don't keep the channel open
  }
  
  if (request.type === 'OPEN_LOGIN_PAGE') {
    console.log('Opening login page');
    chrome.tabs.create({ url: `${API_BASE_URL}/login?extension=true` });
    
    // Immediately respond to close the message channel
    sendResponse({ status: 'Opening login page' });
    return false; // Don't keep the channel open
  }
  
  return false; // Don't keep the channel open by default
});

// Handle chat request separately
function handleChatRequest(request) {
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
    console.log('Chat API response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    // Check if the response is a stream
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    // Handle non-streaming response (regular JSON)
    if (contentType && contentType.includes('application/json')) {
      return response.json().then(data => {
        console.log('Received JSON response:', data);
        
        // Send the response as a single message
        chrome.runtime.sendMessage({ 
          type: 'STREAM_CHUNK', 
          data: JSON.stringify(data)
        }).catch(err => console.error('Error sending JSON response message:', err));
        
        // Send stream done message
        chrome.runtime.sendMessage({ 
          type: 'STREAM_DONE'
        }).catch(err => console.error('Error sending STREAM_DONE message:', err));
      });
    }
    
    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    function readStream() {
      reader.read().then(({ done, value }) => {
        if (done) {
          console.log('Stream done');
          chrome.runtime.sendMessage({ 
            type: 'STREAM_DONE'
          }).catch(err => console.error('Error sending STREAM_DONE message:', err));
          return;
        }
        
        const chunk = decoder.decode(value, { stream: true });
        console.log('Received chunk:', chunk);
        
        // If the chunk is empty or doesn't contain valid data, skip it
        if (!chunk || chunk.trim() === '') {
          readStream();
          return;
        }
        
        chrome.runtime.sendMessage({ 
          type: 'STREAM_CHUNK', 
          data: chunk 
        }).catch(err => {
          console.error('Error sending STREAM_CHUNK message:', err);
          // Continue reading even if there's an error sending the message
        });
        
        readStream();
      }).catch(err => {
        console.error('Error reading stream:', err);
        chrome.runtime.sendMessage({ 
          type: 'API_ERROR', 
          error: 'Error reading response stream'
        }).catch(err => console.error('Error sending API_ERROR message:', err));
      });
    }
    
    readStream();
  })
  .catch(error => {
    console.error('API error:', error);
    chrome.runtime.sendMessage({ 
      type: 'API_ERROR', 
      error: error.message 
    }).catch(err => console.error('Error sending API_ERROR message:', err));
  });
}

// Handle auth check separately
function handleAuthCheck() {
  fetch(`${API_BASE_URL}/api/auth/session`, {
    credentials: 'include' // Include cookies for authentication
  })
  .then(response => {
    console.log('Auth check response status:', response.status);
    
    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      // If not JSON, assume not authenticated (likely HTML login page)
      throw new Error('Not authenticated - received non-JSON response');
    }
    return response.json();
  })
  .then(data => {
    console.log('Auth data:', data);
    
    if (data && data.user) {
      chrome.runtime.sendMessage({ 
        type: 'AUTH_STATUS', 
        isAuthenticated: true,
        user: data.user
      }).catch(err => console.error('Error sending AUTH_STATUS message:', err));
    } else {
      chrome.runtime.sendMessage({ 
        type: 'AUTH_STATUS', 
        isAuthenticated: false
      }).catch(err => console.error('Error sending AUTH_STATUS message:', err));
    }
  })
  .catch(error => {
    console.error('Auth check error:', error);
    chrome.runtime.sendMessage({ 
      type: 'AUTH_STATUS', 
      isAuthenticated: false,
      error: error.message
    }).catch(err => console.error('Error sending AUTH_STATUS message:', err));
  });
}

// Open the side panel when the extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

// Initialize the extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Chatbot extension installed');
}); 