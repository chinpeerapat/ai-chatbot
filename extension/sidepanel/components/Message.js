// Message component for displaying chat messages
function createMessageElement(message, onVote) {
  const { id, role, content, createdAt } = message;
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
  messageElement.setAttribute('data-message-id', id);
  
  // Create content element
  const contentElement = document.createElement('div');
  contentElement.className = 'message-content';
  contentElement.textContent = content;
  messageElement.appendChild(contentElement);
  
  // Create footer container
  const footerElement = document.createElement('div');
  footerElement.className = 'message-footer';
  footerElement.style.display = 'flex';
  footerElement.style.justifyContent = 'space-between';
  footerElement.style.alignItems = 'center';
  footerElement.style.marginTop = '8px';
  
  // Create timestamp element if createdAt exists
  if (createdAt) {
    const timestampElement = document.createElement('div');
    timestampElement.className = 'message-timestamp';
    timestampElement.textContent = formatTimestamp(createdAt);
    footerElement.appendChild(timestampElement);
  }
  
  // Only add voting buttons for assistant messages
  if (!isUser && onVote) {
    const votesElement = document.createElement('div');
    votesElement.className = 'message-votes';
    
    // Thumbs up button
    const upButton = document.createElement('button');
    upButton.className = 'vote-button vote-up';
    upButton.setAttribute('aria-label', 'Thumbs up');
    upButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    upButton.addEventListener('click', () => onVote(id, 'up'));
    
    // Thumbs down button
    const downButton = document.createElement('button');
    downButton.className = 'vote-button vote-down';
    downButton.setAttribute('aria-label', 'Thumbs down');
    downButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    downButton.addEventListener('click', () => onVote(id, 'down'));
    
    votesElement.appendChild(upButton);
    votesElement.appendChild(downButton);
    footerElement.appendChild(votesElement);
  }
  
  messageElement.appendChild(footerElement);
  
  return messageElement;
}