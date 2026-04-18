import React, { useRef, useState, useEffect } from 'react';
import { Layout, Model, TabNode, Actions, Action } from 'flexlayout-react';
import 'flexlayout-react/style/light.css';
import { MicroAppRenderer } from './MicroAppRenderer';
import { eventBus } from '../utils/bus';

// Default Layout
const defaultConfig = {
  global: {
    tabEnableClose: true,
    tabEnableRename: false,
    tabSetEnableMaximize: true,
  },
  borders: [],
  layout: {
    type: 'row',
    id: 'root',
    children: [
      {
        type: 'tabset',
        id: 'main_tabset',
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
  const [model, setModel] = useState<Model>(Model.fromJson(defaultConfig));
  const layoutRef = useRef<Layout>(null);

  // Add a new tab to the layout
  const onAddPanel = (name: string, entry: string) => {
    layoutRef.current?.addTabToActiveTabSet({
      type: 'tab',
      name: name,
      component: 'sub-app',
      config: { entry, name },
    });
  };

  useEffect(() => {
    // Listen for add panel events from top menu
    const handler = (data: { name: string; entry: string }) => {
      onAddPanel(data.name, data.entry);
    };
    eventBus.on('add-panel', handler);
    return () => {
      eventBus.off('add-panel', handler);
    };
  }, []);

  const factory = (node: TabNode) => {
    const component = node.getComponent();
    if (component === 'welcome') {
      return (
        <div style={{ padding: 20 }}>
          <h2>Welcome to Swarm Viewer</h2>
          <p>This is the main workspace. Use the top menu to add tools.</p>
        </div>
      );
    }
    
    if (component === 'sub-app') {
      const config = node.getConfig();
      if (!config) return <div>Invalid configuration</div>;
      
      return (
        <MicroAppRenderer
          name={config.name}
          entry={config.entry}
          key={node.getId()} 
        />
      );
    }

    return <div>Component Not Found</div>;
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Layout ref={layoutRef} model={model} factory={factory} />
    </div>
  );
};
