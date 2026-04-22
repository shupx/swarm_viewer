import { useState, useEffect } from "react";
import { FlexWorkspace } from "./components/FlexWorkspace";
import { resolveHubProps } from "./defaults";
import { getRouteValue, resolvePageRelativeRouteUrl } from "./utils/path";
import "./App.css";

import type { CustomSourceMode, MicroPanelHubProps } from "./types";

const getDefaultCustomAppValue = (mode: CustomSourceMode, defaultRelativeRoute: string) =>
  mode === "absolute-url"
    ? resolvePageRelativeRouteUrl(defaultRelativeRoute)
    : getRouteValue(defaultRelativeRoute);

function App(props: MicroPanelHubProps) {
  const {
    title,
    defaultPanels,
    defaultCustomAppName,
    defaultRelativeRoute,
    storageKey,
    eventBus,
    className,
  } = resolveHubProps(props);
  const [messages, setMessages] = useState<string[]>([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customAppName, setCustomAppName] = useState(defaultCustomAppName);
  const [customAppUrl, setCustomAppUrl] = useState(
    getDefaultCustomAppValue("page-relative-route", defaultRelativeRoute),
  );
  const [customSourceMode, setCustomSourceMode] =
    useState<CustomSourceMode>("page-relative-route");
  const defaultPanel = defaultPanels[0];

  useEffect(() => {
    const handler = (msg: unknown) => {
      setMessages((prev) =>
        [...prev, `${new Date().toLocaleTimeString()} - ${JSON.stringify(msg)}`].slice(-5),
      );
    };
    eventBus.on("message", handler);
    return () => {
      eventBus.off("message", handler);
    };
  }, [eventBus]);

  const loadDefaultPanel = () => {
    if (!defaultPanel) return;

    eventBus.emit("add-panel", {
      name: defaultPanel.name,
      source: defaultPanel.source,
      entry: defaultPanel.entry,
    });
    setShowAddMenu(false);
  };

  const loadCustomApp = () => {
    if (customAppName && customAppUrl) {
      eventBus.emit("add-panel", {
        name: customAppName,
        source: {
          type: customSourceMode,
          value: customAppUrl.trim(),
        },
      });
      setShowCustomModal(false);
      setCustomAppName(defaultCustomAppName);
      setCustomAppUrl(getDefaultCustomAppValue("page-relative-route", defaultRelativeRoute));
      setCustomSourceMode("page-relative-route");
    }
  };

  const openCustomModal = () => {
    const defaultMode: CustomSourceMode = "page-relative-route";
    setCustomAppName(defaultCustomAppName);
    setCustomSourceMode(defaultMode);
    setCustomAppUrl(getDefaultCustomAppValue(defaultMode, defaultRelativeRoute));
    setShowCustomModal(true);
    setShowAddMenu(false);
  };

  const handleCustomSourceModeChange = (mode: CustomSourceMode) => {
    setCustomSourceMode(mode);
    setCustomAppUrl(getDefaultCustomAppValue(mode, defaultRelativeRoute));
  };

  const broadcastMessage = () => {
    eventBus.emit("message", { from: "main", text: "Hello from Micro Panel Hub!" });
    setShowSettingsMenu(false);
  };

  const handleExportLayout = () => {
    eventBus.emit("export-layout");
    setShowSettingsMenu(false);
  };

  const handleImportLayout = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const jsonStr = event.target?.result as string;
      eventBus.emit("import-layout", jsonStr);
    };
    reader.readAsText(file);
    setShowSettingsMenu(false);
    e.target.value = '';
  };

  return (
    <div className={`app-container ${className}`.trim()}>
      <header className="top-menu">
        <div className="menu-left">
          <span className="logo">{title}</span>
          
          <div 
            className="menu-item"
            onMouseEnter={() => setShowAddMenu(true)}
            onMouseLeave={() => setShowAddMenu(false)}
          >
            Add
            {showAddMenu && (
              <div className="dropdown-menu">
                {defaultPanel && (
                  <div className="dropdown-item" onClick={loadDefaultPanel}>{defaultPanel.name}</div>
                )}
                <div className="dropdown-item" onClick={openCustomModal}>Custom App...</div>
                {defaultPanel && <div className="dropdown-divider"></div>}
                {defaultPanel && <div className="dropdown-item disabled">Recent...</div>}
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
                  checked={customSourceMode === 'site-relative-route'}
                  onChange={() => handleCustomSourceModeChange('site-relative-route')}
                />
                Site Relative
              </label>
              <label className="source-mode-option">
                <input
                  type="radio"
                  name="custom-source-mode"
                  checked={customSourceMode === 'page-relative-route'}
                  onChange={() => handleCustomSourceModeChange('page-relative-route')}
                />
                Page Relative
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
        <FlexWorkspace
          title={title}
          storageKey={storageKey}
          layoutDownloadName="micro-panel-hub-layout.json"
          eventBus={eventBus}
        />
      </main>
    </div>
  );
}

export default App;
