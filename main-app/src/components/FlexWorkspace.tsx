import React, { useRef, useState, useEffect } from 'react';
import { Layout, Model, TabNode, Actions, DockLocation, TabSetNode, Node } from 'flexlayout-react';
import 'flexlayout-react/style/light.css';
import { MicroAppRenderer } from './MicroAppRenderer';
import { eventBus } from '../utils/bus';

// Default Layout Config - Restoring native tabs but with simple splitters
const defaultConfig = {
  global: {
    tabEnableClose: true,
    tabSetEnableMaximize: true,
    tabSetEnableTabStrip: true, // We want the tabs back so user can drag them!
    splitterSize: 3,             // Simple clean thin splitter
    splitterExtra: 4,
    enableEdgeDock: true,
    borderEnableTabStrip: true,
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
        enableTabStrip: false,
        children: [
          {
            type: 'tab',
            name: 'Welcome to Swarm',
            component: 'welcome',
          },
        ],
      },
    ],
  },
};

const LOCAL_STORAGE_KEY = 'swarm_viewer_layout';

export const FlexWorkspace: React.FC = () => {
  const [model, setModel] = useState<Model>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return Model.fromJson(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved layout', e);
      }
    }
    return Model.fromJson(defaultConfig);
  });
  const layoutRef = useRef<Layout>(null);

  const onAddPanel = (name: string, entry: string) => {
    let targetId = model.getActiveTabset()?.getId();
    if (!targetId) targetId = 'main_tabset';
    
    let welcomeNodeId: string | null = null;
    model.visitNodes((node: Node) => {
      if (node.getType() === 'tab' && (node as TabNode).getComponent() === 'welcome') {
        welcomeNodeId = node.getId();
      }
    });

    // Add sub-app (replace welcome if it exists, otherwise split to the right)
    model.doAction(Actions.addNode({
      type: 'tab',
      name: name,
      component: 'sub-app',
      config: { entry, name },
    }, targetId, welcomeNodeId ? DockLocation.CENTER : DockLocation.RIGHT, -1));

    // Automatically close welcome page
    if (welcomeNodeId) {
      model.doAction(Actions.deleteTab(welcomeNodeId));
    }
  };

  useEffect(() => {
    const handler = (data: any) => onAddPanel(data.name, data.entry);
    eventBus.on('add-panel', handler);
    return () => { eventBus.off('add-panel', handler); };
  }, []);

  useEffect(() => {
    const handleExport = () => {
      const currentModel = model;
      if (!currentModel) return;
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentModel.toJson(), null, 2));
      const anchor = document.createElement('a');
      anchor.setAttribute("href", dataStr);
      anchor.setAttribute("download", "swarm_layout.json");
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    };
    
    const handleImport = (jsonStr: string) => {
      try {
        const newModel = Model.fromJson(JSON.parse(jsonStr));
        setModel(newModel);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newModel.toJson()));
      } catch (e) {
        alert('Invalid layout JSON');
        console.error(e);
      }
    };

    eventBus.on('export-layout', handleExport);
    eventBus.on('import-layout', handleImport);
    return () => {
      eventBus.off('export-layout', handleExport);
      eventBus.off('import-layout', handleImport);
    };
  }, [model]);

  const factory = (node: TabNode) => {
    const component = node.getComponent();

    // Welcome Node
    if (component === 'welcome') {
      return (
        <div style={{ padding: 40, height: '100%', boxSizing: 'border-box', background: '#f8f9fa' }}>
          <h2 style={{margin:0, color:'#2c3e50'}}>Swarm Viewer</h2>
          <p style={{color:'#7f8c8d', marginTop: 12}}>The workspace is empty. Click "Add Sub-App Demo" from the top menu to start building your layout.</p>
          <p style={{color:'#7f8c8d'}}>You can drag the tabs above to re-arrange, split screens, or dock to edges.</p>
        </div>
      );
    }
    
    // Sub-app Node
    if (component === 'sub-app') {
      const config = node.getConfig();
      if (!config) return <div>Invalid config</div>;
      return (
        <MicroAppRenderer name={config.name} entry={config.entry} key={node.getId()} node={node} model={model} layout={layoutRef.current || undefined} />
      );
    }

    return <div>Component Not Found</div>;
  };

  const onModelChange = (newModel: Model) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newModel.toJson()));
    } catch (e) {
      console.error('Failed to save layout', e);
    }
    // Dynamically hide tab strip when there is only 1 tab
    newModel.visitNodes((n: Node) => {
      if (n.getType() === 'tabset') {
        const tabset = n as TabSetNode;
        const children = tabset.getChildren();
        const shouldShowTabs = children.length > 1;
        if (tabset.isEnableTabStrip() !== shouldShowTabs) {
          setTimeout(() => {
            newModel.doAction(Actions.updateNodeAttributes(tabset.getId(), {
              enableTabStrip: shouldShowTabs
            }));
          }, 0);
        }
      }
    });
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}>
      <Layout ref={layoutRef} model={model} factory={factory} onModelChange={onModelChange} />
    </div>
  );
};
