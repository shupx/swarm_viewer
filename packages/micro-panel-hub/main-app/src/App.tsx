import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { FlexWorkspace } from "./components/FlexWorkspace";
import {
  DEFAULT_LAYOUT_DOWNLOAD_NAME,
  resolveHubProps,
} from "./defaults";
import { getRouteValue, resolvePageRelativeRouteUrl } from "./utils/path";
import { getPanelDefinitionIdentity, normalizePanelDefinition } from "./utils/panels";
import {
  createDefaultLayoutConfig,
  isLayoutJsonConfig,
  normalizeLayoutJson,
} from "./utils/workspace";
import "./App.css";

import type {
  CustomSourceMode,
  MicroPanelDefinition,
  MicroPanelHubHandle,
  MicroPanelHubProps,
} from "./types";
import type {
  MicroPanelHubShellLayout as ShellState,
  MicroPanelHubWorkspaceTab as WorkspaceTabState,
} from "./layout-types";
import type { LayoutJsonConfig } from "./layout-types";

const getDefaultCustomAppValue = (mode: CustomSourceMode, defaultRelativeRoute: string) =>
  mode === "absolute-url"
    ? resolvePageRelativeRouteUrl(defaultRelativeRoute)
    : getRouteValue(defaultRelativeRoute);

const getRecentStorageKey = (storageKey: string) => `${storageKey}__recent_panels`;
const SHELL_STATE_VERSION = 2;

const sanitizeRecentPanels = (
  panels: unknown,
  limit: number,
): MicroPanelDefinition[] => {
  if (limit <= 0) return [];
  if (!Array.isArray(panels)) return [];

  const normalizedPanels: MicroPanelDefinition[] = [];
  const seen = new Set<string>();

  for (const panel of panels) {
    if (!panel || typeof panel !== "object") continue;

    try {
      const normalized = normalizePanelDefinition(panel as MicroPanelDefinition);
      const identity = getPanelDefinitionIdentity(normalized);
      if (seen.has(identity)) continue;
      seen.add(identity);
      normalizedPanels.push(normalized);
    } catch (error) {
      console.error("Skipping invalid recent panel entry", error);
    }

    if (normalizedPanels.length >= limit) {
      break;
    }
  }

  return normalizedPanels;
};

const loadRecentPanels = (storageKey: string, limit: number) => {
  try {
    const savedRecentPanels = localStorage.getItem(storageKey);
    const parsedPanels = savedRecentPanels ? JSON.parse(savedRecentPanels) : [];
    return sanitizeRecentPanels(parsedPanels, limit);
  } catch (error) {
    console.error("Failed to load recent panels", error);
    return [];
  }
};

const getTabNumberFromId = (id: string) => {
  const match = /^tab-(\d+)$/.exec(id);
  return match ? Number(match[1]) : 0;
};

const getDefaultTopTabTitle = (id: string) => `Tab ${Math.max(1, getTabNumberFromId(id) || 1)}`;

const getNextTopTabId = (tabs: WorkspaceTabState[]) => {
  const nextIndex = tabs.reduce((maxValue, tab) => Math.max(maxValue, getTabNumberFromId(tab.id)), 0) + 1;
  return `tab-${nextIndex}`;
};

const createWorkspaceTab = (id: string, hubTitle: string, customTitle?: string): WorkspaceTabState => ({
  id,
  title: customTitle?.trim() || getDefaultTopTabTitle(id),
  layout: createDefaultLayoutConfig(hubTitle),
});

const createDefaultShellState = (hubTitle: string): ShellState => {
  const initialTab = createWorkspaceTab("tab-1", hubTitle);

  return {
    version: SHELL_STATE_VERSION,
    topBarCollapsed: false,
    activeTopTabId: initialTab.id,
    tabs: [initialTab],
  };
};

const looksLikeShellState = (value: unknown): value is Partial<ShellState> =>
  Boolean(value && typeof value === "object" && "tabs" in value);

const normalizeShellState = (value: Partial<ShellState>, hubTitle: string): ShellState => {
  const usedIds = new Set<string>();
  const tabs = Array.isArray(value.tabs)
    ? value.tabs.reduce<WorkspaceTabState[]>((result, rawTab, index) => {
        if (!rawTab || typeof rawTab !== "object") return result;

        const candidateId =
          typeof rawTab.id === "string" && rawTab.id.trim() && !usedIds.has(rawTab.id)
            ? rawTab.id
            : `tab-${index + 1}`;
        usedIds.add(candidateId);

        const layout =
          isLayoutJsonConfig(rawTab.layout)
            ? normalizeLayoutJson(rawTab.layout)
            : createDefaultLayoutConfig(hubTitle);

        result.push({
          id: candidateId,
          title:
            typeof rawTab.title === "string" && rawTab.title.trim()
              ? rawTab.title.trim()
              : getDefaultTopTabTitle(candidateId),
          layout,
        });

        return result;
      }, [])
    : [];

  if (tabs.length === 0) {
    return createDefaultShellState(hubTitle);
  }

  const activeTopTabId =
    typeof value.activeTopTabId === "string" && tabs.some((tab) => tab.id === value.activeTopTabId)
      ? value.activeTopTabId
      : tabs[0].id;

  return {
    version: SHELL_STATE_VERSION,
    topBarCollapsed: Boolean(value.topBarCollapsed),
    activeTopTabId,
    tabs,
  };
};

