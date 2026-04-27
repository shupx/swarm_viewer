import type { Emitter } from "mitt";
import type { MicroPanelHubShellLayout } from "./layout-types";

export type MicroPanelHubEvents = Record<string, unknown>;

export type MicroPanelHubEventBus = Emitter<MicroPanelHubEvents>;

export interface MicroPanelHubSharedState {
  get<T = unknown>(key: string): T | undefined;
  set<T = unknown>(key: string, value: T): void;
  subscribe<T = unknown>(key: string, listener: (value: T | undefined) => void): () => void;
  getAll(): Record<string, unknown>;
}

export type CustomSourceMode =
  | "absolute-url"
  | "site-relative-route"
  | "page-relative-route";

export type MicroAppSource =
  | { type: "absolute-url"; value: string }
  | { type: "site-relative-route"; value: string }
  | { type: "page-relative-route"; value: string };

export interface MicroPanelDefinition {
  name: string;
  source?: MicroAppSource;
  entry?: string;
}

export interface MicroPanelHubTitleLink {
  href: string;
  target?: "_blank" | "_self";
}

export interface MicroPanelAddMenuOptions {
  panels?: MicroPanelDefinition[];
  enableCustomApp?: boolean;
  enableRecent?: boolean;
  recentLimit?: number;
}

export interface MicroPanelHubProps {
  title?: string;
  titleLink?: MicroPanelHubTitleLink;
  defaultPanels?: MicroPanelDefinition[];
  addMenu?: MicroPanelAddMenuOptions;
  initialLayout?: MicroPanelHubShellLayout;
  defaultCustomAppName?: string;
  defaultRelativeRoute?: string;
  storageKey?: string;
  eventBus?: MicroPanelHubEventBus;
  sharedState?: MicroPanelHubSharedState;
  className?: string;
}

export type MicroPanelHubMountOptions = MicroPanelHubProps;

export interface MicroPanelHubHandle {
  exportLayout: () => MicroPanelHubShellLayout;
}
