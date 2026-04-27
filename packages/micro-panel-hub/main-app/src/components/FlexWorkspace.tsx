import React, { useEffect, useRef, useState } from "react";
import { Layout, Model, TabNode } from "flexlayout-react";
import "flexlayout-react/style/light.css";
import { MicroAppRenderer } from "./MicroAppRenderer";
import {
  applyAddPanelToModel,
  normalizeLayoutJson,
  normalizeModelJsonForStorage,
  normalizeTabSetAttributes,
} from "../utils/workspace";

import type {
  MicroPanelCrossWorkspaceDragData,
  MicroPanelDefinition,
  MicroPanelHubEventBus,
  MicroPanelHubSharedState,
} from "../types";
import type { MicroPanelHubLayoutJson as LayoutJsonConfig } from "../layout-types";

interface FlexWorkspaceProps {
  title: string;
  workspaceTabId: string;
  layoutJson: LayoutJsonConfig;
  popoutUrl: string;
  isActive: boolean;
  eventBus: MicroPanelHubEventBus;
  sharedState: MicroPanelHubSharedState;
  onLayoutChange: (layoutJson: LayoutJsonConfig) => void;
  onPanelDragStart: (payload: MicroPanelCrossWorkspaceDragData) => void;
  onPanelDragEnd: () => void;
}

export const FlexWorkspace: React.FC<FlexWorkspaceProps> = ({
  title,
  workspaceTabId,
  layoutJson,
  popoutUrl,
  isActive,
  eventBus,
  sharedState,
  onLayoutChange,
  onPanelDragStart,
  onPanelDragEnd,
}) => {
  const layoutRef = useRef<Layout>(null);
  const initialLayoutJson = normalizeLayoutJson(layoutJson);
  const [model, setModel] = useState<Model>(() =>
    Model.fromJson(initialLayoutJson as Record<string, unknown>),
  );
  const lastLayoutSignatureRef = useRef(JSON.stringify(initialLayoutJson));

  useEffect(() => {
    const normalizedLayout = normalizeLayoutJson(layoutJson);
    const nextSignature = JSON.stringify(normalizedLayout);
    if (nextSignature === lastLayoutSignatureRef.current) {
      return;
    }

    lastLayoutSignatureRef.current = nextSignature;
    setModel(Model.fromJson(normalizedLayout as Record<string, unknown>));
  }, [layoutJson]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const handleAddPanel = (data: unknown) => {
      try {
        applyAddPanelToModel(model, data as MicroPanelDefinition);
        const nextLayoutJson = normalizeModelJsonForStorage(model);
        lastLayoutSignatureRef.current = JSON.stringify(nextLayoutJson);
        onLayoutChange(nextLayoutJson);
      } catch (error) {
        console.error("Failed to add panel to active workspace", error);
      }
    };

    eventBus.on("add-panel", handleAddPanel);
    return () => {
      eventBus.off("add-panel", handleAddPanel);
    };
  }, [eventBus, isActive, model, onLayoutChange]);

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
          workspaceTabId={workspaceTabId}
          node={node}
          model={model}
          layout={layoutRef.current || undefined}
          eventBus={eventBus}
          sharedState={sharedState}
          onCrossWorkspaceDragStart={onPanelDragStart}
          onCrossWorkspaceDragEnd={onPanelDragEnd}
          onLayoutPersistenceRequest={() => {
            const nextLayoutJson = normalizeModelJsonForStorage(model);
            const nextSignature = JSON.stringify(nextLayoutJson);
            if (nextSignature === lastLayoutSignatureRef.current) {
              return;
            }

            lastLayoutSignatureRef.current = nextSignature;
            onLayoutChange(nextLayoutJson);
          }}
        />
      );
    }

    return <div>Component Not Found</div>;
  };

  const onModelChange = (newModel: Model) => {
    setTimeout(() => {
      normalizeTabSetAttributes(newModel);
    }, 0);

    const nextLayoutJson = normalizeModelJsonForStorage(newModel);
    lastLayoutSignatureRef.current = JSON.stringify(nextLayoutJson);
    onLayoutChange(nextLayoutJson);
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}>
      <Layout
        ref={layoutRef}
        model={model}
        factory={factory}
        onModelChange={onModelChange}
        supportsPopout={true}
        popoutURL={popoutUrl}
        popoutWindowName={`${title} Popout`}
      />
    </div>
  );
};
