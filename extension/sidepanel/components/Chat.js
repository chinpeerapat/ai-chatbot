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
    streamingMessage: null,
    userVotes: {}
  };
  
  // Create chat container
  const chatContainer = document.createElement('div');
  chatContainer.className = 'chat-container';
  
  // Create chat header
  const chatHeader = document.createElement('div');
  chatHeader.className = 'chat-header';
  
  const headerLogo = document.createElement('div');
  headerLogo.className = 'header-logo';
  headerLogo.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 16V12" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 8H12.01" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  
  const headerTitle = document.createElement('h1');
  headerTitle.textContent = 'AI Chatbot';
  
  chatHeader.appendChild(headerLogo);
  chatHeader.appendChild(headerTitle);
  
  // Create messages container
  const messagesContainer = document.createElement('div');
  messagesContainer.className = 'messages-container';
  
  // Add welcome message
  const welcomeMessage = {
    id: uuid.v4(),
    role: 'assistant',
    content: 'Hello! How can I help you today?',
    createdAt: new Date().toISOString()
  };
  
  state.messages.push(welcomeMessage);
  messagesContainer.appendChild(createMessageElement(welcomeMessage, handleVote));
  
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
  
  // Handle vote function
  function handleVote(messageId, voteType) {
    if (state.isLoading) return;
    
    // Only allow voting on assistant messages
    const message = state.messages.find(m => m.id === messageId);
    if (!message || message.role !== 'assistant') return;
    
    // Toggle vote if already voted the same way
    if (state.userVotes[messageId] === voteType) {
      // Cancel the vote (not implemented in API)
      return;
    }
    
    // Send vote to background script
    chrome.runtime.sendMessage({
      type: 'VOTE_MESSAGE',
      chatId: state.chatId,
      messageId: messageId,
      voteType: voteType
    });
    
    // Update UI immediately
    state.userVotes[messageId] = voteType;
    
    // Update vote buttons
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
      const upButton = messageElement.querySelector('.vote-up');
      const downButton = messageElement.querySelector('.vote-down');
      
      if (upButton) upButton.classList.toggle('active', voteType === 'up');
      if (downButton) downButton.classList.toggle('active', voteType === 'down');
    }
  }
  
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
    }, function(response) {
      console.log('Received response from CHAT_REQUEST:', response);
      // We don't need to do anything with the response, just ensuring the callback is provided
    });
  };
  
  // Create chat input
  const chatInput = createChatInputElement(handleSubmit, state.isLoading);
  
  // Add loading indicator and chat input to container
  messagesContainer.appendChild(loadingIndicator);
  chatContainer.appendChild(chatInput);
  
  // Add chat container to root
  rootElement.appendChild(chatContainer);
  
  // Simplified function to handle artifact links
  function handleArtifactLink(artifactId, artifactTitle, artifactType) {
    // Create artifact link element
    const artifactLink = document.createElement('div');
    artifactLink.className = 'artifact-link';
    
    // Add icon based on artifact type
    let icon = '';
    switch (artifactType) {
      case 'code':
        icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 18L22 12L16 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 6L2 12L8 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        break;
      case 'document':
      default:
        icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10 9H9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
    }
    
    artifactLink.innerHTML = `
      <div class="artifact-icon">${icon}</div>
      <div class="artifact-info">
        <div class="artifact-title">${artifactTitle || 'Untitled Artifact'}</div>
        <div class="artifact-type">${artifactType || 'Document'}</div>
      </div>
      <button class="open-artifact-button">Open in App</button>
    `;
    
    // Add event listener to open button
    const openButton = artifactLink.querySelector('.open-artifact-button');
    openButton.addEventListener('click', () => {
      chrome.runtime.sendMessage({
        type: 'OPEN_ARTIFACT',
        artifactId: artifactId
      });
    });
    
    // Add to streaming message if it exists, otherwise to the last message
    const targetMessage = document.getElementById('streaming-message') || 
                        document.querySelector('.message:last-child');
    
    if (targetMessage) {
      const contentElement = targetMessage.querySelector('.message-content');
      if (contentElement) {
        contentElement.appendChild(artifactLink);
      }
    }
  }
  
  // Helper function to handle text chunks
  function handleTextChunk(text) {
    if (!text) return;
    
    console.log('Handling text chunk:', text);
    
    if (!state.streamingMessage) {
      // Create new streaming message
      state.streamingMessage = {
        id: uuid.v4(),
        role: 'assistant',
        content: text,
        createdAt: new Date().toISOString()
      };
      
      // Add streaming message element
      const streamingElement = createMessageElement(state.streamingMessage);
      streamingElement.id = 'streaming-message';
      messagesContainer.appendChild(streamingElement);
    } else {
      // Update existing streaming message
      state.streamingMessage.content += text;
      
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
  
  // Message handler
  const messageHandler = (message) => {
    console.log('Received message in chat UI:', message.type, message);
    
    if (message.type === 'STREAM_CHUNK') {
      try {
        handleTextChunk(message.data);
      } catch (error) {
        console.error('Error handling text chunk:', error);
      }
    } else if (message.type === 'STREAM_DONE') {
      // Handle stream completion
      if (state.streamingMessage) {
        state.messages.push(state.streamingMessage);
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
  
  // Add message listener
  chrome.runtime.onMessage.addListener(messageHandler);
  
  // Return cleanup function
  return () => {
    chrome.runtime.onMessage.removeListener(messageHandler);
  };
}