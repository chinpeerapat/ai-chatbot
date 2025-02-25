// Message component for displaying chat messages
const Message = ({ message }) => {
  const { role, content, createdAt } = message;
  const isUser = role === 'user';
  const messageClass = isUser ? 'message message-user' : 'message message-assistant';
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className={messageClass}>
      <div className="message-content">{content}</div>
      {createdAt && (
        <div className="message-timestamp">{formatTimestamp(createdAt)}</div>
      )}
    </div>
  );
}; 