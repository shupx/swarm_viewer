import React from 'react';
import { createRoot } from 'react-dom/client';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import App from './App';
import './index.css';

let root: any = null;

function render(props: any) {
  const { container, eventBus } = props;
  const target = container
    ? container.querySelector('#root') || container
    : document.querySelector('#root');
  
  root = createRoot(target);
  root.render(
    <React.StrictMode>
      <App eventBus={eventBus} />
    </React.StrictMode>
  );
}

renderWithQiankun({
  mount(props) {
    console.log('[sub-app-demo] mount', props);
    render(props);
  },
  bootstrap() {
    console.log('[sub-app-demo] bootstrap');
  },
  unmount(props) {
    console.log('[sub-app-demo] unmount', props);
    if (root) {
      root.unmount();
      root = null;
    }
  },
  update(props) {
    console.log('[sub-app-demo] update', props);
  },
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({});
}
