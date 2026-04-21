import mitt, { type Emitter } from "mitt";

type Events = {
  [key: string]: unknown;
};

export const createEventBus = () => mitt<Events>() as Emitter<Events>;

export const eventBus = createEventBus();
