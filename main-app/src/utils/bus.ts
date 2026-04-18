import mitt, { type Emitter } from 'mitt';

type Events = {
  [key: string]: any;
};

// Polyfill for CommonJS / ESM default export mixups
const createBus = typeof mitt === 'function' ? mitt : (mitt as any).default || mitt;

export const eventBus = createBus() as Emitter<Events>;
