import mitt from "mitt";
import type {
  CustomSourceMode,
  MicroPanelAddMenuOptions,
  MicroPanelDefinition,
  MicroPanelHubEventBus,
  MicroPanelHubProps,
  MicroPanelHubTitleLink,
} from "./types";

export const DEFAULT_TITLE = "Micro Panel Hub";
export const DEFAULT_TITLE_LINK: MicroPanelHubTitleLink = {
  href: "https://github.com/shupx/micro-panel-hub",
  target: "_blank",
};
export const DEFAULT_CUSTOM_APP_NAME = "MyApp";
export const DEFAULT_RELATIVE_ROUTE = "/sub-app-demo/";
export const DEFAULT_STORAGE_KEY = "micro_panel_hub_layout";
export const DEFAULT_LAYOUT_DOWNLOAD_NAME = "micro-panel-hub-layout.json";
export const DEFAULT_RECENT_LIMIT = 8;

export const DEFAULT_PANELS: MicroPanelDefinition[] = [];
export const DEFAULT_ADD_MENU: Required<Omit<MicroPanelAddMenuOptions, "panels">> = {
  enableCustomApp: true,
  enableRecent: true,
  recentLimit: DEFAULT_RECENT_LIMIT,
};

export interface SubAppDemoPanelOptions {
  name?: string;
  route?: string;
  sourceMode?: CustomSourceMode;
}

export const createSubAppDemoPanel = ({
  name = "sub-app-demo",
  route = DEFAULT_RELATIVE_ROUTE,
  sourceMode = "page-relative-route",
}: SubAppDemoPanelOptions = {}): MicroPanelDefinition => ({
  name,
  source: {
    type: sourceMode,
    value: route,
  },
});

const sharedEventBus = mitt<Record<string, unknown>>();

export const getDefaultEventBus = (): MicroPanelHubEventBus => sharedEventBus;

export interface ResolvedAddMenuOptions {
  panels: MicroPanelDefinition[];
  enableCustomApp: boolean;
  enableRecent: boolean;
  recentLimit: number;
}

const normalizeTitleLink = (
  titleLink: MicroPanelHubProps["titleLink"],
): MicroPanelHubTitleLink | undefined => {
  if (!titleLink || typeof titleLink !== "object") {
    return undefined;
  }

  const href = typeof titleLink.href === "string" ? titleLink.href.trim() : "";
  if (!href) {
    return undefined;
  }

  return {
    href,
    target: titleLink.target === "_self" ? "_self" : titleLink.target === "_blank" ? "_blank" : undefined,
  };
};

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
> &
  Pick<MicroPanelHubProps, "titleLink"> & {
    addMenu: ResolvedAddMenuOptions;
    eventBus: MicroPanelHubEventBus;
  } => {
  const defaultPanels = props.defaultPanels ?? DEFAULT_PANELS;
  const addMenu = props.addMenu ?? {};
  const recentLimit = Math.max(0, addMenu.recentLimit ?? DEFAULT_ADD_MENU.recentLimit);
  const normalizedTitleLink = normalizeTitleLink(props.titleLink);

  return {
    title: props.title ?? DEFAULT_TITLE,
    titleLink: normalizedTitleLink
      ? { ...DEFAULT_TITLE_LINK, ...normalizedTitleLink }
      : DEFAULT_TITLE_LINK,
    defaultPanels,
    defaultCustomAppName: props.defaultCustomAppName ?? DEFAULT_CUSTOM_APP_NAME,
    defaultRelativeRoute: props.defaultRelativeRoute ?? DEFAULT_RELATIVE_ROUTE,
    storageKey: props.storageKey ?? DEFAULT_STORAGE_KEY,
    className: props.className ?? "",
    addMenu: {
      panels: addMenu.panels ?? defaultPanels,
      enableCustomApp: addMenu.enableCustomApp ?? DEFAULT_ADD_MENU.enableCustomApp,
      enableRecent: addMenu.enableRecent ?? DEFAULT_ADD_MENU.enableRecent,
      recentLimit,
    },
    eventBus: props.eventBus ?? getDefaultEventBus(),
  };
};
