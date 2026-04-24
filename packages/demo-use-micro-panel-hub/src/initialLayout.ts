import {
  createSubAppDemoPanel,
  type MicroPanelDefinition,
  type MicroPanelHubShellLayout,
} from "@shupeixuan/micro-panel-hub";

export const defaultDemoPanel: MicroPanelDefinition = createSubAppDemoPanel();

export const initialLayout: MicroPanelHubShellLayout = {
  version: 2,
  topBarCollapsed: false,
  activeTopTabId: "tab-1",
  tabs: [
    {
      id: "tab-1",
      title: "Tab 1",
      layout: {
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
          type: "column",
          id: "main-column",
          weight: 100,
          children: [
            {
              type: "tabset",
              id: "top_tabset",
              weight: 50,
              enableTabStrip: false,
              children: [
                {
                  type: "tab",
                  name: defaultDemoPanel.name,
                  component: "sub-app",
                  config: defaultDemoPanel,
                },
              ],
            },
            {
              type: "tabset",
              id: "bottom_tabset",
              weight: 50,
              enableTabStrip: true,
              children: [
                {
                  type: "tab",
                  name: `${defaultDemoPanel.name} A`,
                  component: "sub-app",
                  config: defaultDemoPanel,
                },
                {
                  type: "tab",
                  name: `${defaultDemoPanel.name} B`,
                  component: "sub-app",
                  config: defaultDemoPanel,
                },
              ],
            },
          ],
        },
      },
    },
  ],
};
