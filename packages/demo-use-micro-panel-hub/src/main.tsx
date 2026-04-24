import React, { useRef } from "react";
import ReactDOM from "react-dom/client";
import {
  createSubAppDemoPanel,
  type MicroPanelHubHandle,
  MicroPanelHub,
} from "@shupeixuan/micro-panel-hub";
import "@shupeixuan/micro-panel-hub/styles.css";
import { defaultDemoPanel, initialLayout } from "./initialLayout";
import { LogLayoutButton } from "./LogLayoutButton";

function DemoApp() {
  const hubRef = useRef<MicroPanelHubHandle>(null);

  return (
    <div style={{ height: "100vh" }}>
      <LogLayoutButton hubRef={hubRef} />
      <MicroPanelHub
        ref={hubRef}
        title="Demo Use Micro Panel Hub"
        defaultCustomAppName="Local Demo App"
        defaultPanels={[defaultDemoPanel]}
        initialLayout={initialLayout}
        addMenu={{
          panels: [
            defaultDemoPanel,
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
