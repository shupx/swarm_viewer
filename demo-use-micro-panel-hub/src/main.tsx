import React from "react";
import ReactDOM from "react-dom/client";
import {
  createSubAppDemoPanel,
  MicroPanelHub,
} from "@shupeixuan/micro-panel-hub";
import "@shupeixuan/micro-panel-hub/styles.css";

function DemoApp() {
  return (
    <div style={{ height: "100vh" }}>
      <MicroPanelHub
        title="Demo Use Micro Panel Hub"
        defaultCustomAppName="Local Demo App"
        defaultPanels={[createSubAppDemoPanel()]}
        addMenu={{
          panels: [
            createSubAppDemoPanel(),
            createSubAppDemoPanel({
              name: "sub-app-demo (site route)",
              sourceMode: "site-relative-route",
            }),
          ],
          enableCustomApp: true,
          enableRecent: true,
          recentLimit: 8,
        }}
        storageKey="demo_use_micro_panel_hub_layout"
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DemoApp />
  </React.StrictMode>,
);
