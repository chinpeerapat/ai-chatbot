# AI Chatbot Chrome Extension

This Chrome extension provides a convenient way to access the AI Chatbot directly from your browser's side panel.

## Features

- Access the AI Chatbot from any webpage
- Chat with the AI assistant in the side panel
- Seamless integration with the main AI Chatbot application

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" by toggling the switch in the top right corner
3. Click "Load unpacked" and select the `extension` directory
4. The extension should now be installed and visible in your Chrome toolbar

## Usage

1. Make sure you're logged in to the main AI Chatbot application at https://web.goodboy.chat
2. Click the extension icon in your Chrome toolbar to open the popup
3. Click "Open Side Panel" to open the chatbot in the side panel
4. You can now chat with the AI assistant while browsing any website

## Development

### Structure

```
extension/
├── manifest.json           # Extension configuration
├── background.js           # Background script for handling API calls
├── popup/                  # Popup UI (minimal)
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
└── sidepanel/              # Main UI in the sidepanel
    ├── sidepanel.html
    ├── sidepanel.js
    ├── sidepanel.css
    └── components/         # React components for the sidepanel
        ├── Chat.js
        ├── ChatInput.js
        └── Message.js
```

### API Integration

The extension communicates with the main AI Chatbot application's API endpoints:

- `/api/chat` - For sending and receiving chat messages
- `/api/auth/session` - For checking authentication status

### Authentication

The extension uses cookies for authentication, so you need to be logged in to the main application for the extension to work properly.

## Customization

You can customize the extension by:

1. Adding your own icons in the `assets/icons` directory
2. Modifying the UI components in the `sidepanel/components` directory
3. Changing the API endpoints in `background.js` if your server is running on a different URL 