import { useState, useEffect } from 'react';
import { FlexWorkspace } from './components/FlexWorkspace';
import { eventBus } from './utils/bus';
import './App.css';

type CustomSourceMode = 'absolute-url' | 'relative-route';

const DEFAULT_CUSTOM_APP_NAME = 'MyApp';
const getDefaultCustomAppValue = (mode: CustomSourceMode) =>
  mode === 'relative-route' ? '/sub-app-demo/' : `${window.location.origin}/sub-app-demo/`;

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customAppName, setCustomAppName] = useState(DEFAULT_CUSTOM_APP_NAME);
  const [customAppUrl, setCustomAppUrl] = useState(getDefaultCustomAppValue('relative-route'));
  const [customSourceMode, setCustomSourceMode] = useState<CustomSourceMode>('relative-route');

  // Listen to bus messages
  useEffect(() => {
    const handler = (msg: unknown) => {
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
      source: {
        type: 'relative-route',
        value: '/sub-app-demo/',
      },
    });
    setShowAddMenu(false);
  };

  const loadCustomApp = () => {
    if (customAppName && customAppUrl) {
      eventBus.emit('add-panel', {
        name: customAppName,
        source: {
          type: customSourceMode,
          value: customAppUrl.trim(),
        },
      });
      setShowCustomModal(false);
      setCustomAppName(DEFAULT_CUSTOM_APP_NAME);
      setCustomAppUrl(getDefaultCustomAppValue('relative-route'));
      setCustomSourceMode('relative-route');
    }
  };

  const openCustomModal = () => {
    const defaultMode: CustomSourceMode = 'relative-route';
    setCustomAppName(DEFAULT_CUSTOM_APP_NAME);
    setCustomSourceMode(defaultMode);
    setCustomAppUrl(getDefaultCustomAppValue(defaultMode));
    setShowCustomModal(true);
    setShowAddMenu(false);
  };

  const handleCustomSourceModeChange = (mode: CustomSourceMode) => {
    setCustomSourceMode(mode);
    setCustomAppUrl(getDefaultCustomAppValue(mode));
  };

  const broadcastMessage = () => {
    eventBus.emit('message', { from: 'main', text: 'Hello from Main App!' });
    setShowSettingsMenu(false);
  };

  const handleExportLayout = () => {
    eventBus.emit('export-layout');
    setShowSettingsMenu(false);
  };

  const handleImportLayout = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    e.target.value = '';
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
                <div className="dropdown-item" onClick={openCustomModal}>Custom App...</div>
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
            <div className="source-mode-group">
              <label className="source-mode-option">
                <input
                  type="radio"
                  name="custom-source-mode"
                  checked={customSourceMode === 'absolute-url'}
                  onChange={() => handleCustomSourceModeChange('absolute-url')}
                />
                Absolute URL
              </label>
              <label className="source-mode-option">
                <input
                  type="radio"
                  name="custom-source-mode"
                  checked={customSourceMode === 'relative-route'}
                  onChange={() => handleCustomSourceModeChange('relative-route')}
                />
                Relative Route
              </label>
            </div>
            <div className="form-group">
              <label>App Name:</label>
              <input value={customAppName} onChange={e => setCustomAppName(e.target.value)} placeholder="e.g. My App" />
            </div>
            <div className="form-group">
              <label>{customSourceMode === 'absolute-url' ? 'App URL:' : 'App Route:'}</label>
              <input
                value={customAppUrl}
                onChange={e => setCustomAppUrl(e.target.value)}
                placeholder={customSourceMode === 'absolute-url' ? 'e.g. http://localhost:5173/sub-app-demo/' : 'e.g. /sub-app-demo/'}
              />
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
