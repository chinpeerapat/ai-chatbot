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
  
  // Create send button
  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'send-button';
  button.textContent = 'Send';
  button.disabled = true;
  
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
  
  return container;
} 