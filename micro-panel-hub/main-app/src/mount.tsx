import { createRoot, type Root } from "react-dom/client";
import App from "./App";

import type {
  MicroPanelHubMountOptions,
  MicroPanelHubProps,
} from "./types";

export function MicroPanelHub(props: MicroPanelHubProps) {
  return <App {...props} />;
}

export interface MountedMicroPanelHub {
  root: Root;
  unmount: () => void;
}

export function mountMicroPanelHub(
  container: Element,
  options: MicroPanelHubMountOptions = {},
): MountedMicroPanelHub {
  const root = createRoot(container);
  root.render(<MicroPanelHub {...options} />);

  return {
    root,
    unmount: () => root.unmount(),
  };
}
