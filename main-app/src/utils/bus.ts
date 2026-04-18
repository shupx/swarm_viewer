import mitt from 'mitt';

type Events = {
  [key: string]: any;
};

// Polyfill for CommonJS / ESM default export mixups (just in case)
const createBus = typeof mitt === 'function' ? mitt : (mitt as any).default || mitt;

export const eventBus = createBus<Events>();
