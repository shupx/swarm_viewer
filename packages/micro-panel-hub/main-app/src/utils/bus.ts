import mitt, { type Emitter } from "mitt";
import type { MicroPanelHubSharedState } from "../types";

type Events = {
  [key: string]: unknown;
};

type SharedStateListener = (value: unknown) => void;

export const createEventBus = () => mitt<Events>() as Emitter<Events>;

export const eventBus = createEventBus();

export const createSharedState = (): MicroPanelHubSharedState => {
  const values = new Map<string, unknown>();
  const listeners = new Map<string, Set<SharedStateListener>>();

  return {
    get<T = unknown>(key: string): T | undefined {
      return values.get(key) as T | undefined;
    },
    set<T = unknown>(key: string, value: T): void {
      const current = values.get(key);
      if (current === value) {
        return;
      }

      values.set(key, value);
      const keyListeners = listeners.get(key);
      if (!keyListeners) {
        return;
      }

      for (const listener of keyListeners) {
        listener(value);
      }
    },
    subscribe<T = unknown>(key: string, listener: (value: T | undefined) => void): () => void {
      const keyListeners = listeners.get(key) ?? new Set<SharedStateListener>();
      keyListeners.add(listener as SharedStateListener);
      listeners.set(key, keyListeners);

      return () => {
        const currentListeners = listeners.get(key);
        if (!currentListeners) {
          return;
        }

        currentListeners.delete(listener as SharedStateListener);
        if (currentListeners.size === 0) {
          listeners.delete(key);
        }
      };
    },
    getAll(): Record<string, unknown> {
      return Object.fromEntries(values.entries());
    },
  };
};

export const sharedState = createSharedState();
