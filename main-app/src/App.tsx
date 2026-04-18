import { useState, useEffect } from 'react';
import { FlexWorkspace } from './components/FlexWorkspace';
import { eventBus } from './utils/bus';
import './App.css';

function App() {
  const [messages, setMessages] = useState<string[]>([]);

  // Listen to bus messages
  useEffect(() => {
    const handler = (msg: any) => {
      setMessages((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${JSON.stringify(msg)}`].slice(-5));
    };
    eventBus.on('message', handler);
    return () => {
      eventBus.off('message', handler);
    };
  }, []);

  const loadSubAppDemo = () => {
    eventBus.emit('add-panel', {
      name: 'Demo App',
      entry: 'http://localhost:5174', // Default sub-app port
    });
  };

  const broadcastMessage = () => {
    eventBus.emit('message', { from: 'main', text: 'Hello from Main App!' });
  };

  return (
    <div className="app-container">
      <header className="top-menu">
        <div className="menu-left">
          <span className="logo">Swarm Viewer</span>
          <button onClick={loadSubAppDemo}>Add Sub-App Demo</button>
          <button onClick={broadcastMessage}>Broadcast Event</button>
        </div>
        <div className="menu-messages">
          {messages.length > 0 && <span className="latest-msg">{messages[messages.length - 1]}</span>}
        </div>
      </header>
      <main className="workspace-container">
        <FlexWorkspace />
      </main>
    </div>
  );
}

export default App;
