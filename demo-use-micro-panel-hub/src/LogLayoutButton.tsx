import type { RefObject } from "react";
import type { MicroPanelHubHandle } from "@shupeixuan/micro-panel-hub";

interface LogLayoutButtonProps {
  hubRef: RefObject<MicroPanelHubHandle | null>;
}

export function LogLayoutButton({ hubRef }: LogLayoutButtonProps) {
  return (
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
  );
}
