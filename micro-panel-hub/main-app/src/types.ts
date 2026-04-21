import type { Emitter } from "mitt";

export type MicroPanelHubEvents = Record<string, unknown>;

export type MicroPanelHubEventBus = Emitter<MicroPanelHubEvents>;

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

export interface MicroPanelHubProps {
  title?: string;
  defaultPanels?: MicroPanelDefinition[];
  defaultCustomAppName?: string;
  defaultRelativeRoute?: string;
  storageKey?: string;
  eventBus?: MicroPanelHubEventBus;
  className?: string;
}

export type MicroPanelHubMountOptions = MicroPanelHubProps;
