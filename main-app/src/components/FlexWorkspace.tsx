import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Layout, Model, TabNode, Actions, DockLocation, TabSetNode, Node } from 'flexlayout-react';
import 'flexlayout-react/style/light.css';
import { MicroAppRenderer } from './MicroAppRenderer';
import { eventBus } from '../utils/bus';
import { resolvePageRelativeRouteUrl, resolveSiteRelativeRouteUrl } from '../utils/path';

type MicroAppSource =
  | { type: 'absolute-url'; value: string }
  | { type: 'site-relative-route'; value: string }
  | { type: 'page-relative-route'; value: string };

interface MicroAppConfig {
  name: string;
  source?: MicroAppSource;
  entry?: string;
}

interface LayoutNodeConfig {
  component?: string;
  config?: MicroAppConfig;
  children?: LayoutNodeConfig[];
}

interface LayoutJsonConfig {
  layout?: LayoutNodeConfig;
  borders?: LayoutNodeConfig[];
}

interface AddPanelPayload {
  name: string;
  source?: MicroAppSource;
  entry?: string;
}

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

const normalizeRelativeRoute = (value: string) => {
  if (!value) return '/';
  let normalized = value.trim();
  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }

  const lastSegment = normalized.split('/').filter(Boolean).pop() ?? '';
  const looksLikeFile = lastSegment.includes('.');
  if (!normalized.endsWith('/') && !looksLikeFile) {
    normalized = `${normalized}/`;
  }

  return normalized;
};

const normalizeAbsoluteUrl = (value: string) => {
  const normalizedUrl = new URL(value);
  const pathname = normalizedUrl.pathname;
  const lastSegment = pathname.split('/').filter(Boolean).pop() ?? '';
  const looksLikeFile = lastSegment.includes('.');

  if (!pathname.endsWith('/') && !looksLikeFile) {
    normalizedUrl.pathname = `${pathname}/`;
  }

  return normalizedUrl.toString();
};

const resolveEntryFromSource = (source: MicroAppSource) => {
  if (source.type === 'site-relative-route') {
    return resolveSiteRelativeRouteUrl(normalizeRelativeRoute(source.value));
  }

  if (source.type === 'page-relative-route') {
    return resolvePageRelativeRouteUrl(normalizeRelativeRoute(source.value));
  }

  return normalizeAbsoluteUrl(source.value);
};

const normalizeConfig = (config: MicroAppConfig): MicroAppConfig => {
  if (config.source) {
    const normalizedSource =
      config.source.type === 'absolute-url'
        ? { type: 'absolute-url' as const, value: normalizeAbsoluteUrl(config.source.value) }
        : { type: config.source.type, value: normalizeRelativeRoute(config.source.value) };

    return {
      ...config,
      source: normalizedSource,
      entry: resolveEntryFromSource(normalizedSource),
    };
  }

  if (config.entry) {
    return {
      ...config,
      source: { type: 'absolute-url', value: normalizeAbsoluteUrl(config.entry) },
      entry: normalizeAbsoluteUrl(config.entry),
    };
  }

  return config;
};

const normalizeLayoutJson = (config: LayoutJsonConfig) => {
  if (!config) return config;

  const visit = (node?: LayoutNodeConfig) => {
    if (node?.component === 'sub-app' && node.config) {
      node.config = normalizeConfig(node.config);
    }

    if (Array.isArray(node?.children)) {
      node.children.forEach(visit);
    }
  };

  visit(config.layout);
  if (Array.isArray(config.borders)) {
    config.borders.forEach(visit);
  }

  return config;
};

export const FlexWorkspace: React.FC = () => {
  const [model, setModel] = useState<Model>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const normalized = normalizeLayoutJson(JSON.parse(saved));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalized));
        return Model.fromJson(normalized);
      } catch (e) {
        console.error('Failed to parse saved layout', e);
      }
    }
    return Model.fromJson(defaultConfig);
  });
  const layoutRef = useRef<Layout>(null);

  const onAddPanel = useCallback((name: string, source?: MicroAppSource, entry?: string) => {
    let targetId = model.getActiveTabset()?.getId();
    if (!targetId) targetId = 'main_tabset';
    
    let welcomeNodeId: string | null = null;
    model.visitNodes((node: Node) => {
      if (node.getType() === 'tab' && (node as TabNode).getComponent() === 'welcome') {
        welcomeNodeId = node.getId();
      }
    });

    const config = normalizeConfig({ name, source, entry });

    // Add sub-app (replace welcome if it exists, otherwise split to the right)
    model.doAction(Actions.addNode({
      type: 'tab',
      name: name,
      component: 'sub-app',
      config,
    }, targetId, welcomeNodeId ? DockLocation.CENTER : DockLocation.RIGHT, -1));

    // Automatically close welcome page
    if (welcomeNodeId) {
      model.doAction(Actions.deleteTab(welcomeNodeId));
    }
  }, [model]);

  useEffect(() => {
    const handler = (data: unknown) => {
      const payload = data as AddPanelPayload;
      onAddPanel(payload.name, payload.source, payload.entry);
    };
    eventBus.on('add-panel', handler);
    return () => { eventBus.off('add-panel', handler); };
  }, [onAddPanel]);

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
        const normalized = normalizeLayoutJson(JSON.parse(jsonStr));
        const newModel = Model.fromJson(normalized);
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
