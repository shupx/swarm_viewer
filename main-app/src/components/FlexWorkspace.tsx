import React, { useRef, useState, useEffect } from 'react';
import { Layout, Model, TabNode, Actions, DockLocation } from 'flexlayout-react';
import 'flexlayout-react/style/light.css';
import { MicroAppRenderer } from './MicroAppRenderer';
import { eventBus } from '../utils/bus';

// A wrapper to handle hover controls (close and maximize) for sub-apps without tab strips
const NodeWrapper: React.FC<{ node: TabNode, model: Model, children: React.ReactNode }> = ({ node, model, children }) => {
  const [hovered, setHovered] = useState(false);

  const handleClose = () => {
    model.doAction(Actions.deleteTab(node.getId()));
  };

  const handleMaximize = () => {
    const parentId = node.getParent()?.getId();
    if (parentId) {
      model.doAction(Actions.maximizeToggle(parentId));
    }
  };

  return (
    <div 
      style={{ width: '100%', height: '100%', position: 'relative' }} 
      onMouseEnter={() => setHovered(true)} 
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      {hovered && (
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 100,
          display: 'flex', gap: 6, opacity: 0.85
        }}>
          <button onClick={handleMaximize} title="Maximize" style={btnStyle}>⛶</button>
          <button onClick={handleClose} title="Close" style={btnStyle}>✖</button>
        </div>
      )}
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.7)', border: '1px solid #ccc', borderRadius: '4px',
  cursor: 'pointer', padding: '4px 8px', fontSize: '14px', lineHeight: '1', backdropFilter: 'blur(4px)',
  color: '#333'
};

// Default Layout Config
const defaultConfig = {
  global: {
    tabEnableClose: true,
    tabSetEnableMaximize: true,
    tabSetEnableTabStrip: false, // Remove default tab component
    splitterSize: 3,             // Simple clean thin splitter
    splitterExtra: 4,
    enableEdgeDock: true,
  },
  borders: [],
  layout: {
    type: 'row',
    id: 'main-row',
    weight: 100,
    children: [
      {
        type: 'tabset',
        id: 'main_tabset',
        weight: 100,
        children: [
          {
            type: 'tab',
            name: 'Welcome',
            component: 'welcome',
          },
        ],
      },
    ],
  },
};

export const FlexWorkspace: React.FC = () => {
  const [model] = useState<Model>(Model.fromJson(defaultConfig));
  const layoutRef = useRef<Layout>(null);

  const onAddPanel = (name: string, entry: string) => {
    let targetId = model.getActiveTabset()?.getId();
    if (!targetId) targetId = 'main_tabset';
    
    // Add sub-app splitting to the right natively instead of behind a tab header
    model.doAction(Actions.addNode({
      type: 'tab',
      name: name,
      component: 'sub-app',
      config: { entry, name },
    }, targetId, DockLocation.RIGHT, -1));
  };

  useEffect(() => {
    const handler = (data: any) => onAddPanel(data.name, data.entry);
    eventBus.on('add-panel', handler);
    return () => { eventBus.off('add-panel', handler); };
  }, []);

  const factory = (node: TabNode) => {
    const component = node.getComponent();

    // Welcome Node
    if (component === 'welcome') {
      return (
        <NodeWrapper node={node} model={model}>
          <div style={{ padding: 40, height: '100%', boxSizing: 'border-box', background: '#f8f9fa' }}>
            <h2 style={{margin:0, color:'#2c3e50'}}>Swarm Viewer</h2>
            <p style={{color:'#7f8c8d'}}>The workspace is empty. Click "Add Sub-App Demo" from the top menu to start building your layout.</p>
          </div>
        </NodeWrapper>
      );
    }
    
    // Sub-app Node
    if (component === 'sub-app') {
      const config = node.getConfig();
      if (!config) return <div>Invalid config</div>;
      return (
        <NodeWrapper node={node} model={model}>
          <MicroAppRenderer name={config.name} entry={config.entry} key={node.getId()} />
        </NodeWrapper>
      );
    }

    return <div>Component Not Found</div>;
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}>
      <Layout ref={layoutRef} model={model} factory={factory} />
    </div>
  );
};
