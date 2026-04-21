import mitt from "mitt";
import type {
  MicroPanelDefinition,
  MicroPanelHubEventBus,
  MicroPanelHubProps,
} from "./types";

export const DEFAULT_TITLE = "Micro Panel Hub";
export const DEFAULT_CUSTOM_APP_NAME = "MyApp";
export const DEFAULT_RELATIVE_ROUTE = "/sub-app-demo/";
export const DEFAULT_STORAGE_KEY = "micro_panel_hub_layout";
export const DEFAULT_LAYOUT_DOWNLOAD_NAME = "micro-panel-hub-layout.json";

export const DEFAULT_PANELS: MicroPanelDefinition[] = [
  {
    name: "sub-app-demo",
    source: {
      type: "page-relative-route",
      value: DEFAULT_RELATIVE_ROUTE,
    },
  },
];

const sharedEventBus = mitt<Record<string, unknown>>();

export const getDefaultEventBus = (): MicroPanelHubEventBus => sharedEventBus;

export const resolveHubProps = (
  props: MicroPanelHubProps = {},
): Required<
  Pick<
    MicroPanelHubProps,
    | "title"
    | "defaultPanels"
    | "defaultCustomAppName"
    | "defaultRelativeRoute"
    | "storageKey"
    | "className"
  >
> & { eventBus: MicroPanelHubEventBus } => ({
  title: props.title ?? DEFAULT_TITLE,
  defaultPanels: props.defaultPanels ?? DEFAULT_PANELS,
  defaultCustomAppName: props.defaultCustomAppName ?? DEFAULT_CUSTOM_APP_NAME,
  defaultRelativeRoute: props.defaultRelativeRoute ?? DEFAULT_RELATIVE_ROUTE,
  storageKey: props.storageKey ?? DEFAULT_STORAGE_KEY,
  className: props.className ?? "",
  eventBus: props.eventBus ?? getDefaultEventBus(),
});
