export interface MicroPanelHubLayoutNode {
  type?: string;
  id?: string;
  component?: string;
  name?: string;
  weight?: number;
  enableTabStrip?: boolean;
  config?: {
    name: string;
    source?: {
      type: "absolute-url" | "site-relative-route" | "page-relative-route";
      value: string;
    };
    entry?: string;
  };
  children?: MicroPanelHubLayoutNode[];
}

export interface MicroPanelHubLayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MicroPanelHubLayoutPopout {
  layout: MicroPanelHubLayoutNode;
  rect: MicroPanelHubLayoutRect;
}

export interface MicroPanelHubLayoutJson {
  global?: Record<string, unknown>;
  layout?: MicroPanelHubLayoutNode;
  borders?: MicroPanelHubLayoutNode[];
  popouts?: Record<string, MicroPanelHubLayoutPopout>;
}

export interface MicroPanelHubWorkspaceTab {
  id: string;
  title: string;
  layout: MicroPanelHubLayoutJson;
}

export interface MicroPanelHubShellLayout {
  version: number;
  topBarCollapsed: boolean;
  activeTopTabId: string;
  tabs: MicroPanelHubWorkspaceTab[];
}

export type LayoutJsonConfig = MicroPanelHubLayoutJson;
