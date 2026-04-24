import { createRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import App from "./App";

import type {
  MicroPanelHubHandle,
  MicroPanelHubMountOptions,
} from "./types";

export const MicroPanelHub = App;

export interface MountedMicroPanelHub {
  root: Root;
  exportLayout: () => ReturnType<MicroPanelHubHandle["exportLayout"]> | null;
  unmount: () => void;
}

export function mountMicroPanelHub(
  container: Element,
  options: MicroPanelHubMountOptions = {},
): MountedMicroPanelHub {
  const root = createRoot(container);
  const hubRef = createRef<MicroPanelHubHandle>();
  root.render(<MicroPanelHub ref={hubRef} {...options} />);

  return {
    root,
    exportLayout: () => hubRef.current?.exportLayout() ?? null,
    unmount: () => root.unmount(),
  };
}
