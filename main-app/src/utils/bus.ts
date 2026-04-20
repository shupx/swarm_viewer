import mitt, { type Emitter } from 'mitt';

type Events = {
  [key: string]: unknown;
};

export const eventBus = mitt<Events>() as Emitter<Events>;
