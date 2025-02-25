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
  messagesContainer.appendChild(createMessageElement(welcomeMessage));
  
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
  
  // Listen for message chunks from the background script
  const messageHandler = (message) => {
    console.log('Received message:', message.type, message);
    
    if (message.type === 'STREAM_CHUNK') {
      try {
        // Parse the chunk data
        console.log('Processing stream chunk:', message.data);
        const lines = message.data.split('\n').filter(line => line.trim() !== '');
        console.log('Parsed lines:', lines);
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            console.log('Processing data:', data);
            
            if (data === '[DONE]') {
              // End of stream
              console.log('Stream done');
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
              console.log('Parsed JSON:', parsed);
              
              // Handle different response formats
              if (parsed.type === 'text') {
                // Standard format
                handleTextChunk(parsed.text);
              } else if (parsed.choices && parsed.choices.length > 0) {
                // OpenAI-like format
                const content = parsed.choices[0].delta?.content || parsed.choices[0].message?.content;
                if (content) {
                  handleTextChunk(content);
                }
              } else if (parsed.text || parsed.content) {
                // Alternative formats
                handleTextChunk(parsed.text || parsed.content);
              }
            } catch (e) {
              console.error('Error parsing JSON:', e, 'Data:', data);
            }
          } else {
            // Try to parse the line directly if it's not in the expected format
            try {
              const parsed = JSON.parse(line);
              console.log('Parsed direct JSON:', parsed);
              
              if (parsed.type === 'text' || parsed.text || parsed.content) {
                handleTextChunk(parsed.text || parsed.content || (parsed.type === 'text' ? parsed.text : ''));
              } else if (parsed.choices && parsed.choices.length > 0) {
                const content = parsed.choices[0].delta?.content || parsed.choices[0].message?.content;
                if (content) {
                  handleTextChunk(content);
                }
              }
            } catch (e) {
              console.log('Line is not JSON:', line);
            }
          }
        }
      } catch (e) {
        console.error('Error processing stream chunk:', e);
      }
    } else if (message.type === 'STREAM_DONE') {
      // End of stream
      console.log('Stream done message received');
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
  
  chrome.runtime.onMessage.addListener(messageHandler);
  
  // Return a cleanup function
  return () => {
    chrome.runtime.onMessage.removeListener(messageHandler);
  };
} 