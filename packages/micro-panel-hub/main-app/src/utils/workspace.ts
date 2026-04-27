import {
  Actions,
  DockLocation,
  Model,
  Node,
  TabNode,
  TabSetNode,
} from "flexlayout-react";

import { normalizePanelDefinition } from "./panels";

import type { MicroPanelDefinition } from "../types";
import type {
  MicroPanelHubLayoutJson as LayoutJsonConfig,
  MicroPanelHubLayoutNode as LayoutNodeConfig,
} from "../layout-types";

export interface MicroAppConfig {
  name: string;
  source?: MicroPanelDefinition["source"];
  entry?: string;
}

export const createDefaultLayoutConfig = (title: string): LayoutJsonConfig => ({
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
    type: "row",
    id: "main-row",
    weight: 100,
    children: [
      {
        type: "tabset",
        id: "main_tabset",
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

export const isLayoutJsonConfig = (value: unknown): value is LayoutJsonConfig => {
  if (!value || typeof value !== "object") return false;
  return "layout" in value || "borders" in value || "global" in value;
};

const cloneLayoutJson = (config: LayoutJsonConfig): LayoutJsonConfig =>
  JSON.parse(JSON.stringify(config)) as LayoutJsonConfig;

export const syncTabStripVisibility = (config: LayoutJsonConfig): LayoutJsonConfig => {
  const cloned = cloneLayoutJson(config);

  const visit = (node?: LayoutNodeConfig) => {
    if (!node) return;

    if (node.type === "tabset" && Array.isArray(node.children)) {
      node.enableTabStrip = node.children.length > 1;
    }

    node.children?.forEach(visit);
  };

  visit(cloned.layout);
  cloned.borders?.forEach(visit);

  return cloned;
};

export const normalizeLayoutJson = (config: LayoutJsonConfig): LayoutJsonConfig => {
  const cloned = cloneLayoutJson(config);

  const visit = (node?: LayoutNodeConfig) => {
    if (node?.component === "sub-app" && node.config) {
      node.config = normalizePanelDefinition(node.config);
    }

    node.children?.forEach(visit);
  };

  visit(cloned.layout);
  cloned.borders?.forEach(visit);

  return syncTabStripVisibility(cloned);
};

export const addPanelToLayout = (
  layoutJson: LayoutJsonConfig,
  panel: MicroPanelDefinition,
): LayoutJsonConfig => {
  const normalizedLayout = normalizeLayoutJson(layoutJson);
  const model = Model.fromJson(normalizedLayout as Record<string, unknown>);
  applyAddPanelToModel(model, panel);

  return syncTabStripVisibility(model.toJson() as LayoutJsonConfig);
};

const findTabNode = (model: Model, nodeId: string) => {
  let matchedNode: TabNode | null = null;

  model.visitNodes((node: Node) => {
    if (matchedNode) return;
    if (node.getType() === "tab" && node.getId() === nodeId) {
      matchedNode = node as TabNode;
    }
  });

  return matchedNode;
};

const hasAnyTabNode = (model: Model) => {
  let found = false;

  model.visitNodes((node: Node) => {
    if (found) return;
    if (node.getType() === "tab") {
      found = true;
    }
  });

  return found;
};

export const removePanelFromLayout = (
  layoutJson: LayoutJsonConfig,
  nodeId: string,
  title: string,
) => {
  const normalizedLayout = normalizeLayoutJson(layoutJson);
  const model = Model.fromJson(normalizedLayout as Record<string, unknown>);
  const matchedNode = findTabNode(model, nodeId);

  if (!matchedNode) {
    return {
      layout: normalizedLayout,
      removed: false,
    };
  }

  model.doAction(Actions.deleteTab(nodeId));

  if (!hasAnyTabNode(model)) {
    return {
      layout: createDefaultLayoutConfig(title),
      removed: true,
    };
  }

  return {
    layout: syncTabStripVisibility(model.toJson() as LayoutJsonConfig),
    removed: true,
  };
};

export const applyAddPanelToModel = (
  model: Model,
  panel: MicroPanelDefinition,
) => {
  const normalizedPanel = normalizePanelDefinition(panel);
  let targetId = model.getActiveTabset()?.getId();
  if (!targetId) targetId = "main_tabset";

  let welcomeNodeId: string | null = null;
  model.visitNodes((node: Node) => {
    if (node.getType() === "tab" && (node as TabNode).getComponent() === "welcome") {
      welcomeNodeId = node.getId();
    }
  });

  model.doAction(
    Actions.addNode(
      {
        type: "tab",
        name: normalizedPanel.name,
        component: "sub-app",
        config: normalizedPanel,
      },
      targetId,
      welcomeNodeId ? DockLocation.CENTER : DockLocation.RIGHT,
      -1,
    ),
  );

  if (welcomeNodeId) {
    model.doAction(Actions.deleteTab(welcomeNodeId));
  }
};

export const normalizeModelJsonForStorage = (model: Model): LayoutJsonConfig => {
  return syncTabStripVisibility(model.toJson() as LayoutJsonConfig);
};

export const normalizeTabSetAttributes = (model: Model) => {
  model.visitNodes((node: Node) => {
    if (node.getType() !== "tabset") return;

    const tabset = node as TabSetNode;
    const shouldShowTabs = tabset.getChildren().length > 1;
    if (tabset.isEnableTabStrip() !== shouldShowTabs) {
      model.doAction(
        Actions.updateNodeAttributes(tabset.getId(), {
          enableTabStrip: shouldShowTabs,
        }),
      );
    }
  });
};
