// Main Chat component
function createChatInterface(rootElement, isAuthenticated) {
  // Clear the root element
  rootElement.innerHTML = '';
  
  // If not authenticated, show login message
  if (!isAuthenticated) {
    const authMessage = document.createElement('div');
    authMessage.className = 'auth-message';
    
    const messageText = document.createElement('p');
    messageText.textContent = 'Please log in to use the AI Chatbot.';
    
    const loginButton = document.createElement('button');
    loginButton.textContent = 'Log in';
    loginButton.addEventListener('click', function() {
      chrome.runtime.sendMessage({ type: 'OPEN_LOGIN_PAGE' });
    });
    
    authMessage.appendChild(messageText);
    authMessage.appendChild(loginButton);
    
    rootElement.appendChild(authMessage);
    return;
  }
  
  // Chat state
  const state = {
    messages: [],
    isLoading: false,
    chatId: uuid.v4(),
    streamingMessage: null
  };
  
  // Create chat container
  const chatContainer = document.createElement('div');
  chatContainer.className = 'chat-container';
  
  // Create chat header
  const chatHeader = document.createElement('div');
  chatHeader.className = 'chat-header';
  
  const headerTitle = document.createElement('h1');
  headerTitle.textContent = 'AI Chatbot';
  chatHeader.appendChild(headerTitle);
  
  // Create messages container
  const messagesContainer = document.createElement('div');
  messagesContainer.className = 'messages-container';
  
  // Create loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'loading-indicator';
  loadingIndicator.innerHTML = `
    <div class="loading-dots">
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
    </div>
  `;
  loadingIndicator.style.display = 'none';
  
  // Add components to chat container
  chatContainer.appendChild(chatHeader);
  chatContainer.appendChild(messagesContainer);
  
  // Handle message submission
  const handleSubmit = (input) => {
    // Create user message
    const userMessage = {
      id: uuid.v4(),
      role: 'user',
      content: input,
      createdAt: new Date().toISOString()
    };
    
    // Add message to state and UI
    state.messages.push(userMessage);
    messagesContainer.appendChild(createMessageElement(userMessage));
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Set loading state
    state.isLoading = true;
    loadingIndicator.style.display = 'flex';
    
    // Send message to background script for API call
    chrome.runtime.sendMessage({
      type: 'CHAT_REQUEST',
      id: state.chatId,
      messages: state.messages,
      selectedChatModel: 'default-model' // You can make this configurable
    });
  };
  
  // Create chat input
  const chatInput = createChatInputElement(handleSubmit, state.isLoading);
  
  // Add loading indicator and chat input to container
  messagesContainer.appendChild(loadingIndicator);
  chatContainer.appendChild(chatInput);
  
  // Add chat container to root
  rootElement.appendChild(chatContainer);
  
  // Listen for message chunks from the background script
  const messageHandler = (message) => {
    if (message.type === 'STREAM_CHUNK') {
      try {
        // Parse the chunk data
        const lines = message.data.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            
            if (data === '[DONE]') {
              // End of stream
              if (state.streamingMessage) {
                state.messages.push(state.streamingMessage);
                state.streamingMessage = null;
              }
              state.isLoading = false;
              loadingIndicator.style.display = 'none';
              continue;
            }
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'text') {
                if (!state.streamingMessage) {
                  // Create new streaming message
                  state.streamingMessage = {
                    id: uuid.v4(),
                    role: 'assistant',
                    content: parsed.text,
                    createdAt: new Date().toISOString()
                  };
                  
                  // Add streaming message element
                  const streamingElement = createMessageElement(state.streamingMessage);
                  streamingElement.id = 'streaming-message';
                  messagesContainer.appendChild(streamingElement);
                } else {
                  // Update existing streaming message
                  state.streamingMessage.content += parsed.text;
                  
                  // Update streaming message element
                  const streamingElement = document.getElementById('streaming-message');
                  if (streamingElement) {
                    const contentElement = streamingElement.querySelector('.message-content');
                    if (contentElement) {
                      contentElement.textContent = state.streamingMessage.content;
                    }
                  }
                }
                
                // Scroll to bottom
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
              }
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
          }
        }
      } catch (e) {
        console.error('Error processing stream chunk:', e);
      }
    } else if (message.type === 'STREAM_DONE') {
      // End of stream
      if (state.streamingMessage) {
        state.messages.push(state.streamingMessage);
        
        // Replace streaming element with final message
        const streamingElement = document.getElementById('streaming-message');
        if (streamingElement) {
          const finalElement = createMessageElement(state.streamingMessage);
          messagesContainer.replaceChild(finalElement, streamingElement);
        }
        
        state.streamingMessage = null;
      }
      
      state.isLoading = false;
      loadingIndicator.style.display = 'none';
    } else if (message.type === 'API_ERROR') {
      console.error('API error:', message.error);
      state.isLoading = false;
      loadingIndicator.style.display = 'none';
      
      // Show error message
      const errorMessage = {
        id: uuid.v4(),
        role: 'assistant',
        content: `Error: ${message.error}. Please try again.`,
        createdAt: new Date().toISOString()
      };
      
      messagesContainer.appendChild(createMessageElement(errorMessage));
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };
  
  chrome.runtime.onMessage.addListener(messageHandler);
  
  // Return a cleanup function
  return () => {
    chrome.runtime.onMessage.removeListener(messageHandler);
  };
} 