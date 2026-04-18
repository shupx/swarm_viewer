import React, { useRef, useState, useEffect } from 'react';
import { Layout, Model, TabNode } from 'flexlayout-react';
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
    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}>
      <Layout ref={layoutRef} model={model} factory={factory} />
    </div>
  );
};
