// Main sidepanel script
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const [user, setUser] = React.useState(null);
  
  // Check authentication status on load
  React.useEffect(() => {
    chrome.runtime.sendMessage({ type: 'CHECK_AUTH' });
    
    const handleMessage = (message) => {
      if (message.type === 'AUTH_STATUS') {
        setIsAuthenticated(message.isAuthenticated);
        if (message.user) {
          setUser(message.user);
        }
        setIsCheckingAuth(false);
      }
    };
    
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);
  
  if (isCheckingAuth) {
    return (
      <div className="loading-indicator">
        <div className="loading-dots">
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
        </div>
      </div>
    );
  }
  
  return <Chat isAuthenticated={isAuthenticated} user={user} />;
};

// Render the app
ReactDOM.render(<App />, document.getElementById('root')); 