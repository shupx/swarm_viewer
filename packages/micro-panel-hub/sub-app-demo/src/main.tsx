
import './public-path';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

interface EventBusLike {
  on: (type: string, handler: (event: unknown) => void) => void;
  off: (type: string, handler: (event: unknown) => void) => void;
  emit: (type: string, event?: unknown) => void;
}

interface SharedStateLike {
  get: <T = unknown>(key: string) => T | undefined;
  set: <T = unknown>(key: string, value: T) => void;
  subscribe: <T = unknown>(key: string, listener: (value: T | undefined) => void) => () => void;
  getAll: () => Record<string, unknown>;
}

interface QiankunProps {
  container?: Element | Document;
  eventBus?: EventBusLike;
  sharedState?: SharedStateLike;
}

let root: ReturnType<typeof createRoot> | null = null;

function render(props: QiankunProps) {
  const { container, eventBus, sharedState } = props;
  const target = container
    ? container.querySelector('#root') || container
    : document.querySelector('#root');

  if (!target) {
    throw new Error('[sub-app-demo] root container not found');
  }
  
  root = createRoot(target);
  root.render(
    <App eventBus={eventBus} sharedState={sharedState} />
  );
}

if (!window.__POWERED_BY_QIANKUN__) {
  render({});
}

export async function bootstrap() {
  console.log('[sub-app-demo] react app bootstraped');
}

export async function mount(props: QiankunProps) {
  console.log('[sub-app-demo] props from main framework', props);
  render(props);
}

export async function unmount() {
  if (root) {
    root.unmount();
    root = null;
  }
}
