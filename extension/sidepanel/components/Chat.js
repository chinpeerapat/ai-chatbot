// Main Chat component
const Chat = ({ isAuthenticated }) => {
  const [messages, setMessages] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [chatId, setChatId] = React.useState(uuid.v4());
  const [streamingMessage, setStreamingMessage] = React.useState(null);
  const messagesEndRef = React.useRef(null);
  
  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);
  
  // Listen for message chunks from the background script
  React.useEffect(() => {
    const handleMessage = (message) => {
      if (message.type === 'STREAM_CHUNK') {
        try {
          // Parse the chunk data
          const lines = message.data.split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              
              if (data === '[DONE]') {
                // End of stream
                if (streamingMessage) {
                  setMessages(prev => [...prev, streamingMessage]);
                  setStreamingMessage(null);
                }
                setIsLoading(false);
                continue;
              }
              
              try {
                const parsed = JSON.parse(data);
                
                if (parsed.type === 'text') {
                  setStreamingMessage(prev => {
                    if (!prev) {
                      return {
                        id: uuid.v4(),
                        role: 'assistant',
                        content: parsed.text,
                        createdAt: new Date().toISOString()
                      };
                    }
                    return {
                      ...prev,
                      content: prev.content + parsed.text
                    };
                  });
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
        if (streamingMessage) {
          setMessages(prev => [...prev, streamingMessage]);
          setStreamingMessage(null);
        }
        setIsLoading(false);
      } else if (message.type === 'API_ERROR') {
        console.error('API error:', message.error);
        setIsLoading(false);
      }
    };
    
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, [streamingMessage]);
  
  const handleSubmit = (input) => {
    const userMessage = {
      id: uuid.v4(),
      role: 'user',
      content: input,
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Send message to background script for API call
    chrome.runtime.sendMessage({
      type: 'CHAT_REQUEST',
      id: chatId,
      messages: [...messages, userMessage],
      selectedChatModel: 'default-model' // You can make this configurable
    });
  };
  
  // If not authenticated, show login message
  if (!isAuthenticated) {
    return (
      <div className="auth-message">
        <p>Please log in to use the AI Chatbot.</p>
        <a href="http://localhost:3000/login" target="_blank">Log in</a>
      </div>
    );
  }
  
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>AI Chatbot</h1>
      </div>
      
      <div className="messages-container">
        {messages.map(message => (
          <Message key={message.id} message={message} />
        ))}
        
        {streamingMessage && (
          <Message message={streamingMessage} />
        )}
        
        {isLoading && !streamingMessage && (
          <div className="loading-indicator">
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}; 