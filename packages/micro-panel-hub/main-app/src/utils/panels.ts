import type { MicroAppSource, MicroPanelDefinition } from "../types";
import { resolvePageRelativeRouteUrl, resolveSiteRelativeRouteUrl } from "./path";

export const normalizeRelativeRoute = (value: string) => {
  if (!value) return "/";
  let normalized = value.trim();
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  const lastSegment = normalized.split("/").filter(Boolean).pop() ?? "";
  const looksLikeFile = lastSegment.includes(".");
  if (!normalized.endsWith("/") && !looksLikeFile) {
    normalized = `${normalized}/`;
  }

  return normalized;
};

export const normalizeAbsoluteUrl = (value: string) => {
  const normalizedUrl = new URL(value);
  const pathname = normalizedUrl.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop() ?? "";
  const looksLikeFile = lastSegment.includes(".");

  if (!pathname.endsWith("/") && !looksLikeFile) {
    normalizedUrl.pathname = `${pathname}/`;
  }

  return normalizedUrl.toString();
};

export const resolveEntryFromSource = (source: MicroAppSource) => {
  if (source.type === "site-relative-route") {
    return resolveSiteRelativeRouteUrl(normalizeRelativeRoute(source.value));
  }

  if (source.type === "page-relative-route") {
    return resolvePageRelativeRouteUrl(normalizeRelativeRoute(source.value));
  }

  return normalizeAbsoluteUrl(source.value);
};

export const normalizePanelDefinition = (
  panel: MicroPanelDefinition,
): MicroPanelDefinition => {
  if (panel.source) {
    const normalizedSource =
      panel.source.type === "absolute-url"
        ? { type: "absolute-url" as const, value: normalizeAbsoluteUrl(panel.source.value) }
        : { type: panel.source.type, value: normalizeRelativeRoute(panel.source.value) };

    return {
      ...panel,
      name: panel.name.trim(),
      source: normalizedSource,
      entry: resolveEntryFromSource(normalizedSource),
    };
  }

  if (panel.entry) {
    const normalizedEntry = normalizeAbsoluteUrl(panel.entry);
    return {
      ...panel,
      name: panel.name.trim(),
      source: { type: "absolute-url", value: normalizedEntry },
      entry: normalizedEntry,
    };
  }

  return {
    ...panel,
    name: panel.name.trim(),
  };
};

export const getPanelDefinitionIdentity = (panel: MicroPanelDefinition) => {
  const normalized = normalizePanelDefinition(panel);
  if (normalized.source) {
    return `${normalized.name}::${normalized.source.type}::${normalized.source.value}`;
  }

  if (normalized.entry) {
    return `${normalized.name}::entry::${normalized.entry}`;
  }

  return `${normalized.name}::unknown`;
};
