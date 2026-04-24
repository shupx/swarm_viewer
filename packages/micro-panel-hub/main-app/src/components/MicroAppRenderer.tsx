import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
} from "react";
import { loadMicroApp, type MicroApp } from "qiankun";
import { TabNode, Model, Actions, Layout, DockLocation } from "flexlayout-react";

import type { MicroPanelHubEventBus } from "../types";

interface MicroAppRendererProps {
  name: string;
  entry: string;
  node?: TabNode;
  model?: Model;
  layout?: Layout;
  eventBus: MicroPanelHubEventBus;
}

export const MicroAppRenderer: React.FC<MicroAppRendererProps> = ({
  name,
  entry,
  node,
  model,
  layout,
  eventBus,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const microAppRef = useRef<MicroApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const parent = node?.getParent();
  const isMaximized = model?.getMaximizedTabset()?.getId() === parent?.getId();

  const loadApp = useCallback(async () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const currentMicroApp = microAppRef.current;

    if (currentMicroApp) {
      if (currentMicroApp.getStatus() === "MOUNTED") {
        try {
          await currentMicroApp.unmount();
        } catch (e) {
          console.error("Failed to unmount previous instance", e);
        }
      }
      microAppRef.current = null;
    }

    container.innerHTML = "";
    setError(null);
    setLoading(true);

    try {
      const entryUrl = new URL(entry, window.location.href);
      entryUrl.searchParams.set("t", Date.now().toString());

      const safeName = name.replace(/[^a-zA-Z0-9-]/g, "-");
      const microApp = loadMicroApp(
        {
          name: `${safeName}-${Math.random().toString(36).substring(7)}`,
          entry: entryUrl.toString(),
          container,
          props: {
            eventBus,
          },
        },
        {
          sandbox: { strictStyleIsolation: false, experimentalStyleIsolation: true },
        },
      );

      microAppRef.current = microApp;

      microApp.loadPromise.catch((err) => {
        console.warn(`[qiankun load] Failed to load ${name}:`, err.message || err);
      });
      microApp.bootstrapPromise.catch((err) => {
        console.warn(`[qiankun bootstrap] Failed to bootstrap ${name}:`, err.message || err);
      });

      microApp.mountPromise
        .then(() => setLoading(false))
        .catch((err) => {
          console.error(`Failed to mount ${name}:`, err);
          setError(err.message || "Failed to manually mount micro app");
          setLoading(false);
        });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error loading micro app";
      setError(message);
      setLoading(false);
    }
  }, [entry, eventBus, name]);

  useEffect(() => {
    // qiankun mount triggers local loading/error state as part of synchronizing with the external micro-app runtime.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadApp();

    const microApp = microAppRef.current;
    return () => {
      if (microApp && microApp.getStatus() === "MOUNTED") {
        microApp.unmount().catch(console.error);
      }
    };
  }, [loadApp]);

  const handleDrag = (e: ReactDragEvent) => {
    if (layout && node) {
      layout.moveTabWithDragAndDrop(e.nativeEvent, node as TabNode);
    }
  };

  const handleDock = (location: DockLocation) => {
    if (model && node) {
      const rootId = model.getRoot().getId();
      // Move to the designated border area
      model.doAction(Actions.moveNode(node.getId(), rootId, location, -1));
    }
  };

  const handleMaximize = () => {
    if (model && node) {
      const parent = node.getParent();
      if (parent) {
        model.doAction(Actions.maximizeToggle(parent.getId()));
      }
    }
  };

  const handleClose = () => {
    if (model && node) {
      model.doAction(Actions.deleteTab(node.getId()));
    }
  };

  return (
    <div 
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
    >
      {/* Invisible Hover Trigger & Toolbar Container */}
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, 
          height: isHovered ? 28 : 12, 
          zIndex: 100,
          backgroundColor: 'transparent'
        }}
      >
        {/* Custom Inner Toolbar */}
        <div 
          draggable={true}
          onDragStart={handleDrag}
          title="Drag panel"
          style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 28,
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          transform: isHovered ? 'translateY(0)' : 'translateY(-100%)',
          opacity: isHovered ? 1 : 0, 
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: isHovered ? 'auto' : 'none',
          cursor: 'grab'
        }}>
          {/* Drag handle (centered) */}
        <div 
          style={{ 
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            color: '#333', fontSize: 20,
            padding: '0 10px', userSelect: 'none', lineHeight: '24px',
            display: 'flex', alignItems: 'center', letterSpacing: '2px',
            textShadow: '0 0 2px rgba(255,255,255,0.8)',
            pointerEvents: 'none'
          }}
        >
          •••
        </div>

        {/* Action icons (top right) */}
        <div 
          draggable={true}
          onDragStart={(e) => { e.stopPropagation(); e.preventDefault(); }}
          style={{ 
          position: 'absolute', top: 0, right: 8, display: 'flex', gap: 10,
          alignItems: 'center', height: '100%', color: '#333',
          filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.8))'
        }}>
          {/* Dock Left Sidebar (similar to VSCode primary sidebar) */}
          <span onClick={() => handleDock(DockLocation.LEFT)} style={{ cursor: 'pointer', display: 'flex' }} title="Dock to Left Sidebar">
            <svg width="14" height="14" viewBox="0 0 16 16">
              <rect x="1.5" y="2.5" width="13" height="11" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5.5 2.5v11" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
          {/* Dock Bottom Panel (similar to VSCode bottom panel) */}
          <span onClick={() => handleDock(DockLocation.BOTTOM)} style={{ cursor: 'pointer', display: 'flex' }} title="Dock to Bottom Panel">
            <svg width="14" height="14" viewBox="0 0 16 16">
              <rect x="1.5" y="2.5" width="13" height="11" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M1.5 9.5h13" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
          {/* Dock Right Sidebar (similar to VSCode secondary sidebar) */}
          <span onClick={() => handleDock(DockLocation.RIGHT)} style={{ cursor: 'pointer', display: 'flex' }} title="Dock to Right Sidebar">
            <svg width="14" height="14" viewBox="0 0 16 16">
              <rect x="1.5" y="2.5" width="13" height="11" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 2.5v11" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>

          <div style={{ width: '1px', height: '12px', background: '#ccc', margin: '0 2px' }} />

          {/* Maximize / Restore */}
          <span onClick={handleMaximize} style={{ cursor: 'pointer', display: 'flex' }} title={isMaximized ? "Restore" : "Maximize"}>
            {isMaximized ? (
              <svg width="14" height="14" viewBox="0 0 16 16">
                <path d="M4.5 4.5v-2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <rect x="1.5" y="5.5" width="9" height="9" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 16 16">
                <rect x="1.5" y="2.5" width="13" height="11" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            )}
          </span>
          {/* Close */}
          <span onClick={handleClose} style={{ cursor: 'pointer', display: 'flex' }} title="Close">
            <svg width="14" height="14" viewBox="0 0 16 16">
              <path d="M4 4l8 8m0-8l-8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
        </div>
      </div>
      </div>

      {loading && <div style={{ position: 'absolute', top: 30, left: 10 }}>Loading {name}...</div>}
      {error && (
        <div style={{ position: 'absolute', top: 30, left: 10, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ color: 'red' }}>Error: {error}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Target URL:{' '}
            <a href={entry} target="_blank" rel="noreferrer" style={{ color: '#007acc', textDecoration: 'underline' }}>
              {entry}
            </a>
          </div>
          <button 
            onClick={loadApp}
            style={{ 
              padding: '4px 12px', 
              cursor: 'pointer', 
              background: '#007acc', 
              color: 'white', 
              border: 'none', 
              borderRadius: '2px',
              width: 'fit-content'
            }}
          >
            Reload {name}
          </button>
        </div>
      )}
      <div ref={containerRef} className="micro-app-wrapper" style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
