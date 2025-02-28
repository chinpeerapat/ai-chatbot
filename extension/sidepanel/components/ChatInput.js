// ChatInput component for user input
function createChatInputElement(onSubmit, isLoading) {
  // Create container
  const container = document.createElement('div');
  container.className = 'input-container';
  
  // Create form
  const form = document.createElement('form');
  form.className = 'input-form';
  
  // Create textarea
  const textarea = document.createElement('textarea');
  textarea.className = 'input-textarea';
  textarea.placeholder = 'Type your message...';
  textarea.disabled = isLoading;
  textarea.rows = 1;
  
  // Create send button with icon
  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'send-button';
  button.disabled = true;
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  
  // Add elements to form
  form.appendChild(textarea);
  form.appendChild(button);
  
  // Add form to container
  container.appendChild(form);
  
  // Auto-resize textarea
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    
    // Enable/disable button based on input
    button.disabled = !textarea.value.trim() || isLoading;
  });
  
  // Handle Enter key to submit (Shift+Enter for new line)
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (textarea.value.trim() && !isLoading) {
        const input = textarea.value;
        textarea.value = '';
        textarea.style.height = 'auto';
        onSubmit(input);
      }
    }
  });
  
  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (textarea.value.trim() && !isLoading) {
      const input = textarea.value;
      textarea.value = '';
      textarea.style.height = 'auto';
      onSubmit(input);
    }
  });
  
  // Update button state based on loading status
  const updateLoadingState = (loading) => {
    textarea.disabled = loading;
    button.disabled = loading || !textarea.value.trim();
  };
  
  // Expose method to update loading state
  container.updateLoadingState = updateLoadingState;
  
  return container;
}