// Message component for displaying chat messages
function createMessageElement(message) {
  const { role, content, createdAt } = message;
  const isUser = role === 'user';
  const messageClass = isUser ? 'message message-user' : 'message message-assistant';
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Create message element
  const messageElement = document.createElement('div');
  messageElement.className = messageClass;
  
  // Create content element
  const contentElement = document.createElement('div');
  contentElement.className = 'message-content';
  contentElement.textContent = content;
  messageElement.appendChild(contentElement);
  
  // Create timestamp element if createdAt exists
  if (createdAt) {
    const timestampElement = document.createElement('div');
    timestampElement.className = 'message-timestamp';
    timestampElement.textContent = formatTimestamp(createdAt);
    messageElement.appendChild(timestampElement);
  }
  
  return messageElement;
} 