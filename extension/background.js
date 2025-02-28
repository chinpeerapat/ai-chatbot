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

  if (request.type === 'GET_CHAT_HISTORY') {
    console.log('Getting chat history');
    handleGetChatHistory();
    sendResponse({ status: 'Getting chat history' });
    return false;
  }

  if (request.type === 'VOTE_MESSAGE') {
    console.log('Voting on message:', request.messageId, request.voteType);
    handleVoteMessage(request.chatId, request.messageId, request.voteType);
    sendResponse({ status: 'Voting message' });
    return false;
  }

  if (request.type === 'OPEN_ARTIFACT') {
    console.log('Opening artifact in web app:', request.artifactId);
    chrome.tabs.create({ url: `${API_BASE_URL}/artifact/${request.artifactId}` });
    sendResponse({ status: 'Opening artifact' });
    return false;
  }
  
  return false; // Don't keep the channel open by default
});

function handleChatRequest(request) {
  // Ensure the model is always "chat-model-small"
  const selectedModel = "chat-model-small";
  
  console.log('Using model:', selectedModel);
  
  // Call the chat API endpoint
  fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: request.id,
      messages: request.messages,
      selectedChatModel: selectedModel // Using chat-model-small
    }),
    credentials: 'include'
  })
    
  .then(response => {
    console.log('Chat API raw response:', response);
    console.log('Chat API response status:', response.status);
    console.log('Chat API response headers:', [...response.headers]);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
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
        console.log('Raw received chunk:', chunk);
        
        // Process the lines
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          // Handle different types of messages based on prefix
          if (line.startsWith('f:')) {
            // Start of message
            console.log('Message started:', line);
            // You can extract the messageId here if needed
            continue;
          } 
          else if (line.startsWith('0:')) {
            // Message content chunk
            try {
              // Extract the actual text from the format 0:"text"
              const textMatch = line.match(/^0:"(.+)"$/);
              if (textMatch && textMatch[1]) {
                const textContent = textMatch[1];
                console.log('Message content:', textContent);
                
                // Send just the text content to the UI
                chrome.runtime.sendMessage({ 
                  type: 'STREAM_CHUNK', 
                  data: textContent
                }).catch(err => {
                  console.error('Error sending STREAM_CHUNK message:', err);
                });
              } else {
                console.log('Could not extract text from line:', line);
              }
            } catch (err) {
              console.error('Error processing message chunk:', err);
            }
            continue;
          }
          else if (line.startsWith('e:') || line.startsWith('d:')) {
            // End of message
            console.log('Message ended:', line);
            continue;
          }
          else {
            // Unknown format, try to pass it as is
            console.log('Unknown format line:', line);
            chrome.runtime.sendMessage({ 
              type: 'STREAM_CHUNK', 
              data: line
            }).catch(err => {
              console.error('Error sending unknown format chunk:', err);
            });
          }
        }
        
        readStream();
      }).catch(err => {
        console.error('Error reading stream:', err);
        chrome.runtime.sendMessage({ 
          type: 'API_ERROR', 
          error: 'Error reading response stream: ' + err.message
        }).catch(err => console.error('Error sending API_ERROR message:', err));
      });
    }
    
    readStream();
  })
  .catch(error => {
    console.error('Chat API error details:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
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

// Get chat history
function handleGetChatHistory() {
  fetch(`${API_BASE_URL}/api/history`, {
    credentials: 'include'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    chrome.runtime.sendMessage({
      type: 'CHAT_HISTORY',
      history: data
    }).catch(err => console.error('Error sending CHAT_HISTORY message:', err));
  })
  .catch(error => {
    console.error('Chat history error:', error);
    chrome.runtime.sendMessage({
      type: 'API_ERROR',
      error: error.message
    }).catch(err => console.error('Error sending API_ERROR message:', err));
  });
}

// Vote on a message
function handleVoteMessage(chatId, messageId, voteType) {
  fetch(`${API_BASE_URL}/api/vote`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chatId,
      messageId,
      type: voteType // 'up' or 'down'
    }),
    credentials: 'include'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    chrome.runtime.sendMessage({
      type: 'VOTE_CONFIRMED',
      chatId,
      messageId,
      voteType
    }).catch(err => console.error('Error sending VOTE_CONFIRMED message:', err));
  })
  .catch(error => {
    console.error('Vote message error:', error);
    chrome.runtime.sendMessage({
      type: 'API_ERROR',
      error: error.message
    }).catch(err => console.error('Error sending API_ERROR message:', err));
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