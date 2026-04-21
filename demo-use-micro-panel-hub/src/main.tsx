import React from "react";
import ReactDOM from "react-dom/client";
import { MicroPanelHub } from "@shupeixuan/micro-panel-hub";
import "@shupeixuan/micro-panel-hub/styles.css";

function DemoApp() {
  return (
    <div style={{ height: "100vh" }}>
      <MicroPanelHub
        title="Demo Use Micro Panel Hub"
        defaultCustomAppName="Local Demo App"
        defaultPanels={[]}
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