const parseShellStateValue = (value: unknown, hubTitle: string): ShellState | null => {
  if (looksLikeShellState(value)) {
    return normalizeShellState(value, hubTitle);
  }

  if (isLayoutJsonConfig(value)) {
    const baseState = createDefaultShellState(hubTitle);
    return {
      ...baseState,
      tabs: [
        {
          ...baseState.tabs[0],
          layout: normalizeLayoutJson(value),
        },
      ],
    };
  }

  return null;
};

const loadShellState = (
  storageKey: string,
  hubTitle: string,
  initialLayout?: ShellState,
) => {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      return initialLayout
        ? parseShellStateValue(initialLayout, hubTitle) ?? createDefaultShellState(hubTitle)
        : createDefaultShellState(hubTitle);
    }

    const parsed = JSON.parse(saved);
    return parseShellStateValue(parsed, hubTitle) ?? createDefaultShellState(hubTitle);
  } catch (error) {
    console.error("Failed to load shell state", error);
    return initialLayout
      ? parseShellStateValue(initialLayout, hubTitle) ?? createDefaultShellState(hubTitle)
      : createDefaultShellState(hubTitle);
  }
};

const App = forwardRef<MicroPanelHubHandle, MicroPanelHubProps>(function App(props, ref) {
  const { initialLayout } = props;
  const {
    title,
    addMenu,
    defaultCustomAppName,
    defaultRelativeRoute,
    storageKey,
    eventBus,
    className,
  } = resolveHubProps(props);
  const recentStorageKey = getRecentStorageKey(storageKey);
  const [messages, setMessages] = useState<string[]>([]);
  const [shellState, setShellState] = useState<ShellState>(() =>
    loadShellState(storageKey, title, initialLayout),
  );
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [editingTopTabId, setEditingTopTabId] = useState<string | null>(null);
  const [editingTopTabTitle, setEditingTopTabTitle] = useState("");
  const [customAppName, setCustomAppName] = useState(defaultCustomAppName);
  const [customAppUrl, setCustomAppUrl] = useState(
    getDefaultCustomAppValue("page-relative-route", defaultRelativeRoute),
  );
  const [customSourceMode, setCustomSourceMode] =
    useState<CustomSourceMode>("page-relative-route");
  const [recentPanels, setRecentPanels] = useState<MicroPanelDefinition[]>(() =>
    loadRecentPanels(recentStorageKey, addMenu.recentLimit),
  );
  const activeTopTab =
    shellState.tabs.find((tab) => tab.id === shellState.activeTopTabId) ?? shellState.tabs[0];

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

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(shellState));
    } catch (error) {
      console.error("Failed to save shell state", error);
    }
  }, [shellState, storageKey]);

  useImperativeHandle(ref, () => ({
    exportLayout: () => shellState,
  }), [shellState]);

  const persistRecentPanels = (panels: MicroPanelDefinition[]) => {
    try {
      localStorage.setItem(recentStorageKey, JSON.stringify(panels));
    } catch (error) {
      console.error("Failed to save recent panels", error);
    }
  };

  const emitPanel = (panel: MicroPanelDefinition) => {
    try {
      const normalizedPanel = normalizePanelDefinition(panel);
      eventBus.emit("add-panel", normalizedPanel);
      return true;
    } catch (error) {
      console.error("Failed to add panel", error);
      alert("Invalid panel configuration");
      return false;
    }
  };

  const loadPanel = (panel: MicroPanelDefinition) => {
    if (!emitPanel(panel)) return;
    setShowAddMenu(false);
  };

  const loadCustomApp = () => {
    if (customAppName.trim() && customAppUrl.trim()) {
      const added = emitPanel({
        name: customAppName,
        source: {
          type: customSourceMode,
          value: customAppUrl.trim(),
        },
      });
      if (!added) return;
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

  const clearRecentPanels = () => {
    setRecentPanels([]);
    persistRecentPanels([]);
  };

  const removeRecentPanel = (panel: MicroPanelDefinition) => {
    setRecentPanels((prev) => {
      const targetIdentity = getPanelDefinitionIdentity(panel);
      const nextPanels = prev.filter(
        (recentPanel) => getPanelDefinitionIdentity(recentPanel) !== targetIdentity,
      );
      persistRecentPanels(nextPanels);
      return nextPanels;
    });
  };

  const handleCustomSourceModeChange = (mode: CustomSourceMode) => {
    setCustomSourceMode(mode);
    setCustomAppUrl(getDefaultCustomAppValue(mode, defaultRelativeRoute));
  };

  const toggleTopBarCollapsed = () => {
    setShellState((prev) => ({
      ...prev,
      topBarCollapsed: !prev.topBarCollapsed,
    }));
    setShowAddMenu(false);
    setShowSettingsMenu(false);
  };

  const handleCreateTopTab = () => {
    setShellState((prev) => {
      const nextId = getNextTopTabId(prev.tabs);
      const nextTab = createWorkspaceTab(nextId, title);
      return {
        ...prev,
        activeTopTabId: nextId,
        tabs: [...prev.tabs, nextTab],
      };
    });
  };

  const handleActivateTopTab = (tabId: string) => {
    setShellState((prev) => ({
      ...prev,
      activeTopTabId: tabId,
    }));
    setEditingTopTabId(null);
    setEditingTopTabTitle("");
  };

  const handleStartRenameTopTab = (tab: WorkspaceTabState) => {
    setEditingTopTabId(tab.id);
    setEditingTopTabTitle(tab.title);
  };

  const handleCommitRenameTopTab = () => {
    if (!editingTopTabId) return;

    const nextTitle = editingTopTabTitle.trim();
    if (nextTitle) {
      setShellState((prev) => ({
        ...prev,
        tabs: prev.tabs.map((tab) =>
          tab.id === editingTopTabId
            ? { ...tab, title: nextTitle }
            : tab,
        ),
      }));
    }

    setEditingTopTabId(null);
    setEditingTopTabTitle("");
  };

  const handleCancelRenameTopTab = () => {
    setEditingTopTabId(null);
    setEditingTopTabTitle("");
  };

  const handleCloseTopTab = (tabId: string) => {
    setShellState((prev) => {
      if (prev.tabs.length <= 1) {
        return prev;
      }

      const closingIndex = prev.tabs.findIndex((tab) => tab.id === tabId);
      if (closingIndex === -1) {
        return prev;
      }

      const nextTabs = prev.tabs.filter((tab) => tab.id !== tabId);
      const nextActiveTopTabId =
        prev.activeTopTabId === tabId
          ? (nextTabs[Math.max(0, closingIndex - 1)] ?? nextTabs[0]).id
          : prev.activeTopTabId;

      return {
        ...prev,
        activeTopTabId: nextActiveTopTabId,
        tabs: nextTabs,
      };
    });

    if (editingTopTabId === tabId) {
      handleCancelRenameTopTab();
    }
  };

  const handleActiveLayoutChange = (layoutJson: LayoutJsonConfig) => {
    setShellState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((tab) =>
        tab.id === prev.activeTopTabId
          ? { ...tab, layout: layoutJson }
          : tab,
      ),
    }));
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

  useEffect(() => {
    const pushRecentPanel = (panel: MicroPanelDefinition) => {
      setRecentPanels((prev) => {
        const nextPanels = sanitizeRecentPanels([panel, ...prev], addMenu.recentLimit);
        try {
          localStorage.setItem(recentStorageKey, JSON.stringify(nextPanels));
        } catch (error) {
          console.error("Failed to save recent panels", error);
        }
        return nextPanels;
      });
    };

    const handleAddPanel = (data: unknown) => {
      try {
        const normalizedPanel = normalizePanelDefinition(data as MicroPanelDefinition);
        pushRecentPanel(normalizedPanel);
      } catch (error) {
        console.error("Failed to handle add-panel event", error);
      }
    };

    eventBus.on("add-panel", handleAddPanel);
    return () => {
      eventBus.off("add-panel", handleAddPanel);
    };
  }, [addMenu.recentLimit, eventBus, recentStorageKey]);

  useEffect(() => {
    const handleExport = () => {
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(shellState, null, 2));
      const anchor = document.createElement("a");
      anchor.setAttribute("href", dataStr);
      anchor.setAttribute("download", DEFAULT_LAYOUT_DOWNLOAD_NAME);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    };

    const handleImport = (jsonStr: unknown) => {
      if (typeof jsonStr !== "string") return;

      try {
        const parsed = JSON.parse(jsonStr);
        const nextShellState = parseShellStateValue(parsed, title);
        if (!nextShellState) {
          throw new Error("Unsupported import JSON");
        }
        setShellState(nextShellState);
      } catch (error) {
        alert("Invalid layout JSON");
        console.error(error);
      }
    };

    eventBus.on("export-layout", handleExport);
    eventBus.on("import-layout", handleImport);
    return () => {
      eventBus.off("export-layout", handleExport);
      eventBus.off("import-layout", handleImport);
    };
  }, [eventBus, shellState, title]);

  const shouldShowPresetDivider =
    addMenu.panels.length > 0 && (addMenu.enableCustomApp || addMenu.enableRecent);
  const shouldShowRecentSection = addMenu.enableRecent && recentPanels.length > 0;
  const shouldShowRecentDivider =
    shouldShowRecentSection && (addMenu.panels.length > 0 || addMenu.enableCustomApp);

  return (
    <div className={`app-container ${className}`.trim()}>
      <header className={`top-menu${shellState.topBarCollapsed ? " collapsed" : ""}`}>
        {shellState.topBarCollapsed ? (
          <div className="collapsed-top-strip">
            <button type="button" className="top-bar-toggle" onClick={toggleTopBarCollapsed} title="Expand">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
          </div>
        ) : (
          <div className="top-menu-row">
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
                    {addMenu.panels.map((panel, index) => (
                      <div
                        className="dropdown-item"
                        key={`${panel.name}-${index}`}
                        onClick={() => loadPanel(panel)}
                      >
                        {panel.name}
                      </div>
                    ))}
                    {shouldShowPresetDivider && <div className="dropdown-divider"></div>}
                    {addMenu.enableCustomApp && (
                      <div className="dropdown-item" onClick={openCustomModal}>Custom App...</div>
                    )}
                    {shouldShowRecentDivider && <div className="dropdown-divider"></div>}
                    {shouldShowRecentSection && (
                      <div className="dropdown-section">
                        <div className="dropdown-section-title">Recent</div>
                        {recentPanels.map((panel) => (
                          <div
                            className="dropdown-recent-item"
                            key={getPanelDefinitionIdentity(panel)}
                            onClick={() => loadPanel(panel)}
                          >
                            <div className="dropdown-recent-content">
                              <span className="dropdown-recent-name">{panel.name}</span>
                              <span className="dropdown-recent-source">
                                {panel.source?.value ?? panel.entry ?? "No source"}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="dropdown-recent-remove"
                              aria-label={`Remove recent panel ${panel.name}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                removeRecentPanel(panel);
                              }}
                            >
                              x
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="dropdown-clear-action"
                          onClick={clearRecentPanels}
                        >
                          Clear History
                        </button>
                      </div>
                    )}
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
                      <input type="file" accept=".json" style={{ display: "none" }} onChange={handleImportLayout} />
                    </label>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item" onClick={broadcastMessage}>Broadcast Event</div>
                  </div>
                )}
              </div>
            </div>

            <div className="top-tab-strip">
              {shellState.tabs.map((tab) => (
                <div
                  className={`top-workspace-tab${tab.id === activeTopTab.id ? " active" : ""}`}
                  key={tab.id}
                  onClick={() => handleActivateTopTab(tab.id)}
                  onDoubleClick={() => handleStartRenameTopTab(tab)}
                >
                  {editingTopTabId === tab.id ? (
                    <input
                      autoFocus
                      className="top-workspace-tab-input"
                      value={editingTopTabTitle}
                      onBlur={handleCommitRenameTopTab}
                      onChange={(event) => setEditingTopTabTitle(event.target.value)}
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          handleCommitRenameTopTab();
                        }
                        if (event.key === "Escape") {
                          handleCancelRenameTopTab();
                        }
                      }}
                    />
                  ) : (
                    <span className="top-workspace-tab-title">{tab.title}</span>
                  )}
                  {shellState.tabs.length > 1 && (
                    <button
                      type="button"
                      className="top-workspace-tab-close"
                      aria-label={`Close ${tab.title}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleCloseTopTab(tab.id);
                      }}
                    >
                      x
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="top-workspace-tab-add" onClick={handleCreateTopTab}>
                +
              </button>
            </div>

            <div className="menu-right">
              <div className="menu-messages">
                {messages.length > 0 && <span className="latest-msg">{messages[messages.length - 1]}</span>}
              </div>
              <button type="button" className="top-bar-toggle" onClick={toggleTopBarCollapsed} title="Collapse">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
              </button>
            </div>
          </div>
        )}
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
          key={activeTopTab.id}
          title={title}
          layoutJson={activeTopTab.layout}
          eventBus={eventBus}
          onLayoutChange={handleActiveLayoutChange}
        />
      </main>
    </div>
  );
});

export default App;
