import React, { useEffect, useRef, useState, type DragEvent as ReactDragEvent } from 'react';
import { loadMicroApp, type MicroApp } from 'qiankun';
import { eventBus } from '../utils/bus';
import { TabNode, Model, Actions, Layout, DockLocation } from 'flexlayout-react';

interface MicroAppRendererProps {
  name: string;
  entry: string;
  node?: TabNode;
  model?: Model;
  layout?: Layout;
}

export const MicroAppRenderer: React.FC<MicroAppRendererProps> = ({ name, entry, node, model, layout }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const microAppRef = useRef<MicroApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (model && node) {
      const parent = node.getParent();
      setIsMaximized(model.getMaximizedTabset()?.getId() === parent?.getId());
    }
  }, [isHovered, model, node]);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      setLoading(true);
      // Load the micro app manually
      microAppRef.current = loadMicroApp(
        {
          name: `${name}-${Math.random().toString(36).substring(7)}`, // Ensure unique name for multiple instances
          entry: entry,
          container: containerRef.current,
          props: {
            eventBus, // Inject event bus
          },
        },
        {
          sandbox: { strictStyleIsolation: false, experimentalStyleIsolation: true },
        }
      );

      microAppRef.current.mountPromise
        .then(() => setLoading(false))
        .catch((err) => {
          console.error(`Failed to mount ${name}:`, err);
          setError(err.message || 'Failed to manually mount micro app');
          setLoading(false);
        });

    } catch (err: any) {
      setError(err.message || 'Error loading micro app');
      setLoading(false);
    }

    return () => {
      // Unmount on cleanup
      if (microAppRef.current && microAppRef.current.getStatus() === 'MOUNTED') {
        microAppRef.current.unmount().catch(console.error);
      }
    };
  }, [name, entry]);

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
        setIsMaximized(!isMaximized);
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
      style={{ width: '100%', height: '100%', position: 'relative' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Custom Inner Toolbar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 24, zIndex: 100,
        opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s',
        pointerEvents: isHovered ? 'auto' : 'none'
      }}>
        {/* Drag handle (centered) */}
        <div 
          draggable={true}
          onDragStart={handleDrag}
          style={{ 
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            cursor: 'grab', color: '#999', fontSize: 20,
            padding: '0 10px', userSelect: 'none', lineHeight: '24px',
            display: 'flex', alignItems: 'center', letterSpacing: '2px'
          }}
          title="Drag panel"
        >
          •••
        </div>

        {/* Action icons (top right) */}
        <div style={{ 
          position: 'absolute', top: 0, right: 8, display: 'flex', gap: 10,
          alignItems: 'center', height: '100%', color: '#666'
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

      {loading && <div style={{ position: 'absolute', top: 30, left: 10 }}>Loading {name}...</div>}
      {error && <div style={{ position: 'absolute', top: 30, left: 10, color: 'red' }}>Error: {error}</div>}
      <div ref={containerRef} style={{ width: '100%', height: '100%', paddingTop: 24, boxSizing: 'border-box' }} />
    </div>
  );
};
