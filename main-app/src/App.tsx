import { useState, useEffect } from 'react';
import { FlexWorkspace } from './components/FlexWorkspace';
import { eventBus } from './utils/bus';
import './App.css';

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customAppName, setCustomAppName] = useState('');
  const [customAppUrl, setCustomAppUrl] = useState('');

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
      name: 'sub-app-demo',
      entry: 'http://localhost:5174', // Default sub-app port
    });
    setShowAddMenu(false);
  };

  const loadCustomApp = () => {
    if (customAppName && customAppUrl) {
      let finalUrl = customAppUrl;
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = 'http://' + finalUrl;
      }
      eventBus.emit('add-panel', {
        name: customAppName,
        entry: finalUrl,
      });
      setShowCustomModal(false);
      setCustomAppName('');
      setCustomAppUrl('');
    }
  };

  const broadcastMessage = () => {
    eventBus.emit('message', { from: 'main', text: 'Hello from Main App!' });
    setShowSettingsMenu(false);
  };

  const handleExportLayout = () => {
    eventBus.emit('export-layout');
    setShowSettingsMenu(false);
  };

  const handleImportLayout = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const jsonStr = event.target?.result as string;
      eventBus.emit('import-layout', jsonStr);
    };
    reader.readAsText(file);
    setShowSettingsMenu(false);
    // reset input
    e.target.value = null;
  };

  return (
    <div className="app-container">
      <header className="top-menu">
        <div className="menu-left">
          <span className="logo">Swarm Viewer</span>
          
          <div 
            className="menu-item"
            onMouseEnter={() => setShowAddMenu(true)}
            onMouseLeave={() => setShowAddMenu(false)}
          >
            Add
            {showAddMenu && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={loadSubAppDemo}>Demo Sub App</div>
                <div className="dropdown-item" onClick={() => { setShowCustomModal(true); setShowAddMenu(false); }}>Custom App...</div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item disabled">Recent...</div>
              </div>
            )}
          </div>

          <div 
            className="menu-item"
            onMouseEnter={() => setShowSettingsMenu(true)}
            onMouseLeave={() => setShowSettingsMenu(false)}
          >
            Settings
            {showSettingsMenu && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={handleExportLayout}>Export Layout</div>
                <label className="dropdown-item">
                  Import Layout
                  <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportLayout} />
                </label>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item" onClick={broadcastMessage}>Broadcast Event</div>
              </div>
            )}
          </div>

        </div>
        <div className="menu-messages">
          {messages.length > 0 && <span className="latest-msg">{messages[messages.length - 1]}</span>}
        </div>
      </header>

      {/* Custom App Modal */}
      {showCustomModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Custom Sub App</h3>
            <div className="form-group">
              <label>App Name:</label>
              <input value={customAppName} onChange={e => setCustomAppName(e.target.value)} placeholder="e.g. My App" />
            </div>
            <div className="form-group">
              <label>App URL:</label>
              <input value={customAppUrl} onChange={e => setCustomAppUrl(e.target.value)} placeholder="e.g. http://localhost:3000" />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowCustomModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={loadCustomApp}>Add</button>
            </div>
          </div>
        </div>
      )}

      <main className="workspace-container">
        <FlexWorkspace />
      </main>
    </div>
  );
}

export default App;
