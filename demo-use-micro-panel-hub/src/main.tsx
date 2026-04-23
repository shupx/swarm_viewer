import React, { useRef } from "react";
import ReactDOM from "react-dom/client";
import {
  createSubAppDemoPanel,
  type MicroPanelHubHandle,
  MicroPanelHub,
} from "@shupeixuan/micro-panel-hub";
import "@shupeixuan/micro-panel-hub/styles.css";

function DemoApp() {
  const hubRef = useRef<MicroPanelHubHandle>(null);

  return (
    <div style={{ height: "100vh" }}>
      <button
        type="button"
        onClick={() => {
          console.log("exportLayout", hubRef.current?.exportLayout());
        }}
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 4000,
          padding: "8px 12px",
        }}
      >
        Log Layout
      </button>
      <MicroPanelHub
        ref={hubRef}
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
