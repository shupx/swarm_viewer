
import './public-path';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

let root = null;

function render(props) {
  const { container, eventBus } = props;
  const target = container
    ? container.querySelector('#root') || container
    : document.querySelector('#root');
  
  root = createRoot(target);
  root.render(
    <App eventBus={eventBus} />
  );
}

if (!window.__POWERED_BY_QIANKUN__) {
  render({});
}

export async function bootstrap() {
  console.log('[sub-app-demo] react app bootstraped');
}

export async function mount(props) {
  console.log('[sub-app-demo] props from main framework', props);
  render(props);
}

export async function unmount(props) {
  if (root) {
    root.unmount();
    root = null;
  }
}
