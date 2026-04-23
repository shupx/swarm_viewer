import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  Layout,
  Model,
  TabNode,
  Actions,
  DockLocation,
  TabSetNode,
  Node,
} from "flexlayout-react";
import "flexlayout-react/style/light.css";
import { MicroAppRenderer } from "./MicroAppRenderer";
import { normalizePanelDefinition } from "../utils/panels";

import type { MicroAppSource, MicroPanelHubEventBus } from "../types";

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

interface FlexWorkspaceProps {
  title: string;
  storageKey: string;
  layoutDownloadName: string;
  eventBus: MicroPanelHubEventBus;
}

const createDefaultConfig = (title: string) => ({
  global: {
    tabEnableClose: true,
    tabSetEnableMaximize: true,
    tabSetEnableTabStrip: true,
    splitterSize: 3,
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
            type: "tab",
            name: `Welcome to ${title}`,
            component: "welcome",
          },
        ],
      },
    ],
  },
});

const normalizeConfig = (config: MicroAppConfig): MicroAppConfig => {
  return normalizePanelDefinition(config);
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

export const FlexWorkspace: React.FC<FlexWorkspaceProps> = ({
  title,
  storageKey,
  layoutDownloadName,
  eventBus,
}) => {
  const [model, setModel] = useState<Model>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const normalized = normalizeLayoutJson(JSON.parse(saved));
        localStorage.setItem(storageKey, JSON.stringify(normalized));
        return Model.fromJson(normalized);
      } catch (e) {
        console.error("Failed to parse saved layout", e);
      }
    }
    return Model.fromJson(createDefaultConfig(title));
  });
  const layoutRef = useRef<Layout>(null);

  const onAddPanel = useCallback((name: string, source?: MicroAppSource, entry?: string) => {
    let targetId = model.getActiveTabset()?.getId();
    if (!targetId) targetId = "main_tabset";
    
    let welcomeNodeId: string | null = null;
    model.visitNodes((node: Node) => {
      if (node.getType() === "tab" && (node as TabNode).getComponent() === "welcome") {
        welcomeNodeId = node.getId();
      }
    });

    let config: MicroAppConfig;
    try {
      config = normalizeConfig({ name, source, entry });
    } catch (error) {
      console.error("Failed to normalize panel config", error);
      return;
    }

    model.doAction(
      Actions.addNode(
        {
          type: "tab",
          name,
          component: "sub-app",
          config,
        },
        targetId,
        welcomeNodeId ? DockLocation.CENTER : DockLocation.RIGHT,
        -1,
      ),
    );

    if (welcomeNodeId) {
      model.doAction(Actions.deleteTab(welcomeNodeId));
    }
  }, [model]);

  useEffect(() => {
    const handler = (data: unknown) => {
      const payload = data as AddPanelPayload;
      onAddPanel(payload.name, payload.source, payload.entry);
    };
    eventBus.on("add-panel", handler);
    return () => {
      eventBus.off("add-panel", handler);
    };
  }, [eventBus, onAddPanel]);

  useEffect(() => {
    const handleExport = () => {
      const currentModel = model;
      if (!currentModel) return;
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(currentModel.toJson(), null, 2));
      const anchor = document.createElement("a");
      anchor.setAttribute("href", dataStr);
      anchor.setAttribute("download", layoutDownloadName);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    };
    
    const handleImport = (jsonStr: string) => {
      try {
        const normalized = normalizeLayoutJson(JSON.parse(jsonStr));
        const newModel = Model.fromJson(normalized);
        setModel(newModel);
        localStorage.setItem(storageKey, JSON.stringify(newModel.toJson()));
      } catch (e) {
        alert("Invalid layout JSON");
        console.error(e);
      }
    };

    eventBus.on("export-layout", handleExport);
    eventBus.on("import-layout", handleImport);
    return () => {
      eventBus.off("export-layout", handleExport);
      eventBus.off("import-layout", handleImport);
    };
  }, [eventBus, layoutDownloadName, model, storageKey]);

  const factory = (node: TabNode) => {
    const component = node.getComponent();

    if (component === "welcome") {
      return (
        <div style={{ padding: 40, height: '100%', boxSizing: 'border-box', background: '#f8f9fa' }}>
          <h2 style={{margin:0, color:'#2c3e50'}}>{title}</h2>
          <p style={{color:'#7f8c8d', marginTop: 12}}>The workspace is empty. Open the Add menu to start building your layout.</p>
          <p style={{color:'#7f8c8d'}}>You can drag the tabs above to re-arrange, split screens, or dock to edges.</p>
        </div>
      );
    }
    
    if (component === "sub-app") {
      const config = node.getConfig();
      if (!config) return <div>Invalid config</div>;
      return (
        <MicroAppRenderer
          name={config.name}
          entry={config.entry}
          key={node.getId()}
          node={node}
          model={model}
          layout={layoutRef.current || undefined}
          eventBus={eventBus}
        />
      );
    }

    return <div>Component Not Found</div>;
  };

  const onModelChange = (newModel: Model) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newModel.toJson()));
    } catch (e) {
      console.error("Failed to save layout", e);
    }
    newModel.visitNodes((n: Node) => {
      if (n.getType() === "tabset") {
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
